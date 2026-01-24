import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET - Fetch all payments (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niste autorizovani' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nemate pristup ovoj stranici' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { booking: { accommodation: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          booking: {
            select: {
              id: true,
              status: true,
              arrivalDate: true,
              packageType: true,
              accommodation: {
                select: {
                  id: true,
                  name: true,
                  destination: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    // Get stats
    const stats = await prisma.payment.groupBy({
      by: ['status'],
      _count: { status: true },
      _sum: { amount: true },
    });

    const formattedStats = {
      total: total,
      pending: 0,
      completed: 0,
      failed: 0,
      refunded: 0,
      totalAmount: 0,
      pendingAmount: 0,
      completedAmount: 0,
    };

    stats.forEach((stat) => {
      const count = stat._count.status;
      const amount = stat._sum.amount || 0;
      formattedStats.totalAmount += amount;

      switch (stat.status) {
        case 'PENDING':
          formattedStats.pending = count;
          formattedStats.pendingAmount = amount;
          break;
        case 'COMPLETED':
          formattedStats.completed = count;
          formattedStats.completedAmount = amount;
          break;
        case 'FAILED':
          formattedStats.failed = count;
          break;
        case 'REFUNDED':
          formattedStats.refunded = count;
          break;
      }
    });

    return NextResponse.json({
      payments,
      stats: formattedStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Greška pri preuzimanju plaćanja' },
      { status: 500 }
    );
  }
}

// PATCH - Update payment status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niste autorizovani' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nemate pristup ovoj akciji' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { paymentId, status, transactionId } = body;

    if (!paymentId || !status) {
      return NextResponse.json(
        { error: 'ID plaćanja i status su obavezni' },
        { status: 400 }
      );
    }

    const validStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Nevažeći status plaćanja' },
        { status: 400 }
      );
    }

    // Update payment
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        transactionId: transactionId || undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        booking: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Greška pri ažuriranju plaćanja' },
      { status: 500 }
    );
  }
}
