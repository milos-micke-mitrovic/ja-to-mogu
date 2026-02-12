import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

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

// PATCH - Update a region
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nemate dozvolu za ovu akciju' }, { status: 403 });
    }

    const existingRegion = await prisma.region.findUnique({
      where: { id },
    });

    if (!existingRegion) {
      return NextResponse.json({ error: 'Region nije pronađen' }, { status: 404 });
    }

    const body = await request.json();
    const { name, slug, countryId, isActive, sortOrder } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) {
      updateData.slug = slug;
    } else if (name !== undefined) {
      updateData.slug = generateSlug(name);
    }
    if (countryId !== undefined) updateData.countryId = countryId;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    // Check slug uniqueness if slug is being changed
    if (updateData.slug && updateData.slug !== existingRegion.slug) {
      const slugExists = await prisma.region.findUnique({
        where: { slug: updateData.slug as string },
      });
      if (slugExists) {
        return NextResponse.json({ error: 'Region sa ovim slug-om već postoji' }, { status: 400 });
      }
    }

    // Verify country exists if countryId is being changed
    if (countryId !== undefined) {
      const country = await prisma.country.findUnique({
        where: { id: countryId },
      });
      if (!country) {
        return NextResponse.json({ error: 'Država nije pronađena' }, { status: 404 });
      }
    }

    const region = await prisma.region.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(region);
  } catch (error) {
    console.error('Error updating region:', error);
    return NextResponse.json({ error: 'Greška pri ažuriranju regiona' }, { status: 500 });
  }
}

// DELETE - Delete a region
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nemate dozvolu za ovu akciju' }, { status: 403 });
    }

    const region = await prisma.region.findUnique({
      where: { id },
    });

    if (!region) {
      return NextResponse.json({ error: 'Region nije pronađen' }, { status: 404 });
    }

    // Check if any cities under this region have accommodations
    const accommodationCount = await prisma.accommodation.count({
      where: {
        city: {
          regionId: id,
        },
      },
    });

    if (accommodationCount > 0) {
      return NextResponse.json(
        { error: 'Region ima smeštaje u svojim gradovima. Prvo ih uklonite.' },
        { status: 400 }
      );
    }

    await prisma.region.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting region:', error);
    return NextResponse.json({ error: 'Greška pri brisanju regiona' }, { status: 500 });
  }
}
