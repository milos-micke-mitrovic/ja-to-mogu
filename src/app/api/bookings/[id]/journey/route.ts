import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { sendJourneyStatusNotification } from '@/lib/email';
import { formatDate } from '@/lib/utils';

// PATCH - Update journey status
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

    const body = await request.json();
    const { journeyStatus } = body;

    // Validate journey status
    const validStatuses = ['NOT_STARTED', 'DEPARTED', 'IN_GREECE', 'ARRIVED'];
    if (!validStatuses.includes(journeyStatus)) {
      return NextResponse.json(
        { error: 'Nevažeći status putovanja' },
        { status: 400 }
      );
    }

    // Find booking and verify ownership
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
          },
        },
        guide: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        accommodation: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Rezervacija nije pronađena' },
        { status: 404 }
      );
    }

    // Check if user owns this booking or is the guide/admin
    const isOwner = booking.userId === session.user.id;
    const isGuide = booking.guideId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isOwner && !isGuide && !isAdmin) {
      return NextResponse.json(
        { error: 'Nemate dozvolu za ovu akciju' },
        { status: 403 }
      );
    }

    // Update journey status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        journeyStatus,
        // Update timestamps based on status
        ...(journeyStatus === 'DEPARTED' && { departedAt: new Date() }),
        ...(journeyStatus === 'IN_GREECE' && { arrivedGreeceAt: new Date() }),
        ...(journeyStatus === 'ARRIVED' && { arrivedDestinationAt: new Date() }),
      },
      include: {
        accommodation: true,
        guide: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    // Send notifications to owner and guide based on status change
    const guestName = booking.user?.name || 'Gost';
    const guestPhone = booking.user?.phone || 'N/A';
    const arrivalDate = formatDate(booking.arrivalDate);

    // Notify the accommodation owner
    if (booking.accommodation.owner?.email) {
      await sendJourneyStatusNotification({
        recipientEmail: booking.accommodation.owner.email,
        recipientName: booking.accommodation.owner.name || 'Vlasniče',
        recipientRole: 'OWNER',
        guestName,
        guestPhone,
        accommodationName: booking.accommodation.name,
        journeyStatus,
        arrivalDate,
      });
    }

    // Notify the guide if assigned
    if (booking.guide?.email) {
      await sendJourneyStatusNotification({
        recipientEmail: booking.guide.email,
        recipientName: booking.guide.name || 'Vodiče',
        recipientRole: 'GUIDE',
        guestName,
        guestPhone,
        accommodationName: booking.accommodation.name,
        journeyStatus,
        arrivalDate,
      });
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating journey status:', error);
    return NextResponse.json(
      { error: 'Greška pri ažuriranju statusa' },
      { status: 500 }
    );
  }
}
