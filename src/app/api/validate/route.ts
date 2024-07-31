import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { createEmail } from "@/app/lib/actions/email.action";

interface EmailValidationResponse {
  deliverability: string;
}

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
  }

  // Validate email with AbstractAPI
  const apiKey = process.env.ABSTRACT_API_KEY;
  const response = await fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${email}`);
  const data: EmailValidationResponse = await response.json();

  if (data.deliverability === 'DELIVERABLE') {
    // Add the email to the database
    try {
      await createEmail(email);
      return NextResponse.json({ message: 'Email is valid✔️' });
    } catch (error) {
      return NextResponse.json({ message: 'Email is valid ✔️' });
    }
  } else {
    return NextResponse.json({ message: 'Email is invalid ❌' }, { status: 400 });
  }
}

export async function handler(request: NextRequest) {
  if (request.method === 'POST') {
    return POST(request);
  } else {
    return new NextResponse('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
  }
}

export { handler as default };
