import { NextRequest, NextResponse } from 'next/server';
import { createEmail, findEmailByEmail } from "@/app/lib/actions/email.action";

export async function POST(request: NextRequest) {
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
      return NextResponse.json({ message: 'Email is valid✔️' }, { status: 200 });
    }

    // Add the email to the database
    try {
      await createEmail(email);
      return NextResponse.json({ message: 'Email is valid ✔️' });
    } catch (error) {
      console.error('Error storing email:', error);
      return NextResponse.json({ message: 'Error email while validating email' }, { status: 500 });
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

