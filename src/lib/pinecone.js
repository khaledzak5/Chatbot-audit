import { Pinecone } from '@pinecone-database/pinecone';

const PINECONE_API_KEY = process.env.PINECONE_API_KEY || 'your-pinecone-api-key';
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'auditgpt-docs';

let pinecone;

export async function initializePinecone() {
  try {
    pinecone = new Pinecone({
      apiKey: PINECONE_API_KEY,
    });
    console.log('Pinecone initialized successfully');
    return pinecone;
  } catch (error) {
    console.error('Failed to initialize Pinecone:', error);
    throw error;
  }
}

export async function queryPinecone(questionVector, topK = 3) {
  try {
    if (!pinecone) {
      await initializePinecone();
    }

    const index = pinecone.index(PINECONE_INDEX_NAME);
    
    const queryResponse = await index.query({
      vector: questionVector,
      topK: topK,
      includeMetadata: true,
    });

    return queryResponse.matches.map(match => ({
      text: match.metadata.text,
      score: match.score,
      source: match.metadata.source
    }));
  } catch (error) {
    console.error('Error querying Pinecone:', error);
    throw error;
  }
}

export async function upsertDocuments(documents) {
  try {
    if (!pinecone) {
      await initializePinecone();
    }

    const index = pinecone.index(PINECONE_INDEX_NAME);
    
    const vectors = documents.map((doc, i) => ({
      id: `doc_${i}_${Date.now()}`,
      values: doc.vector,
      metadata: {
        text: doc.text,
        source: doc.source,
        chunkIndex: i
      }
    }));

    await index.upsert(vectors);
    console.log(`Upserted ${vectors.length} documents to Pinecone`);
  } catch (error) {
    console.error('Error upserting documents to Pinecone:', error);
    throw error;
  }
} 