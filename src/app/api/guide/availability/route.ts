import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// GET - Fetch guide's availability
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niste autorizovani' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'GUIDE' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nemate dozvolu za ovu akciju' },
        { status: 403 }
      );
    }

    const availabilities = await prisma.guideAvailability.findMany({
      where: {
        guideId: session.user.id,
      },
      orderBy: [
        { destination: 'asc' },
        { availableFrom: 'desc' },
      ],
    });

    return NextResponse.json(availabilities);
  } catch (error) {
    console.error('Error fetching guide availability:', error);
    return NextResponse.json(
      { error: 'Greška pri preuzimanju dostupnosti' },
      { status: 500 }
    );
  }
}

// POST - Create new availability
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niste autorizovani' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'GUIDE' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nemate dozvolu za ovu akciju' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { destination, availableFrom, availableTo, isActive } = body;

    // Validate required fields
    if (!destination || !availableFrom || !availableTo) {
      return NextResponse.json(
        { error: 'Sva obavezna polja moraju biti popunjena' },
        { status: 400 }
      );
    }

    // Check for overlapping availability
    const fromDate = new Date(availableFrom);
    const toDate = new Date(availableTo);

    if (fromDate >= toDate) {
      return NextResponse.json(
        { error: 'Datum početka mora biti pre datuma kraja' },
        { status: 400 }
      );
    }

    const overlapping = await prisma.guideAvailability.findFirst({
      where: {
        guideId: session.user.id,
        destination: destination as Prisma.EnumDestinationFilter,
        OR: [
          {
            AND: [
              { availableFrom: { lte: fromDate } },
              { availableTo: { gte: fromDate } },
            ],
          },
          {
            AND: [
              { availableFrom: { lte: toDate } },
              { availableTo: { gte: toDate } },
            ],
          },
          {
            AND: [
              { availableFrom: { gte: fromDate } },
              { availableTo: { lte: toDate } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      return NextResponse.json(
        { error: 'Već postoji dostupnost za ovu destinaciju u preklapajućem periodu' },
        { status: 400 }
      );
    }

    const availability = await prisma.guideAvailability.create({
      data: {
        guideId: session.user.id,
        destination,
        availableFrom: fromDate,
        availableTo: toDate,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(availability, { status: 201 });
  } catch (error) {
    console.error('Error creating guide availability:', error);
    return NextResponse.json(
      { error: 'Greška pri kreiranju dostupnosti' },
      { status: 500 }
    );
  }
}

// DELETE - Delete availability
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niste autorizovani' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID je obavezan' },
        { status: 400 }
      );
    }

    // Check ownership
    const existing = await prisma.guideAvailability.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Dostupnost nije pronađena' },
        { status: 404 }
      );
    }

    if (existing.guideId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nemate dozvolu za ovu akciju' },
        { status: 403 }
      );
    }

    await prisma.guideAvailability.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Dostupnost uspešno obrisana' });
  } catch (error) {
    console.error('Error deleting guide availability:', error);
    return NextResponse.json(
      { error: 'Greška pri brisanju dostupnosti' },
      { status: 500 }
    );
  }
}

// PATCH - Update availability
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niste autorizovani' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, isActive, availableFrom, availableTo } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID je obavezan' },
        { status: 400 }
      );
    }

    // Check ownership
    const existing = await prisma.guideAvailability.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Dostupnost nije pronađena' },
        { status: 404 }
      );
    }

    if (existing.guideId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nemate dozvolu za ovu akciju' },
        { status: 403 }
      );
    }

    const availability = await prisma.guideAvailability.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(availableFrom && { availableFrom: new Date(availableFrom) }),
        ...(availableTo && { availableTo: new Date(availableTo) }),
      },
    });

    return NextResponse.json(availability);
  } catch (error) {
    console.error('Error updating guide availability:', error);
    return NextResponse.json(
      { error: 'Greška pri ažuriranju dostupnosti' },
      { status: 500 }
    );
  }
}
