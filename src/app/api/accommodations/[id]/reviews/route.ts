import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch reviews for a specific accommodation
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: accommodationId } = await params;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    // Check if accommodation exists
    const accommodation = await prisma.accommodation.findUnique({
      where: { id: accommodationId },
      select: { id: true, name: true },
    });

    if (!accommodation) {
      return NextResponse.json(
        { error: 'Smeštaj nije pronađen' },
        { status: 404 }
      );
    }

    // Fetch reviews with pagination
    const [reviews, total, aggregation] = await Promise.all([
      prisma.review.findMany({
        where: { accommodationId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          booking: {
            select: {
              arrivalDate: true,
              duration: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where: { accommodationId } }),
      prisma.review.aggregate({
        where: { accommodationId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    // Calculate rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { accommodationId },
      _count: { rating: true },
    });

    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    ratingDistribution.forEach((item) => {
      distribution[item.rating as keyof typeof distribution] = item._count.rating;
    });

    return NextResponse.json({
      accommodation: {
        id: accommodation.id,
        name: accommodation.name,
      },
      reviews,
      stats: {
        averageRating: aggregation._avg.rating || 0,
        totalReviews: aggregation._count.rating,
        distribution,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching accommodation reviews:', error);
    return NextResponse.json(
      { error: 'Greška pri preuzimanju recenzija' },
      { status: 500 }
    );
  }
}
