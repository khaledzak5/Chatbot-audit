import { google } from 'googleapis';
import PDFParser from 'pdf2json';
import mammoth from 'mammoth';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Initialize Google Drive API
const drive = google.drive({
  version: 'v3',
  key: GOOGLE_API_KEY,
});

// Function to split text into chunks
function splitTextIntoChunks(text, fileName, chunkSize = 2000, overlap = 200) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(i + chunkSize, text.length);
    chunks.push({
      text: text.substring(i, end),
      source: fileName,
    });
    i += chunkSize - overlap;
    if (i < 0) i = end; // Ensure progress
  }
  return chunks;
}

export async function listDocuments() {
  try {
    const response = await drive.files.list({
      q: `'${GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType,webViewLink)',
    });

    console.log('Found documents:', response.data.files?.length || 0);
    return response.data.files || [];
  } catch (error) {
    console.error('Error listing documents from Google Drive:', error);
    throw error;
  }
}

async function getFileContent(fileId, mimeType) {
  if (mimeType === 'application/vnd.google-apps.document') {
    const exportResponse = await drive.files.export(
      { fileId, mimeType: 'application/pdf' },
      { responseType: 'arraybuffer' }
    );
    return Buffer.from(exportResponse.data);
  } else {
    const response = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'arraybuffer' }
    );
    return Buffer.from(response.data);
  }
}

export async function extractTextFromDocuments() {
  try {
    const documents = await listDocuments();
    let allTextChunks = [];

    console.log(`Processing ${documents.length} documents...`);

    for (const doc of documents) {
      if (!doc.id || !doc.name || !doc.mimeType) continue;

      try {
        console.log(`Processing: ${doc.name} (${doc.name})`);
        const fileBuffer = await getFileContent(doc.id, doc.mimeType);
        
        let text = '';
        const effectiveMimeType = doc.mimeType === 'application/vnd.google-apps.document' ? 'application/pdf' : doc.mimeType;


        if (effectiveMimeType === 'application/pdf') {
          const pdfParser = new PDFParser(null, 1);
          
          await new Promise((resolve, reject) => {
              pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
              pdfParser.on("pdfParser_dataReady", () => resolve());
              pdfParser.parseBuffer(fileBuffer);
          });
          
          text = pdfParser.getRawTextContent();

        } else if (effectiveMimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml') {
          const { value } = await mammoth.extractRawText({ buffer: fileBuffer });
          text = value;
        } else if (effectiveMimeType.startsWith('text/')) {
           text = fileBuffer.toString('utf-8');
        } 
        else {
          console.warn(`Unsupported mime type: ${doc.mimeType} for file ${doc.name}. Skipping.`);
          continue;
        }

        if (text && text.trim()) {
            const chunks = splitTextIntoChunks(text, doc.name);
            console.log(`Extracted ${chunks.length} chunks from ${doc.name}`);
            allTextChunks = allTextChunks.concat(chunks);
        } else {
            console.warn(`No text extracted from ${doc.name}.`);
        }

      } catch (error) {
        console.error(`Error processing document ${doc.name}:`, error.message);
      }
    }

    console.log(`Created ${allTextChunks.length} total text chunks`);
    return allTextChunks;
  } catch (error) {
    console.error('Error extracting text from documents:', error);
    throw error;
  }
}
