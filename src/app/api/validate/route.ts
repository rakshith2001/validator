import { NextRequest, NextResponse } from 'next/server';
import { createEmail } from "@/app/lib/actions/email.action";

interface EmailValidationResponse {
  deliverability: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { email } = await request.json();
    console.log(`Request received: ${Date.now() - startTime}ms`);

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
    }

    // Validate email with AbstractAPI
    const apiKey = process.env.ABSTRACT_API_KEY;
    if (!apiKey) {
      throw new Error('API key is missing');
    }

    const apiCallStartTime = Date.now();
    const response = await fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${email}`);
    console.log(`API call time: ${Date.now() - apiCallStartTime}ms`);

    if (!response.ok) {
      throw new Error(`AbstractAPI error: ${response.statusText}`);
    }

    const data: EmailValidationResponse = await response.json();

    if (data.deliverability === 'DELIVERABLE') {
      // Add the email to the database
      try {
        const dbStartTime = Date.now();
        await createEmail(email);
        console.log(`Database operation time: ${Date.now() - dbStartTime}ms`);
        return NextResponse.json({ message: 'Email is valid✔️' });
      } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ message: 'Email is valid ✔️' });
      }
    } else {
      return NextResponse.json({ message: 'Email is invalid ❌' }, { status: 400 });
    }
  } catch (error) {
    let errorMessage = 'Server error';

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    console.error('Error:', error);
    return NextResponse.json({ message: `Server error: ${errorMessage}` }, { status: 500 });
  } finally {
    console.log(`Total response time: ${Date.now() - startTime}ms`);
  }
}
