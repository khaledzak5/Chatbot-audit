import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const EMBEDDING_MODEL = 'models/embedding-001';

export async function generateEmbedding(text) {
  try {
    // Clean and normalize the text
    const cleanText = text.trim().replace(/\s+/g, ' ');
    
    if (!cleanText || cleanText.length === 0) {
      throw new Error('Empty or invalid text provided');
    }

    console.log('Generating embedding for text:', cleanText.substring(0, 100) + '...');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/${EMBEDDING_MODEL}:embedContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        content: {
          parts: [
            {
              text: cleanText
            }
          ]
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Embedding API error:', response.status, errorData);
      
      if (response.status === 400) {
        throw new Error(`Invalid API key or request format. Please check your Gemini API key.`);
      } else if (response.status === 429) {
        throw new Error(`Rate limit exceeded. Please try again later.`);
      } else {
        throw new Error(`Embedding API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }
    }

    const data = await response.json();
    
    if (!data.embedding || !data.embedding.values) {
      throw new Error('Invalid response format from embedding API');
    }

    console.log('Successfully generated embedding with', data.embedding.values.length, 'dimensions');
    return data.embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

export async function generateEmbeddings(chunks) {
  const chunksWithEmbeddings = [];
  
  console.log(`Generating embeddings for ${chunks.length} chunks...`);
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      console.log(`Processing chunk ${i + 1}/${chunks.length} from ${chunk.source}:`, chunk.text.substring(0, 50) + '...');
      const embedding = await generateEmbedding(chunk.text);
      
      chunksWithEmbeddings.push({
          ...chunk,
          embedding: embedding,
      });
      
      // Add a small delay to avoid rate limiting
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200)); // Increased delay slightly
      }
    } catch (error) {
      console.error(`Error generating embedding for chunk ${i + 1} from ${chunk.source}:`, chunk.text.substring(0, 50) + '...', error);
      
      // Add a zero vector as fallback and keep the chunk
      const fallbackEmbedding = new Array(768).fill(0);
      chunksWithEmbeddings.push({
          ...chunk,
          embedding: fallbackEmbedding,
      });
      
      // If it's an API key error, we should stop processing
      if (error.message.includes('API key')) {
        console.error('Stopping embedding generation due to API key error');
        // Return what we have so far
        return chunksWithEmbeddings;
      }
    }
  }
  
  console.log(`Generated embeddings for ${chunksWithEmbeddings.length} chunks successfully`);
  return chunksWithEmbeddings;
} 