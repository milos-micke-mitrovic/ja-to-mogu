import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Ja To Mogu <noreply@jatomogu.rs>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3854';

interface EmailResult {
  success: boolean;
  error?: string;
}

// Email verification after registration
export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<EmailResult> {
  const verifyUrl = `${APP_URL}/sr/verify-email?token=${token}`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Potvrdite vašu email adresu - Ja To Mogu',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #F5B800; margin: 0;">Ja To Mogu</h1>
            <p style="color: #666; margin-top: 5px;">Last-minute smeštaj u Grčkoj</p>
          </div>

          <h2 style="color: #333;">Dobrodošli, ${name}!</h2>

          <p>Hvala vam što ste se registrovali na platformi Ja To Mogu.</p>

          <p>Kliknite na dugme ispod da potvrdite vašu email adresu:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #F5B800; color: #000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Potvrdite email
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">
            Ako dugme ne radi, kopirajte i nalepite ovaj link u pregledač:<br>
            <a href="${verifyUrl}" style="color: #F5B800;">${verifyUrl}</a>
          </p>

          <p style="color: #666; font-size: 14px;">
            Link za potvrdu ističe za 24 sata.
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

          <p style="color: #999; font-size: 12px; text-align: center;">
            Ako niste kreirali nalog na Ja To Mogu, slobodno ignorišite ovaj email.
          </p>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Email service error:', err);
    return { success: false, error: 'Greška pri slanju emaila' };
  }
}

// Password reset email
export async function sendPasswordResetEmail(
  email: string,
  name: string | null,
  token: string
): Promise<EmailResult> {
  const resetUrl = `${APP_URL}/sr/reset-password?token=${token}`;
  const displayName = name || 'korisniče';

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Resetovanje lozinke - Ja To Mogu',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #F5B800; margin: 0;">Ja To Mogu</h1>
            <p style="color: #666; margin-top: 5px;">Last-minute smeštaj u Grčkoj</p>
          </div>

          <h2 style="color: #333;">Resetovanje lozinke</h2>

          <p>Pozdrav ${displayName},</p>

          <p>Primili smo zahtev za resetovanje lozinke za vaš nalog.</p>

          <p>Kliknite na dugme ispod da postavite novu lozinku:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #F5B800; color: #000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Resetujte lozinku
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">
            Ako dugme ne radi, kopirajte i nalepite ovaj link u pregledač:<br>
            <a href="${resetUrl}" style="color: #F5B800;">${resetUrl}</a>
          </p>

          <p style="color: #666; font-size: 14px;">
            Link za resetovanje ističe za 1 sat.
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

          <p style="color: #999; font-size: 12px; text-align: center;">
            Ako niste zatražili resetovanje lozinke, slobodno ignorišite ovaj email.<br>
            Vaša lozinka neće biti promenjena.
          </p>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Email service error:', err);
    return { success: false, error: 'Greška pri slanju emaila' };
  }
}

// Booking confirmation email to guest
interface BookingEmailData {
  bookingId: string;
  guestName: string;
  guestEmail: string;
  accommodationName: string;
  accommodationAddress: string;
  destination: string;
  arrivalDate: string;
  duration: string;
  packageType: 'BASIC' | 'BONUS';
  totalPrice: number;
  ownerName?: string;
  ownerPhone?: string;
}

function formatDuration(duration: string): string {
  switch (duration) {
    case 'TWO_THREE': return '2-3 dana';
    case 'FOUR_SEVEN': return '4-7 dana';
    case 'EIGHT_TEN': return '8-10 dana';
    case 'TEN_PLUS': return '10+ dana';
    default: return duration;
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD',
    minimumFractionDigits: 0,
  }).format(price);
}

