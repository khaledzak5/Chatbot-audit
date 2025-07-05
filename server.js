import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateEmbedding, generateEmbeddings } from './src/lib/embeddings.js';
import { extractTextFromDocuments } from './src/lib/googleDrive.js';
import { enhanceQuestionUnderstanding, createEnhancedSearchQuery } from './src/lib/languageProcessor.js';
import { getGeminiResponse } from './src/lib/gemini.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

let DOCUMENT_CHUNKS = [];

async function initializeDocumentChunks() {
    try {
        console.log('Initializing document chunks...');
        const textChunks = await extractTextFromDocuments();
        if (textChunks && textChunks.length > 0) {
            console.log(`Generating embeddings for ${textChunks.length} text chunks...`);
            DOCUMENT_CHUNKS = await generateEmbeddings(textChunks);
            console.log('Document chunks and embeddings are ready.');
        } else {
            console.error('No text chunks were extracted from Google Drive. The knowledge base will be empty.');
        }
    } catch (error) {
        console.error('Failed to initialize document chunks:', error);
    }
}


// Helper function to calculate cosine similarity between two vectors
function calculateCosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

// Function to find relevant chunks using semantic similarity
async function findRelevantChunks(questionEmbedding, chunks, topK = 5) {
  const scoredChunks = chunks.map(chunk => {
    if (!chunk.embedding) {
      console.warn('Chunk missing embedding, assigning score 0:', chunk.text.substring(0, 50) + '...');
      return { ...chunk, score: 0 };
    }
    const score = calculateCosineSimilarity(questionEmbedding, chunk.embedding);
    return { ...chunk, score };
  });

  return scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter(chunk => chunk.score > 0.1); // Increased threshold for better quality matches
}

// Function to detect if question is related to internal audit (enhanced)
function isAuditRelated(question) {
  const analysis = enhanceQuestionUnderstanding(question);
  return analysis.isAuditRelated;
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Processing question:', message);

    // Enhanced question analysis
    const questionAnalysis = createEnhancedSearchQuery(message);
    console.log('Question analysis:', questionAnalysis);

    // Check if the question is audit-related
    if (!questionAnalysis.isAuditRelated) {
      return res.json({
        response: 'عذراً، هذا الشات بوت متخصص فقط في الإجابة على الأسئلة المتعلقة بالتدقيق الداخلي. يرجى طرح سؤال متعلق بمجال التدقيق الداخلي أو المراجعة الداخلية.',
        model: 'gemini-pro',
        sources: [],
        scores: []
      });
    }

    // Generate embedding for the enhanced query
    console.log('Step 1: Generating embedding for the enhanced query...');
    let relevantChunks = [];
    let contextText = '';
    let geminiResponse = '';
    try {
      const questionEmbedding = await generateEmbedding(questionAnalysis.enhancedQuery);
      // Step 2: Find relevant chunks using semantic similarity
      console.log('Step 2: Finding relevant document chunks...');
      relevantChunks = await findRelevantChunks(questionEmbedding, DOCUMENT_CHUNKS, 5);
      if (relevantChunks.length > 0) {
        contextText = relevantChunks.map((chunk, index) => 
          `[${index + 1}] ${chunk.text} (المصدر: ${chunk.source})`
        ).join('\n\n');
      }
    } catch (err) {
      console.warn('Could not get relevant chunks, will answer using Gemini only.');
    }

    // Prompt for Gemini: always answer using Gemini, even if no context
    const prompt = contextText
      ? `السياق من المستندات:\n${contextText}\n\nسؤال المستخدم: "${questionAnalysis.enhancedQuery}"\nيرجى تقديم إجابة شاملة ومفصلة وشرح موسع بناءً على السياق أعلاه.`
      : `سؤال المستخدم: "${questionAnalysis.enhancedQuery}"\nيرجى تقديم إجابة شاملة ومفصلة وشرح موسع على قدر الإمكان.`;
    
    // Step 4: Get response from Gemini
    console.log('Step 4: Getting response from Gemini...');
    geminiResponse = await getGeminiResponse(prompt);

    // Step 5: Send response to the client
    res.json({
      response: geminiResponse,
      model: 'gemini-pro',
      sources: relevantChunks.map(c => c.source),
      scores: relevantChunks.map(c => c.score),
    });

  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Failed to process your request' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  initializeDocumentChunks();
});