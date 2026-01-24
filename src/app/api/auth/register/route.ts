import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Sva polja su obavezna' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Lozinka mora imati najmanje 6 karaktera' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Korisnik sa ovom email adresom već postoji' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        hashedPassword,
        role: 'CLIENT', // Default role for new registrations
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expires,
      },
    });

    // Send verification email (don't block registration if email fails)
    sendVerificationEmail(user.email, user.name || 'korisniče', verificationToken).catch((err) => {
      console.error('Failed to send verification email:', err);
    });

    return NextResponse.json(
      {
        message: 'Registracija uspešna. Proverite email za verifikaciju.',
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Greška pri registraciji' },
      { status: 500 }
    );
  }
}
