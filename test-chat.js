import fetch from 'node-fetch';

async function testChat(message) {
  try {
    console.log(`\n=== Testing: ${message} ===`);
    
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message
      })
    });

    const data = await response.json();
    console.log('Response:', data.response);
    console.log('Model:', data.model);
    console.log('Sources:', data.sources);
    console.log('Scores:', data.scores);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test multiple questions
async function runTests() {
  await testChat('ما هو COBIT 5؟');
  await testChat('ما هي خطوات إعداد خطة التدقيق السنوية؟');
  await testChat('ما هي الضوابط الداخلية الفعالة؟');
  await testChat('كيف يتم تقييم المخاطر؟');
  await testChat('ما هي مؤشرات الأداء للتدقيق الداخلي؟');
  await testChat('ما هو الطقس اليوم؟'); // سؤال خارج النطاق
}

runTests(); 