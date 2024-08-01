import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from "@/app/lib/database/mongoose";
import { createEmail, findEmailByEmail } from "@/app/lib/actions/email.action";

export async function POST(request: NextRequest) {
  await connectToDatabase();

  try {
    const { email } = await request.json();

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
    }

    // Check if email already exists
    const existingEmail = await findEmailByEmail(email);
    if (existingEmail) {
      return NextResponse.json({ message: 'Email is valid and already exists in the database ✔️' }, { status: 200 });
    }

    // Validate email with AbstractAPI
    const apiKey = process.env.ABSTRACT_API_KEY;
    if (!apiKey) {
      throw new Error('API key is missing');
    }

    // Fetch email validation result
    const validationResponse = await fetchWithTimeout(`https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${email}`, { timeout: 5000 });
    const validationData = await validationResponse.json();

    if (validationData.deliverability === 'DELIVERABLE') {
      // Add the email to the database
      try {
        await createEmail(email);
        return NextResponse.json({ message: 'Email is valid and stored ✔️' });
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error, email already exists
          return NextResponse.json({ message: 'Email is valid and already exists in the database ✔️' }, { status: 200 });
        } else {
          console.error('Error storing email:', error);
          return NextResponse.json({ message: 'Error storing email' }, { status: 500 });
        }
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
  }
}

// Helper function to fetch with timeout
async function fetchWithTimeout(resource: string, options: { timeout: number }) {
  const { timeout } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(id);

  return response;
}
