// Test script for enhanced audit chatbot
import fetch from 'node-fetch';

const SERVER_URL = 'http://localhost:3001';

// Test questions in different dialects and languages
const testQuestions = [
  // Standard Arabic questions
  "ما هي خطوات التدقيق الداخلي؟",
  "كيف يتم تقييم المخاطر في التدقيق؟",
  "ما هي الضوابط الداخلية؟",
  
  // Colloquial Arabic questions
  "ازاي بيعملوا التدقيق الداخلي؟",
  "ايه هي المخاطر في التدقيق؟",
  "ايه هي الضوابط الداخلية؟",
  
  // Mixed Arabic-English questions
  "ما هي audit planning steps؟",
  "كيف يتم risk assessment؟",
  "ما هي internal controls؟",
  
  // English questions
  "What are the steps of internal audit?",
  "How to assess risks in auditing?",
  "What are internal controls?",
  
  // Questions with different wordings
  "عايز اعرف ازاي بيعملوا المراجعة الداخلية",
  "محتاج اعرف المخاطر في التدقيق",
  "عندي سؤال عن الضوابط الداخلية",
  
  // Non-audit questions (should be rejected)
  "ما هو الطقس اليوم؟",
  "كيف تطبخ الكشري؟",
  "What is the weather like?"
];

async function testQuestion(question, index) {
  try {
    console.log(`\n=== Test ${index + 1}: "${question}" ===`);
    
    const response = await fetch(`${SERVER_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: question }),
    });

    const data = await response.json();
    
    console.log('Response:', data.response.substring(0, 200) + '...');
    console.log('Model:', data.model);
    console.log('Sources:', data.sources);
    console.log('Scores:', data.scores);
    
    return data;
  } catch (error) {
    console.error(`Error testing question ${index + 1}:`, error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Enhanced Audit Chatbot Tests...\n');
  
  // Test server health first
  try {
    const healthResponse = await fetch(`${SERVER_URL}/health`);
    if (healthResponse.ok) {
      console.log('✅ Server is healthy');
    } else {
      console.log('❌ Server health check failed');
      return;
    }
  } catch (error) {
    console.log('❌ Cannot connect to server:', error.message);
    return;
  }
  
  // Test each question
  for (let i = 0; i < testQuestions.length; i++) {
    await testQuestion(testQuestions[i], i);
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎉 All tests completed!');
}

// Run the tests
runTests().catch(console.error); 