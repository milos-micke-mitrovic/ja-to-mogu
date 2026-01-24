import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { registerSchema } from '@/lib/validations/auth';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedFields = registerSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: 'Nevažeći podaci', details: validatedFields.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password } = validatedFields.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Korisnik sa ovim emailom već postoji' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role: 'CLIENT',
      },
    });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expires,
      },
    });

    // TODO: Send verification email using Resend
    // For now, just return success
    // In production, you would send an email with a link to verify the email

    return NextResponse.json(
      {
        success: true,
        message: 'Registracija uspešna. Proverite email za potvrdu.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Greška na serveru' }, { status: 500 });
  }
}
