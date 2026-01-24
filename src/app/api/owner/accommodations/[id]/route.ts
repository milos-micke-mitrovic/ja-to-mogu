import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET - Fetch single accommodation
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niste autorizovani' },
        { status: 401 }
      );
    }

    const accommodation = await prisma.accommodation.findUnique({
      where: { id },
      include: {
        seasonalPrices: true,
        bookings: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!accommodation) {
      return NextResponse.json(
        { error: 'Smeštaj nije pronađen' },
        { status: 404 }
      );
    }

    // Check ownership
    if (accommodation.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nemate dozvolu za ovu akciju' },
        { status: 403 }
      );
    }

    return NextResponse.json(accommodation);
  } catch (error) {
    console.error('Error fetching accommodation:', error);
    return NextResponse.json(
      { error: 'Greška pri preuzimanju smeštaja' },
      { status: 500 }
    );
  }
}

// PATCH - Update accommodation
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niste autorizovani' },
        { status: 401 }
      );
    }

    // Check ownership
    const existing = await prisma.accommodation.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Smeštaj nije pronađen' },
        { status: 404 }
      );
    }

    if (existing.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
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
      status,
      canReceiveFrom,
      canReceiveTo,
      seasonalPrices,
    } = body;

    // Update accommodation
    const accommodation = await prisma.accommodation.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(address !== undefined && { address }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
        ...(beds !== undefined && { beds }),
        ...(rooms !== undefined && { rooms }),
        ...(hasParking !== undefined && { hasParking }),
        ...(hasAC !== undefined && { hasAC }),
        ...(hasWifi !== undefined && { hasWifi }),
        ...(hasKitchen !== undefined && { hasKitchen }),
        ...(hasPool !== undefined && { hasPool }),
        ...(hasSeaView !== undefined && { hasSeaView }),
        ...(distanceToBeach !== undefined && { distanceToBeach }),
        ...(images !== undefined && { images }),
        ...(status !== undefined && { status }),
        ...(canReceiveFrom !== undefined && { canReceiveFrom }),
        ...(canReceiveTo !== undefined && { canReceiveTo }),
      },
      include: {
        seasonalPrices: true,
      },
    });

    // Update seasonal prices if provided
    if (seasonalPrices) {
      // Delete existing prices
      await prisma.seasonalPrice.deleteMany({
        where: { accommodationId: id },
      });

      // Create new prices
      await prisma.seasonalPrice.createMany({
        data: seasonalPrices.map((sp: { season: string; duration: string; pricePerNight: number }) => ({
          accommodationId: id,
          season: sp.season,
          duration: sp.duration,
          pricePerNight: sp.pricePerNight,
        })),
      });
    }

    return NextResponse.json(accommodation);
  } catch (error) {
    console.error('Error updating accommodation:', error);
    return NextResponse.json(
      { error: 'Greška pri ažuriranju smeštaja' },
      { status: 500 }
    );
  }
}

// DELETE - Delete accommodation
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niste autorizovani' },
        { status: 401 }
      );
    }

    // Check ownership
    const existing = await prisma.accommodation.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED'],
            },
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Smeštaj nije pronađen' },
        { status: 404 }
      );
    }

    if (existing.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nemate dozvolu za ovu akciju' },
        { status: 403 }
      );
    }

    // Check for active bookings
    if (existing.bookings.length > 0) {
      return NextResponse.json(
        { error: 'Nije moguće obrisati smeštaj sa aktivnim rezervacijama' },
        { status: 400 }
      );
    }

    // Delete accommodation (cascade will handle related records)
    await prisma.accommodation.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Smeštaj uspešno obrisan' });
  } catch (error) {
    console.error('Error deleting accommodation:', error);
    return NextResponse.json(
      { error: 'Greška pri brisanju smeštaja' },
      { status: 500 }
    );
  }
}
