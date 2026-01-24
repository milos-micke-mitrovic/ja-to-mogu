import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { resetPasswordRequestSchema, resetPasswordSchema } from '@/lib/validations/auth';

// Request password reset
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedFields = resetPasswordRequestSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json({ error: 'Nevažeći podaci' }, { status: 400 });
    }

    const { email } = validatedFields.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success even if user doesn't exist (security)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Ako nalog postoji, link za resetovanje je poslat na email',
      });
    }

    // Delete any existing password reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Generate new reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expires,
      },
    });

    // TODO: Send password reset email using Resend
    // For now, just return success

    return NextResponse.json({
      success: true,
      message: 'Ako nalog postoji, link za resetovanje je poslat na email',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json({ error: 'Greška na serveru' }, { status: 500 });
  }
}

// Reset password with token
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const validatedFields = resetPasswordSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: 'Nevažeći podaci', details: validatedFields.error.flatten() },
        { status: 400 }
      );
    }

    const { token, password } = validatedFields.data;

    // Find the reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json({ error: 'Nevažeći token' }, { status: 400 });
    }

    // Check if token has expired
    if (new Date() > resetToken.expires) {
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });

      return NextResponse.json({ error: 'Token je istekao' }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user's password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { hashedPassword },
    });

    // Delete the used reset token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Lozinka uspešno promenjena',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Greška na serveru' }, { status: 500 });
  }
}
