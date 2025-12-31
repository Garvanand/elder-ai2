
async function testEdgeFunction() {
  const url = 'https://nwnexkbndpngmqfqnogh.supabase.co/functions/v1/generate-summary';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53bmV4a2JuZHBuZ21xZnFub2doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTY1ODQsImV4cCI6MjA4MDgzMjU4NH0.rSuPucVNftr9HkxiV3uXdBY9qPk2Fd8HRdiVDV8quBE';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'garvanand03@gmail.com',
        subject: 'Diagnostic Test',
        html: '<p>Testing from diagnostic script</p>'
      })
    });

    const status = response.status;
    const text = await response.text();
    console.log(`Status: ${status}`);
    console.log(`Response: ${text}`);
  } catch (error) {
    console.error(`Fetch error: ${error.message}`);
  }
}

testEdgeFunction();
