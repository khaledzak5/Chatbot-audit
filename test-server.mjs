async function testServer() {
  try {
    console.log('Testing server health...');
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('Health check response:', healthData);

    console.log('\nTesting chat endpoint...');
    const chatResponse = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello, can you help me with audit planning?'
      }),
    });

    const chatData = await chatResponse.json();
    console.log('Chat response:', chatData);
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testServer(); 