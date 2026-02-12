import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[čć]/g, 'c')
    .replace(/[š]/g, 's')
    .replace(/[ž]/g, 'z')
    .replace(/[đ]/g, 'dj')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// GET - Get all countries with regions and cities (including inactive)
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nemate dozvolu za ovu akciju' }, { status: 403 });
    }

    const countries = await prisma.country.findMany({
      include: {
        regions: {
          include: {
            cities: {
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(countries);
  } catch (error) {
    console.error('Error fetching destinations:', error);
    return NextResponse.json({ error: 'Greška pri preuzimanju destinacija' }, { status: 500 });
  }
}

// POST - Create a new country
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
    const { name, slug, isActive, sortOrder } = body;

    if (!name) {
      return NextResponse.json({ error: 'Naziv je obavezan' }, { status: 400 });
    }

    const finalSlug = slug || generateSlug(name);

    // Check if slug already exists
    const existingCountry = await prisma.country.findUnique({
      where: { slug: finalSlug },
    });

    if (existingCountry) {
      return NextResponse.json({ error: 'Država sa ovim slug-om već postoji' }, { status: 400 });
    }

    const country = await prisma.country.create({
      data: {
        name,
        slug: finalSlug,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json(country, { status: 201 });
  } catch (error) {
    console.error('Error creating country:', error);
    return NextResponse.json({ error: 'Greška pri kreiranju države' }, { status: 500 });
  }
}
