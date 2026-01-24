import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// GET - Fetch clients (bookings) assigned to guide
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niste autorizovani' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'GUIDE' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nemate dozvolu za ovu akciju' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const journeyStatus = searchParams.get('journeyStatus');
    const today = searchParams.get('today') === 'true';

    const where: Prisma.BookingWhereInput = {
      guideId: session.user.id,
      packageType: 'BONUS', // Guides only have BONUS package clients
    };

    if (status) {
      where.status = status as Prisma.EnumBookingStatusFilter;
    } else {
      // Default to active bookings
      where.status = { in: ['PENDING', 'CONFIRMED'] };
    }

    if (journeyStatus) {
      where.journeyStatus = journeyStatus as Prisma.EnumJourneyStatusFilter;
    }

    // Filter for today's arrivals
    if (today) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      where.arrivalDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        accommodation: {
          select: {
            id: true,
            name: true,
            destination: true,
            address: true,
            latitude: true,
            longitude: true,
            owner: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: [
        { arrivalDate: 'asc' },
        { arrivalTime: 'asc' },
      ],
    });

    // Format response with additional useful data
    const formattedBookings = bookings.map((booking) => ({
      ...booking,
      guestInfo: {
        name: booking.guestName,
        phone: booking.guestPhone,
        email: booking.guestEmail,
        hasViber: booking.hasViber,
        hasWhatsApp: booking.hasWhatsApp,
      },
    }));

    return NextResponse.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching guide clients:', error);
    return NextResponse.json(
      { error: 'Greška pri preuzimanju klijenata' },
      { status: 500 }
    );
  }
}
