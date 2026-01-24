import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token nije prosleđen' }, { status: 400 });
    }

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return NextResponse.json({ error: 'Nevažeći token' }, { status: 400 });
    }

    // Check if token has expired
    if (new Date() > verificationToken.expires) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });

      return NextResponse.json({ error: 'Token je istekao' }, { status: 400 });
    }

    // Update user's emailVerified field
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: new Date() },
    });

    // Delete the used verification token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Email uspešno potvrđen',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: 'Greška na serveru' }, { status: 500 });
  }
}
