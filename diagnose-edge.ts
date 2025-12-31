
async function test() {
  const url = 'https://nwnexkbndpngmqfqnogh.supabase.co/functions/v1/send-email';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53bmV4a2JuZHBuZ21xZnFub2doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTY1ODQsImV4cCI6MjA4MDgzMjU4NH0.rSuPucVNftr9HkxiV3uXdBY9qPk2Fd8HRdiVDV8quBE';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`
      },
      body: JSON.stringify({
        to: 'garvanand03@gmail.com',
        subject: 'Diagnostic Test from Orchids',
        html: '<p>This is a diagnostic test to verify the Edge Function.</p>'
      })
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
