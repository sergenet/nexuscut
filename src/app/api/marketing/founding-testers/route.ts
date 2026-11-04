import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';
import { parseAttributionCookie } from '@/lib/attribution';
import { sendMetaConversion } from '@/lib/metaConversions';

export const runtime = 'nodejs';

const creatorTypes = new Set([
  'short-form creator',
  'podcaster',
  'coach or educator',
  'marketer or business owner',
  'freelance editor',
  'other',
]);

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function validEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function notifyOwner(name: string, email: string, creatorType: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;
  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.nexuscut.io',
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    ...(process.env.SMTP_TLS_SERVERNAME ? { tls: { servername: process.env.SMTP_TLS_SERVERNAME } } : {}),
  });
  await transporter.sendMail({
    from: `"NexusCut Tester Program" <${process.env.SMTP_USER}>`,
    to: process.env.FEEDBACK_TO || process.env.SMTP_USER,
    replyTo: email,
    subject: '[NexusCut] New founding tester application',
    text: `Name: ${name}\nEmail: ${email}\nCreator type: ${creatorType}\n\nReview this application in the NexusCut owner dashboard.`,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    // Quietly accept the hidden field when a bot fills it. Genuine visitors
    // never see or populate this input.
    if (clean(body.website, 200)) return NextResponse.json({ success: true });

    const name = clean(body.name, 80);
    const email = clean(body.email, 254).toLowerCase();
    const creatorType = clean(body.creatorType, 60).toLowerCase();
    if (name.length < 2) return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
    if (!validEmail(email)) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    if (!creatorTypes.has(creatorType)) return NextResponse.json({ error: 'Please choose what best describes you.' }, { status: 400 });

    const cookieStore = await cookies();
    const attribution = parseAttributionCookie(cookieStore.get('nexus_attribution')?.value);
    const application = await prisma.foundingTesterApplication.upsert({
      where: { email },
      update: {
        name,
        creatorType,
        visitorId: attribution.visitorId,
        source: attribution.source,
        medium: attribution.medium,
        campaign: attribution.campaign,
        content: attribution.content,
      },
      create: {
        name,
        email,
        creatorType,
        visitorId: attribution.visitorId,
        source: attribution.source,
        medium: attribution.medium,
        campaign: attribution.campaign,
        content: attribution.content,
      },
    });

    const eventId = `lead_${application.id}`;
    await prisma.conversionEvent.upsert({
      where: { externalEventId: eventId },
      update: {},
      create: {
        externalEventId: eventId,
        eventName: 'Lead',
        visitorId: attribution.visitorId,
        source: attribution.source,
        medium: attribution.medium,
        campaign: attribution.campaign,
        content: attribution.content,
        value: 0,
      },
    });

    const sourceUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://nexuscut.io'}/creator-challenge`;
    const backgroundResults = await Promise.allSettled([
      sendMetaConversion({ eventName: 'Lead', eventId, email, sourceUrl, value: 0 }),
      notifyOwner(name, email, creatorType),
    ]);
    backgroundResults.forEach(result => {
      if (result.status === 'rejected') console.error('Founding tester follow-up failed:', result.reason);
    });

    return NextResponse.json({ success: true, eventId });
  } catch (error) {
    console.error('Founding tester application failed:', error);
    return NextResponse.json({ error: 'Your application could not be saved. Please try again.' }, { status: 500 });
  }
}
