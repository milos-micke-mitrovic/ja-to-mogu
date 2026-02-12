import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

interface RouteParams {
  params: Promise<{
    accommodationId: string;
  }>;
}

// GET - Get single accommodation
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const { accommodationId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nemate dozvolu za ovu akciju' }, { status: 403 });
    }

    const accommodation = await prisma.accommodation.findUnique({
      where: { id: accommodationId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        seasonalPrices: true,
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
    });

    if (!accommodation) {
      return NextResponse.json({ error: 'Smeštaj nije pronađen' }, { status: 404 });
    }

    return NextResponse.json(accommodation);
  } catch (error) {
    console.error('Error fetching accommodation:', error);
    return NextResponse.json({ error: 'Greška pri preuzimanju smeštaja' }, { status: 500 });
  }
}

// PATCH - Update accommodation
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const { accommodationId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nemate dozvolu za ovu akciju' }, { status: 403 });
    }

    const body = await request.json();
    const { name, type, cityId, address, status, beds, rooms, ownerId } = body;

    // Check if accommodation exists
    const existingAccommodation = await prisma.accommodation.findUnique({
      where: { id: accommodationId },
    });

    if (!existingAccommodation) {
      return NextResponse.json({ error: 'Smeštaj nije pronađen' }, { status: 404 });
    }

    // If ownerId is provided, check if owner exists
    if (ownerId) {
      const owner = await prisma.user.findUnique({
        where: { id: ownerId },
      });
      if (!owner || owner.role !== 'OWNER') {
        return NextResponse.json({ error: 'Vlasnik nije pronađen' }, { status: 400 });
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (cityId !== undefined) updateData.cityId = cityId;
    if (address !== undefined) updateData.address = address;
    if (status !== undefined) updateData.status = status;
    if (beds !== undefined) updateData.beds = beds;
    if (rooms !== undefined) updateData.rooms = rooms;
    if (ownerId !== undefined) updateData.ownerId = ownerId;

    const updatedAccommodation = await prisma.accommodation.update({
      where: { id: accommodationId },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedAccommodation);
  } catch (error) {
    console.error('Error updating accommodation:', error);
    return NextResponse.json({ error: 'Greška pri ažuriranju smeštaja' }, { status: 500 });
  }
}

// DELETE - Delete accommodation
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const { accommodationId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nemate dozvolu za ovu akciju' }, { status: 403 });
    }

    // Check if accommodation exists
    const accommodation = await prisma.accommodation.findUnique({
      where: { id: accommodationId },
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!accommodation) {
      return NextResponse.json({ error: 'Smeštaj nije pronađen' }, { status: 404 });
    }

    // Check if accommodation has active bookings
    if (accommodation._count.bookings > 0) {
      return NextResponse.json(
        { error: 'Smeštaj ima rezervacije. Prvo ih uklonite.' },
        { status: 400 }
      );
    }

    await prisma.accommodation.delete({
      where: { id: accommodationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting accommodation:', error);
    return NextResponse.json({ error: 'Greška pri brisanju smeštaja' }, { status: 500 });
  }
}
