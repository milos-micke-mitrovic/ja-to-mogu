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

// POST - Create a new region
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
    const { name, slug, countryId, isActive, sortOrder } = body;

    if (!name) {
      return NextResponse.json({ error: 'Naziv je obavezan' }, { status: 400 });
    }

    if (!countryId) {
      return NextResponse.json({ error: 'Država je obavezna' }, { status: 400 });
    }

    // Verify country exists
    const country = await prisma.country.findUnique({
      where: { id: countryId },
    });

    if (!country) {
      return NextResponse.json({ error: 'Država nije pronađena' }, { status: 404 });
    }

    const finalSlug = slug || generateSlug(name);

    // Check if slug already exists
    const existingRegion = await prisma.region.findUnique({
      where: { slug: finalSlug },
    });

    if (existingRegion) {
      return NextResponse.json({ error: 'Region sa ovim slug-om već postoji' }, { status: 400 });
    }

    const region = await prisma.region.create({
      data: {
        name,
        slug: finalSlug,
        countryId,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json(region, { status: 201 });
  } catch (error) {
    console.error('Error creating region:', error);
    return NextResponse.json({ error: 'Greška pri kreiranju regiona' }, { status: 500 });
  }
}
