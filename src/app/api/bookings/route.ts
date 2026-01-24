import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET - Fetch user's bookings
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niste autorizovani' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        accommodation: {
          include: {
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Greška pri preuzimanju rezervacija' },
      { status: 500 }
    );
  }
}

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niste autorizovani' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      accommodationId,
      arrivalDate,
      arrivalTime,
      packageType,
      totalPrice,
      travelFormData,
    } = body;

    // Validate required fields
    if (!accommodationId || !arrivalDate || !packageType) {
      return NextResponse.json(
        { error: 'Sva obavezna polja moraju biti popunjena' },
        { status: 400 }
      );
    }

    // Check if accommodation is available
    const accommodation = await prisma.accommodation.findUnique({
      where: { id: accommodationId },
    });

    if (!accommodation) {
      return NextResponse.json(
        { error: 'Smeštaj nije pronađen' },
        { status: 404 }
      );
    }

    if (accommodation.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'Smeštaj trenutno nije dostupan' },
        { status: 400 }
      );
    }

    // Calculate expiry (36 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 36);

    // Assign a guide if Bonus package
    let guideId = null;
    if (packageType === 'BONUS') {
      const now = new Date();
      const availableGuide = await prisma.guideAvailability.findFirst({
        where: {
          destination: accommodation.destination,
          isActive: true,
          availableFrom: { lte: now },
          availableTo: { gte: now },
        },
        include: {
          guide: true,
        },
      });

      if (availableGuide) {
        guideId = availableGuide.guideId;
      }
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        accommodationId,
        guideId,
        arrivalDate: new Date(arrivalDate),
        arrivalTime,
        duration: travelFormData?.duration || 'FOUR_SEVEN',
        packageType,
        totalPrice,
        status: 'CONFIRMED',
        journeyStatus: 'NOT_STARTED',
        expiresAt,
        // Store travel form data
        guestName: travelFormData?.name || session.user.name || 'Guest',
        guestEmail: travelFormData?.email || session.user.email || '',
        guestPhone: travelFormData?.phone || '',
        guestAddress: travelFormData?.address,
        hasViber: travelFormData?.hasViber || false,
        hasWhatsApp: travelFormData?.hasWhatsApp || false,
      },
      include: {
        accommodation: {
          include: {
            owner: {
              select: {
                name: true,
                phone: true,
              },
            },
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

    // Update accommodation status to BOOKED
    await prisma.accommodation.update({
      where: { id: accommodationId },
      data: { status: 'BOOKED' },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Greška pri kreiranju rezervacije' },
      { status: 500 }
    );
  }
}
