import { NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function POST(req: Request) {
  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: 'Resend API key not configured' }, { status: 500 });
  }

    try {
      const { to, subject, html, from = 'onboarding@resend.dev' } = await req.json();

      console.log('Sending email via Resend API...', { to, subject, from });

      // Resend free tier is strict: from address must be exactly 'onboarding@resend.dev' 
      // or a verified domain. Adding a display name often fails on free accounts.
      const fromAddress = from === 'onboarding@resend.dev' ? 'onboarding@resend.dev' : `MemoryFriend Support <${from}>`;

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [to],
          subject,
          html,
        }),
      });

      const data = await response.json();
      console.log('Resend API Response:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send email');
      }

      return NextResponse.json(data);
    } catch (error: any) {
      console.error('Email sending error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

}
