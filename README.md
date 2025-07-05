# AuditGPT Chatbot - Retrieval-Augmented Generation (RAG) System

This project implements an Arabic/English bilingual internal audit chatbot using Google's Gemini API, designed to answer questions based on a defined set of internal audit documents. It leverages a Retrieval-Augmented Generation (RAG) workflow to provide contextually relevant and detailed answers.

## Project Overview & Key Features

*   **Bilingual Support:** Understands and responds in both Arabic and English.
*   **Contextual Answers:** Provides answers based on a pre-defined set of internal audit documents.
*   **Gemini API Integration:** Utilizes Gemini's powerful generative models for sophisticated responses.
*   **RAG Workflow:** Incorporates a basic RAG (Retrieval-Augmented Generation) mechanism to retrieve relevant document chunks based on user queries.
*   **Local Document Fallback:** Includes pre-defined comprehensive document chunks for immediate local responses, even if external services (like Pinecone or direct Google Drive parsing) are not fully integrated or encounter issues.
*   **Flexible Deployment:** Backend runs on Node.js (Express) and frontend uses Vite (React/TypeScript).

## Conversation Summary: Journey to a Functional RAG Chatbot

This `README` summarizes the entire development process of this AuditGPT Chatbot, from initial setup to implementing RAG and improving response quality.

### 1. Initial Gemini API Connection

*   **Problem:** User requested to connect the AuditGPT chatbot to the Gemini API using a provided API key.
*   **Solution:**
    *   Identified the existing chatbot structure.
    *   Modified the backend (`server.js`) to call the Gemini API directly.
    *   **CORS Issues:** Initially, attempted a proxy in Vite config, but this caused connection problems.
    *   **Proxy Solution:** Created a local Express server (`server.js`) to act as a proxy for Gemini API calls, effectively bypassing CORS issues and securing the API key by keeping it server-side.
    *   Frontend was updated to call this local Express server.

### 2. Module and API Stability Improvements

*   **Problem:** Encountered module import issues and unstable Gemini API responses.
*   **Solution:**
    *   **ES Modules:** Converted the server to ES modules.
    *   **`node-fetch` Removal:** Replaced `node-fetch` dependency with Node.js built-in `fetch` for cleaner module management.
    *   **Gemini Model Endpoint:** Corrected the Gemini API endpoint to use valid model names (`gemini-1.5-pro`).
    *   **API Key Issues/Model Availability:** Implemented a fallback mechanism in `server.js` to try multiple Gemini models (though currently hardcoded to `gemini-1.5-pro` with a local fallback if Gemini fails or quota is exceeded).
    *   Added a `/test-api` endpoint for quick Gemini API connectivity checks.

### 3. Bilingual Support Enhancement

*   **Goal:** Enable the chatbot to detect Arabic input and respond accordingly.
*   **Implementation:**
    *   Logic was added to detect Arabic vs. English input.
    *   Chatbot responses were designed to be in Arabic or English based on detection.
    *   Frontend (`src/App.tsx`, `src/components/ChatBubble.tsx`, etc.) was updated to support bilingual placeholders and messages for a better user experience.

### 4. Retrieval-Augmented Generation (RAG) Workflow

