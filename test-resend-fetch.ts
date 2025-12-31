
const RESEND_API_KEY = 're_czsHNDnN_KDd8aPVZYWw5zJfX55mo1qQD';

async function test() {
  try {
    console.log('Attempting to send test email via fetch...');
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: ['garvanand03@gmail.com'],
        subject: 'Fetch Test from Elder AI',
        html: '<p>Testing Resend with direct fetch.</p>',
      }),
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
  } catch (err) {
    console.error('Fetch Error:', err);
  }
}

test();
