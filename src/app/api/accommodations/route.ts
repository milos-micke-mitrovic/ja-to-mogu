import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get('destination');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minBeds = searchParams.get('minBeds');
    const hasParking = searchParams.get('hasParking');
    const hasAC = searchParams.get('hasAC');
    const hasWifi = searchParams.get('hasWifi');
    const hasKitchen = searchParams.get('hasKitchen');
    const hasPool = searchParams.get('hasPool');
    const hasSeaView = searchParams.get('hasSeaView');

    // Build filters
    const where: Prisma.AccommodationWhereInput = {
      status: 'AVAILABLE',
    };

    if (destination) {
      where.destination = destination as Prisma.EnumDestinationFilter;
    }

    if (minBeds) {
      where.beds = { gte: Number(minBeds) };
    }

    if (hasParking === 'true') where.hasParking = true;
    if (hasAC === 'true') where.hasAC = true;
    if (hasWifi === 'true') where.hasWifi = true;
    if (hasKitchen === 'true') where.hasKitchen = true;
    if (hasPool === 'true') where.hasPool = true;
    if (hasSeaView === 'true') where.hasSeaView = true;

    // Price filtering via seasonalPrices
    if (minPrice || maxPrice) {
      where.seasonalPrices = {
        some: {
          pricePerNight: {
            ...(minPrice ? { gte: Number(minPrice) } : {}),
            ...(maxPrice ? { lte: Number(maxPrice) } : {}),
          },
        },
      };
    }

    const accommodations = await prisma.accommodation.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        seasonalPrices: {
          select: {
            season: true,
            duration: true,
            pricePerNight: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate average rating and get min price for each accommodation
    const accommodationsWithRating = accommodations.map((acc) => {
      const ratings = acc.reviews.map((r) => r.rating);
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : null;

      // Get minimum price from seasonal prices
      const prices = acc.seasonalPrices.map((sp) => sp.pricePerNight);
      const minPricePerNight = prices.length > 0 ? Math.min(...prices) : null;

      return {
        ...acc,
        rating: averageRating,
        reviewCount: ratings.length,
        minPricePerNight,
      };
    });

    return NextResponse.json(accommodationsWithRating);
  } catch (error) {
    console.error('Error fetching accommodations:', error);
    return NextResponse.json(
      { error: 'Greška pri preuzimanju smeštaja' },
      { status: 500 }
    );
  }
}
