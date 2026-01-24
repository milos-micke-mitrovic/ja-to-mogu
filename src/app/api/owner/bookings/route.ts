import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// GET - Fetch bookings for owner's accommodations
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niste autorizovani' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'OWNER' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nemate dozvolu za ovu akciju' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const accommodationId = searchParams.get('accommodationId');

    // Get owner's accommodation IDs
    const ownerAccommodations = await prisma.accommodation.findMany({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    const accommodationIds = ownerAccommodations.map((a) => a.id);

    if (accommodationIds.length === 0) {
      return NextResponse.json([]);
    }

    const where: Prisma.BookingWhereInput = {
      accommodationId: { in: accommodationIds },
    };

    if (status) {
      where.status = status as Prisma.EnumBookingStatusFilter;
    }

    if (accommodationId && accommodationIds.includes(accommodationId)) {
      where.accommodationId = accommodationId;
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
          },
        },
        guide: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { arrivalDate: 'asc' },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    return NextResponse.json(
      { error: 'Greška pri preuzimanju rezervacija' },
      { status: 500 }
    );
  }
}
