import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

// Validation schema for creating a review
const createReviewSchema = z.object({
  bookingId: z.string().min(1, 'ID rezervacije je obavezan'),
  rating: z.number().min(1).max(5, 'Ocena mora biti između 1 i 5'),
  comment: z.string().optional(),
});

// GET - Fetch reviews (with filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accommodationId = searchParams.get('accommodationId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    const where: Record<string, unknown> = {};

    if (accommodationId) {
      where.accommodationId = accommodationId;
    }

    if (userId) {
      where.userId = userId;
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          accommodation: {
            select: {
              id: true,
              name: true,
              destination: true,
            },
          },
          booking: {
            select: {
              id: true,
              arrivalDate: true,
              duration: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    // Calculate average rating if filtering by accommodation
    let averageRating = null;
    if (accommodationId) {
      const aggregation = await prisma.review.aggregate({
        where: { accommodationId },
        _avg: { rating: true },
        _count: { rating: true },
      });
      averageRating = {
        average: aggregation._avg.rating,
        count: aggregation._count.rating,
      };
    }

    return NextResponse.json({
      reviews,
      averageRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Greška pri preuzimanju recenzija' },
      { status: 500 }
    );
  }
}

// POST - Create a new review
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Morate biti prijavljeni da biste ostavili recenziju' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = createReviewSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0]?.message || 'Nevažeći podaci' },
        { status: 400 }
      );
    }

    const { bookingId, rating, comment } = validationResult.data;

    // Check if booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        accommodation: true,
        review: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Rezervacija nije pronađena' },
        { status: 404 }
      );
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Nemate dozvolu za ovu akciju' },
        { status: 403 }
      );
    }

    // Check if booking is completed
    if (booking.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Možete ostaviti recenziju samo za završene rezervacije' },
        { status: 400 }
      );
    }

    // Check if review already exists
    if (booking.review) {
      return NextResponse.json(
        { error: 'Već ste ostavili recenziju za ovu rezervaciju' },
        { status: 400 }
      );
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        bookingId,
        userId: session.user.id,
        accommodationId: booking.accommodationId,
        rating,
        comment: comment || null,
        isVerified: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        accommodation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Note: Accommodation average rating is calculated dynamically from reviews
    // If you need a denormalized rating field on Accommodation, uncomment this:
    // const aggregation = await prisma.review.aggregate({
    //   where: { accommodationId: booking.accommodationId },
    //   _avg: { rating: true },
    // });
    // await prisma.accommodation.update({
    //   where: { id: booking.accommodationId },
    //   data: { rating: aggregation._avg.rating },
    // });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Greška pri kreiranju recenzije' },
      { status: 500 }
    );
  }
}
