import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// GET - Fetch all bookings (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niste autorizovani' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nemate dozvolu za ovu akciju' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const journeyStatus = searchParams.get('journeyStatus');
    const packageType = searchParams.get('packageType');
    const cityId = searchParams.get('cityId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const search = searchParams.get('search');

    const where: Prisma.BookingWhereInput = {};

    if (status) {
      where.status = status as Prisma.EnumBookingStatusFilter;
    }

    if (journeyStatus) {
      where.journeyStatus = journeyStatus as Prisma.EnumJourneyStatusFilter;
    }

    if (packageType) {
      where.packageType = packageType as Prisma.EnumPackageTypeFilter;
    }

    if (cityId) {
      where.accommodation = {
        cityId,
      };
    }

    if (search) {
      where.OR = [
        { guestName: { contains: search, mode: 'insensitive' } },
        { guestEmail: { contains: search, mode: 'insensitive' } },
        { guestPhone: { contains: search, mode: 'insensitive' } },
        { accommodation: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
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
              cityId: true,
              city: { select: { name: true } },
              address: true,
              owner: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                },
              },
            },
          },
          guide: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          payment: {
            select: {
              status: true,
              amount: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Greška pri preuzimanju rezervacija' },
      { status: 500 }
    );
  }
}

// PATCH - Update booking (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niste autorizovani' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Nemate dozvolu za ovu akciju' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { bookingId, status, guideId, journeyStatus } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'ID rezervacije je obavezan' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (guideId !== undefined) updateData.guideId = guideId;
    if (journeyStatus !== undefined) {
      updateData.journeyStatus = journeyStatus;
      // Update timestamps based on journey status
      if (journeyStatus === 'DEPARTED') {
        updateData.departedAt = new Date();
      } else if (journeyStatus === 'IN_GREECE') {
        updateData.arrivedGreeceAt = new Date();
      } else if (journeyStatus === 'ARRIVED') {
        updateData.arrivedDestinationAt = new Date();
      }
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        accommodation: {
          select: {
            name: true,
            city: { select: { name: true } },
          },
        },
        guide: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    // If booking is cancelled, update accommodation status
    if (status === 'CANCELLED') {
      await prisma.accommodation.update({
        where: { id: updatedBooking.accommodationId },
        data: { status: 'AVAILABLE' },
      });
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Greška pri ažuriranju rezervacije' },
      { status: 500 }
    );
  }
}
