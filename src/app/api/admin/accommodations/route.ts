import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// GET - Fetch all accommodations (admin only)
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
    const cityId = searchParams.get('cityId');
    const status = searchParams.get('status');
    const ownerId = searchParams.get('ownerId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Prisma.AccommodationWhereInput = {};

    if (cityId) {
      where.cityId = cityId;
    }

    if (status) {
      where.status = status as Prisma.EnumAccommodationStatusFilter;
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [accommodations, total] = await Promise.all([
      prisma.accommodation.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          city: {
            include: {
              region: {
                include: {
                  country: true,
                },
              },
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
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.accommodation.count({ where }),
    ]);

    return NextResponse.json({
      accommodations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching accommodations:', error);
    return NextResponse.json(
      { error: 'Greška pri preuzimanju smeštaja' },
      { status: 500 }
    );
  }
}

// POST - Create new accommodation (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nemate dozvolu za ovu akciju' }, { status: 403 });
    }

    const body = await request.json();
    const { name, type, cityId, address, status, beds, rooms, ownerId, latitude, longitude } = body;

    // Validate required fields
    if (!name || !type || !cityId || !address || !ownerId) {
      return NextResponse.json(
        { error: 'Naziv, tip, destinacija, adresa i vlasnik su obavezni' },
        { status: 400 }
      );
    }

    // Check if owner exists
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
    });

    if (!owner || owner.role !== 'OWNER') {
      return NextResponse.json({ error: 'Vlasnik nije pronađen' }, { status: 400 });
    }

    // Create accommodation
    const newAccommodation = await prisma.accommodation.create({
      data: {
        name,
        type,
        cityId,
        address,
        status: status || 'AVAILABLE',
        beds: beds || 1,
        rooms: rooms || 1,
        ownerId,
        latitude: latitude || 0,
        longitude: longitude || 0,
      },
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

    return NextResponse.json(newAccommodation, { status: 201 });
  } catch (error) {
    console.error('Error creating accommodation:', error);
    return NextResponse.json({ error: 'Greška pri kreiranju smeštaja' }, { status: 500 });
  }
}
