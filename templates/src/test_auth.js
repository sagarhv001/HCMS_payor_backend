// Simple test to verify authentication API
const API_BASE_URL = 'http://127.0.0.1:8000/api';

async function testAuthentication() {
  console.log('Testing authentication...');
  
  try {
    const url = `${API_BASE_URL}/login/`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@bcbs.com',
        password: 'bcbs_secure_2024'
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    console.log('Response headers:', [...response.headers.entries()]);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Response data:', data);
    return data;

  } catch (error) {
    console.error('Authentication test failed:', error);
    throw error;
  }
}

// Run the test
testAuthentication()
  .then(data => console.log('Test successful:', data))
  .catch(error => console.error('Test failed:', error));