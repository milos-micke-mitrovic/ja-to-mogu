import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Fetch admin dashboard stats
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nemate dozvolu za ovu akciju' },
        { status: 403 }
      );
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      userCounts,
      accommodationCount,
      bookingCounts,
      todayArrivals,
      monthlyRevenue,
      recentBookings,
    ] = await Promise.all([
      // User counts by role
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
      }),
      // Total accommodations
      prisma.accommodation.count(),
      // Booking counts by status
      prisma.booking.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      // Today's arrivals
      prisma.booking.count({
        where: {
          arrivalDate: { gte: startOfToday, lte: endOfToday },
          status: { in: ['CONFIRMED', 'PENDING'] },
        },
      }),
      // Monthly revenue (completed payments this month)
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      // Recent bookings (last 5)
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          guestName: true,
          status: true,
          totalPrice: true,
          createdAt: true,
          accommodation: {
            select: { name: true },
          },
        },
      }),
    ]);

    const users = { owners: 0, guides: 0, clients: 0, total: 0 };
    userCounts.forEach((uc) => {
      const count = uc._count.role;
      users.total += count;
      if (uc.role === 'OWNER') users.owners = count;
      else if (uc.role === 'GUIDE') users.guides = count;
      else if (uc.role === 'CLIENT') users.clients = count;
    });

    const bookings = { active: 0, pending: 0, completed: 0, cancelled: 0 };
    bookingCounts.forEach((bc) => {
      const count = bc._count.status;
      if (bc.status === 'CONFIRMED') bookings.active = count;
      else if (bc.status === 'PENDING') bookings.pending = count;
      else if (bc.status === 'COMPLETED') bookings.completed = count;
      else if (bc.status === 'CANCELLED') bookings.cancelled = count;
    });

    return NextResponse.json({
      users,
      accommodations: accommodationCount,
      bookings,
      todayArrivals,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      recentBookings,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Greška pri preuzimanju statistike' },
      { status: 500 }
    );
  }
}