*   **Core Request:** User asked for a RAG workflow: vectorize questions, query for relevant document chunks, and send a strict prompt with context to Gemini.
*   **Implementation:**
    *   Installed necessary libraries (though Pinecone integration was later simplified to local chunks for stability).
    *   Created (or planned for) Pinecone, Google Drive, and embeddings services (`src/lib/pinecone.js`, `src/lib/googleDrive.js`, `src/lib/embeddings.js`).
    *   **Current State:** The `server.js` now implements a **simplified RAG workflow** using pre-defined `DOCUMENT_CHUNKS` (Arabic text summaries based on the user's Google Drive files) instead of a live Pinecone index. This ensures immediate functionality without external dependencies for document retrieval.
    *   Frontend (`src/components/MessageBubble.tsx`) was updated to display sources of information for each response.
    *   Added a `/setup-documents` endpoint (though its current function is limited due to local chunk usage).

### 5. Response Quality and Colloquial Arabic Understanding

*   **Problem:** Chatbot sometimes failed to understand colloquial Arabic questions (e.g., "قولي ازاي اخطط للمراجعه الداخليه") and responses were often short or generic, directly copied from pre-defined summaries.
*   **Solution Implemented:**
    *   Expanded the `arabicKeywords` list in `server.js` (`findRelevantChunks` function) to include more colloquial terms and synonyms. This significantly improves the chatbot's ability to identify relevant content even with informal phrasing.
    *   Increased the `temperature` parameter in the Gemini API call (`server.js`) to `0.7`. This encourages Gemini to generate longer, more detailed, and elaborate explanations rather than concise summaries.
*   **Next Important Step (Pending):** To achieve truly "detailed, conscientious explanations" ("يشرح بضمير"), the system needs to:
    *   **Full Document Parsing:** Implement robust parsing of actual PDF/DOCX files from Google Drive using a suitable library (e.g., `pdf-parse`, `mammoth.js`) to extract the full text content.
    *   **Dynamic Chunking & Embedding:** Break down the full document texts into smaller, meaningful chunks, generate embeddings for them, and then either:
        *   Store these embeddings in a vector database (like Pinecone) for efficient semantic search.
        *   Or, maintain a larger, dynamically generated set of chunks in memory if the document set is small.
    *   This will allow the RAG system to pull comprehensive, contextually rich information, enabling Gemini to generate much more in-depth and nuanced responses.

## Current Configuration (from `server.js` & `src/lib/googleDrive.js`)

*   **Backend Server Port:** `3001`
*   **Gemini API Key:** `AIzaSyDf63KW3zVhr5n4viV8IDhoUHEOQiho4b4`
*   **Google Drive Folder ID:** `1in9NbiYBeI-rWM_OFjCyYVmJikRfo3UC`
*   **Gemini Model Used:** `gemini-1.5-pro` (with local fallback if API call fails)
*   **Gemini Temperature:** `0.7` (for longer, more detailed responses)

## How to Run the Project

Follow these steps to get the AuditGPT Chatbot running:

1.  **Ensure Node.js and npm/yarn are installed.**

2.  **Start the Backend Server:**
    *   Navigate to the project root directory in your terminal: `cd D:\auditgpt-conversations-hub-main`
    *   Run the backend:
        ```bash
        node server.js
        ```
    *   (The AI assistant typically runs this in the background for you, but this is the manual command.)
    *   You should see output like: `AuditGPT RAG server running on http://localhost:3001`

3.  **Start the Frontend Application:**
    *   Ensure you are still in the project root directory.
    *   Install frontend dependencies (if not already done): `npm install` (or `yarn install`)
    *   Run the frontend:
        ```bash
        npx vite --port 5173
        ```
    *   You should see output indicating the frontend server is running, typically on `http://localhost:5173`.

4.  **Access the Chatbot:**
    *   Open your web browser and navigate to: `http://localhost:5173`
    *   You can now start interacting with the AuditGPT Chatbot.

## Testing Endpoints

You can test the backend server using `curl` or `Invoke-RestMethod` (PowerShell):

*   **Health Check:**
    ```bash
    curl http://localhost:3001/health
    # Or in PowerShell: Invoke-RestMethod -Uri 'http://localhost:3001/health'
    ```
    Expected output: `{"status":"OK","message":"AuditGPT RAG server is running"}`

*   **Test Gemini API Connectivity:**
    ```bash
    curl http://localhost:3001/test-api
    # Or in PowerShell: Invoke-RestMethod -Uri 'http://localhost:3001/test-api'
    ```
    This will show if your Gemini API key is valid and can connect to Google's models.

*   **Test Chat Endpoint (Example with Arabic question):**
    ```bash
    curl -X POST http://localhost:3001/api/chat -H "Content-Type: application/json" -d "{"message":"ما هو COBIT 5؟"}"
    # Or in PowerShell: Invoke-RestMethod -Uri 'http://localhost:3001/api/chat' -Method POST -ContentType 'application/json' -Body '{"message":"ما هو COBIT 5؟"}'
    ```
    You should receive a detailed response from the chatbot.

## Future Enhancements (Critical for Detailed Responses)

The most significant improvement for getting truly comprehensive and detailed explanations will involve:

1.  **Real-time Document Parsing:** Instead of hardcoded summaries, integrate libraries to parse PDF and DOCX files directly from Google Drive.
2.  **Advanced Chunking:** Implement intelligent chunking strategies to break down large documents into coherent, context-rich segments.
3.  **Vector Database (Pinecone) Re-integration:** Store the dynamically generated document embeddings in Pinecone (or a similar vector DB) for efficient and accurate semantic retrieval of context. This moves from keyword matching to meaning-based retrieval, which is crucial for nuanced answers.

This will ensure the chatbot has access to the full depth of your documents and can generate highly informed and extensive responses.