export async function sendBookingConfirmationEmail(
  data: BookingEmailData
): Promise<EmailResult> {
  const dashboardUrl = `${APP_URL}/sr/dashboard`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.guestEmail,
      subject: `Potvrda rezervacije - ${data.accommodationName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #F5B800; margin: 0;">Ja To Mogu</h1>
            <p style="color: #666; margin-top: 5px;">Last-minute smeštaj u Grčkoj</p>
          </div>

          <div style="background-color: #10B981; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
            <h2 style="margin: 0;">Rezervacija potvrđena!</h2>
          </div>

          <p>Pozdrav ${data.guestName},</p>

          <p>Vaša rezervacija je uspešno kreirana. Evo detalja:</p>

          <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">${data.accommodationName}</h3>
            <p style="margin: 5px 0; color: #666;">${data.accommodationAddress}</p>
            <p style="margin: 5px 0; color: #666;">${data.destination}</p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">

            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="padding: 5px 0; color: #666;">Datum dolaska:</td>
                <td style="padding: 5px 0; text-align: right; font-weight: 600;">${data.arrivalDate}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #666;">Trajanje:</td>
                <td style="padding: 5px 0; text-align: right; font-weight: 600;">${formatDuration(data.duration)}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #666;">Paket:</td>
                <td style="padding: 5px 0; text-align: right; font-weight: 600;">${data.packageType === 'BONUS' ? 'Bonus paket' : 'Osnovni paket'}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #666;">Ukupna cena:</td>
                <td style="padding: 5px 0; text-align: right; font-weight: 600; color: #F5B800;">${formatPrice(data.totalPrice)}</td>
              </tr>
            </table>

            ${data.ownerName ? `
            <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
            <p style="margin: 5px 0; font-size: 14px;"><strong>Kontakt vlasnika:</strong></p>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">${data.ownerName}${data.ownerPhone ? ` - ${data.ownerPhone}` : ''}</p>
            ` : ''}
          </div>

          <p style="color: #666; font-size: 14px;">
            <strong>Napomena:</strong> Rezervacija važi 36 sati. Molimo vas da kontaktirate vlasnika smeštaja u tom periodu radi potvrde.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" style="background-color: #F5B800; color: #000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Pogledajte rezervaciju
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

          <p style="color: #999; font-size: 12px; text-align: center;">
            ID rezervacije: ${data.bookingId}<br>
            Hvala što koristite Ja To Mogu!
          </p>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Email service error:', err);
    return { success: false, error: 'Greška pri slanju emaila' };
  }
}

// Notification email to accommodation owner
interface OwnerNotificationData {
  ownerName: string;
  ownerEmail: string;
  guestName: string;
  guestPhone: string;
  accommodationName: string;
  arrivalDate: string;
  duration: string;
  packageType: 'BASIC' | 'BONUS';
}

export async function sendOwnerBookingNotification(
  data: OwnerNotificationData
): Promise<EmailResult> {
  const adminUrl = `${APP_URL}/sr/owner/bookings`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.ownerEmail,
      subject: `Nova rezervacija - ${data.accommodationName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #F5B800; margin: 0;">Ja To Mogu</h1>
            <p style="color: #666; margin-top: 5px;">Obaveštenje za vlasnike</p>
          </div>

          <div style="background-color: #F5B800; color: #000; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
            <h2 style="margin: 0;">Nova rezervacija!</h2>
          </div>

          <p>Pozdrav ${data.ownerName},</p>

          <p>Imate novu rezervaciju za vaš smeštaj <strong>${data.accommodationName}</strong>.</p>

          <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Detalji rezervacije</h3>

            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="padding: 5px 0; color: #666;">Gost:</td>
                <td style="padding: 5px 0; text-align: right; font-weight: 600;">${data.guestName}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #666;">Telefon gosta:</td>
                <td style="padding: 5px 0; text-align: right; font-weight: 600;">${data.guestPhone}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #666;">Datum dolaska:</td>
                <td style="padding: 5px 0; text-align: right; font-weight: 600;">${data.arrivalDate}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #666;">Trajanje:</td>
                <td style="padding: 5px 0; text-align: right; font-weight: 600;">${formatDuration(data.duration)}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #666;">Paket:</td>
                <td style="padding: 5px 0; text-align: right; font-weight: 600;">${data.packageType === 'BONUS' ? 'Bonus paket' : 'Osnovni paket'}</td>
              </tr>
            </table>
          </div>

          <p style="color: #666; font-size: 14px;">
            <strong>Važno:</strong> Molimo vas da kontaktirate gosta u roku od 36 sati kako biste potvrdili rezervaciju.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${adminUrl}" style="background-color: #F5B800; color: #000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Pogledajte rezervacije
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

          <p style="color: #999; font-size: 12px; text-align: center;">
            Ovo je automatsko obaveštenje sa platforme Ja To Mogu.
          </p>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Email service error:', err);
    return { success: false, error: 'Greška pri slanju emaila' };
  }
}
