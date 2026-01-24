import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET - Fetch owner's accommodations
export async function GET() {
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

    const accommodations = await prisma.accommodation.findMany({
      where: {
        ownerId: session.user.id,
      },
      include: {
        seasonalPrices: true,
        bookings: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED'],
            },
          },
          select: {
            id: true,
            status: true,
            arrivalDate: true,
            duration: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate stats for each accommodation
    const accommodationsWithStats = accommodations.map((acc) => {
      const ratings = acc.reviews.map((r) => r.rating);
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : null;

      return {
        ...acc,
        rating: averageRating,
        reviewCount: ratings.length,
        activeBookings: acc.bookings.length,
      };
    });

    return NextResponse.json(accommodationsWithStats);
  } catch (error) {
    console.error('Error fetching owner accommodations:', error);
    return NextResponse.json(
      { error: 'Greška pri preuzimanju smeštaja' },
      { status: 500 }
    );
  }
}

// POST - Create a new accommodation
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      name,
      description,
      type,
      destination,
      address,
      latitude,
      longitude,
      beds,
      rooms,
      hasParking,
      hasAC,
      hasWifi,
      hasKitchen,
      hasPool,
      hasSeaView,
      distanceToBeach,
      images,
      canReceiveFrom,
      canReceiveTo,
      seasonalPrices,
    } = body;

    // Validate required fields
    if (!name || !destination || !address || !beds || !rooms) {
      return NextResponse.json(
        { error: 'Sva obavezna polja moraju biti popunjena' },
        { status: 400 }
      );
    }

    // Create accommodation with seasonal prices
    const accommodation = await prisma.accommodation.create({
      data: {
        name,
        description,
        type: type || 'Apartman',
        destination,
        address,
        latitude: latitude || 0,
        longitude: longitude || 0,
        beds,
        rooms,
        hasParking: hasParking || false,
        hasAC: hasAC || false,
        hasWifi: hasWifi || false,
        hasKitchen: hasKitchen || false,
        hasPool: hasPool || false,
        hasSeaView: hasSeaView || false,
        distanceToBeach,
        images: images || [],
        canReceiveFrom,
        canReceiveTo,
        ownerId: session.user.id,
        status: 'AVAILABLE',
        seasonalPrices: seasonalPrices
          ? {
              create: seasonalPrices.map((sp: { season: string; duration: string; pricePerNight: number }) => ({
                season: sp.season,
                duration: sp.duration,
                pricePerNight: sp.pricePerNight,
              })),
            }
          : undefined,
      },
      include: {
        seasonalPrices: true,
      },
    });

    return NextResponse.json(accommodation, { status: 201 });
  } catch (error) {
    console.error('Error creating accommodation:', error);
    return NextResponse.json(
      { error: 'Greška pri kreiranju smeštaja' },
      { status: 500 }
    );
  }
}
