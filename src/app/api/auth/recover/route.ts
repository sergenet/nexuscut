import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email: rawEmail, returnTo: rawReturnTo } = await req.json();
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('Sign-in email is unavailable: SMTP is not configured.');
      return NextResponse.json({ error: 'Email sign-in is temporarily unavailable. Please contact support.' }, { status: 503 });
    }

    // Create the account only after this address receives a link. Keeping the
    // same response also prevents email enumeration.
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, clerkId: `pending-${crypto.randomUUID()}` },
    });

    // 2. Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // 3. Save token in database
    await prisma.magicLink.create({
      data: {
        email,
        token,
        expiresAt
      }
    });

    // 4. Send email using Namecheap SMTP via nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.privateemail.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: parseInt(process.env.SMTP_PORT || '465') === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Some hosted mail services use a branded hostname but present the
      // provider certificate. Validate the provider name explicitly instead
      // of disabling TLS certificate checks.
      ...(process.env.SMTP_TLS_SERVERNAME ? { tls: { servername: process.env.SMTP_TLS_SERVERNAME } } : {}),
    });

    // Only allow known internal destinations. This prevents a sign-in link
    // from ever becoming an open redirect to another website.
    const returnTo = typeof rawReturnTo === 'string' && rawReturnTo.startsWith('/') && !rawReturnTo.startsWith('//')
      ? rawReturnTo
      : '';
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://nexuscut.io'}/api/auth/verify?token=${token}${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ''}`;

    const mailOptions = {
      from: `"NexusCut" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Sign in to NexusCut',
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; background-color: #000; color: #fff; border-radius: 10px;">
          <h2 style="color: #39ff14;">Sign in to NexusCut</h2>
          <p style="color: #ccc; font-size: 16px;">Click the button below to securely sign in to your NexusCut account.</p>
          <p style="color: #888; font-size: 14px;">This link will expire in 15 minutes.</p>
          <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #39ff14; color: #000; text-decoration: none; font-weight: bold; border-radius: 5px; margin-top: 20px;">
            Sign in to NexusCut
          </a>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Recovery error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
