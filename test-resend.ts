
import { Resend } from 'resend';

const resend = new Resend('re_czsHNDnN_KDd8aPVZYWw5zJfX55mo1qQD');

async function test() {
  try {
    console.log('Attempting to send test email...');
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'garvanand03@gmail.com',
      subject: 'Resend Test from Elder AI',
      html: '<p>If you see this, Resend is working correctly!</p>',
    });

    if (error) {
      console.error('Resend Error:', error);
    } else {
      console.log('Resend Success:', data);
    }
  } catch (err) {
    console.error('Catch Error:', err);
  }
}

test();
