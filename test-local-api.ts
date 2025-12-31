
async function testLocalRoute() {
  try {
    console.log('Testing local API route: http://localhost:8080/api/support/send-email');
    const response = await fetch('http://localhost:8080/api/support/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'garvanand03@gmail.com',
        subject: 'Local API Test',
        html: '<p>This test ensures the local API route correctly handles and forwards the request to Resend.</p>',
      }),
    });

    const data = await response.json();
    console.log('Local API Response status:', response.status);
    console.log('Local API Response data:', data);
  } catch (err) {
    console.error('Local Route Test Error:', err);
  }
}

testLocalRoute();
