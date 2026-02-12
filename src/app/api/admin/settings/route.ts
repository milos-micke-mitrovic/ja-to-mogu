import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET - Fetch all settings (admin only)
export async function GET() {
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

    // Fetch package settings
    const packageSettings = await prisma.packageSetting.findMany({
      orderBy: { packageType: 'asc' },
    });

    // Fetch location availability with city info
    const locationAvailability = await prisma.locationAvailability.findMany({
      include: {
        city: {
          include: {
            region: {
              include: {
                country: true,
              },
            },
          },
        },
      },
    });

    // Fetch all active cities for the settings UI
    const cities = await prisma.city.findMany({
      where: { isActive: true },
      include: {
        region: {
          include: {
            country: true,
          },
        },
      },
      orderBy: [
        { region: { country: { sortOrder: 'asc' } } },
        { region: { sortOrder: 'asc' } },
        { sortOrder: 'asc' },
      ],
    });

    // Transform to easier format
    const packages = {
      BASIC: packageSettings.find((p) => p.packageType === 'BASIC'),
      BONUS: packageSettings.find((p) => p.packageType === 'BONUS'),
    };

    const unavailableCityIds = locationAvailability
      .filter((l) => !l.isAvailable)
      .map((l) => l.cityId);

    return NextResponse.json({
      packages,
      packageSettings,
      locationAvailability,
      unavailableCityIds,
      cities,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Greška pri preuzimanju podešavanja' },
      { status: 500 }
    );
  }
}

// PATCH - Update settings (admin only)
export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { packageSettings, unavailableCityIds } = body;

    // Update package settings if provided
    if (packageSettings) {
      for (const setting of packageSettings) {
        await prisma.packageSetting.upsert({
          where: { packageType: setting.packageType },
          update: {
            price: setting.price,
            isActive: setting.isActive ?? true,
          },
          create: {
            packageType: setting.packageType,
            price: setting.price,
            isActive: setting.isActive ?? true,
          },
        });
      }
    }

    // Update location availability if provided
    if (unavailableCityIds !== undefined) {
      // Get all active cities
      const allCities = await prisma.city.findMany({
        where: { isActive: true },
        select: { id: true },
      });

      // Update each city's availability
      for (const city of allCities) {
        const isAvailable = !unavailableCityIds.includes(city.id);

        await prisma.locationAvailability.upsert({
          where: { cityId: city.id },
          update: { isAvailable },
          create: {
            cityId: city.id,
            isAvailable,
          },
        });
      }
    }

    // Fetch updated settings
    const updatedPackageSettings = await prisma.packageSetting.findMany({
      orderBy: { packageType: 'asc' },
    });

    const updatedLocationAvailability = await prisma.locationAvailability.findMany({
      include: { city: true },
    });

    return NextResponse.json({
      packageSettings: updatedPackageSettings,
      locationAvailability: updatedLocationAvailability,
      unavailableCityIds: updatedLocationAvailability
        .filter((l) => !l.isAvailable)
        .map((l) => l.cityId),
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Greška pri ažuriranju podešavanja' },
      { status: 500 }
    );
  }
}
