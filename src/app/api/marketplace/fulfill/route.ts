import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';
import { marketplaceCatalog } from '@/lib/marketplaceData';
import {
  createDownloadToken,
  filesForItem,
  LINK_TTL_SECONDS,
} from '@/lib/marketplaceDelivery';

export const runtime = 'nodejs';

const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

function successRedirect(itemId: string, emailed: boolean) {
  return NextResponse.redirect(
    new URL(
      `/marketplace/success?item_id=${encodeURIComponent(itemId)}&emailed=${emailed ? 1 : 0}`,
      APP_URL(),
    ),
    303,
  );
}

async function sendPurchaseEmail(
  to: string,
  itemName: string,
  links: string[],
): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('Marketplace delivery: SMTP is not configured; links were not emailed.');
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.privateemail.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: parseInt(process.env.SMTP_PORT || '465', 10) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    ...(process.env.SMTP_TLS_SERVERNAME
      ? { tls: { servername: process.env.SMTP_TLS_SERVERNAME } }
      : {}),
  });

  const days = Math.round(LINK_TTL_SECONDS / (24 * 60 * 60));
  const listItems = links
    .map(
      (link, index) =>
        `<li style="margin:14px 0"><a href="${link}" style="display:inline-block;padding:12px 22px;background-color:#39ff14;color:#000;text-decoration:none;font-weight:bold;border-radius:6px">Download file ${index + 1}</a></li>`,
    )
    .join('');

  await transporter.sendMail({
    from: `"NexusCut" <${process.env.SMTP_USER}>`,
    to,
    subject: `Your NexusCut purchase: ${itemName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#000;color:#fff;border-radius:10px">
        <h2 style="color:#39ff14">Thanks for your purchase!</h2>
        <p style="color:#ccc;font-size:16px">You bought <strong>${itemName}</strong>. Your download links are below.</p>
        <ul style="list-style:none;padding:0">${listItems}</ul>
        <p style="color:#888;font-size:13px">These links are personal to you and expire in ${days} days. Keep this email if you need them again.</p>
        <p style="color:#888;font-size:13px">Questions? Just reply to this email.</p>
      </div>`,
  }).catch((error: unknown) => {
    console.error('Marketplace delivery email failed:', error);
  });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('session_id') || '';
    const itemIdParam = url.searchParams.get('item_id') || '';

    if (!process.env.STRIPE_SECRET_KEY || !sessionId) {
      return NextResponse.json({ error: 'Missing Stripe configuration' }, { status: 503 });
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-06-24.dahlia',
    });

    // Payment is confirmed server-side; the browser never attests anything.
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return successRedirect(itemIdParam, false);
    }

    const itemId = session.metadata?.itemId || itemIdParam;
    const item = marketplaceCatalog.find((entry) => entry.id === itemId);
    if (!item) {
      return NextResponse.json({ error: 'Unknown purchased item' }, { status: 404 });
    }

    // The checkout was created for a signed-in user; resolve their account.
    const clerkId = session.client_reference_id;
    const user = clerkId
      ? await prisma.user.findUnique({ where: { clerkId } })
      : null;
    if (!user) {
      console.error('Marketplace fulfillment: no user for session', session.id);
      return successRedirect(itemId, false);
    }

    // Idempotent: the unique (userId, itemId) row marks an already-delivered
    // purchase, so refresh callbacks never double-email.
    const existing = await prisma.purchase.findUnique({
      where: { userId_itemId: { userId: user.id, itemId } },
    });

    if (!existing) {
      await prisma.purchase.create({
        data: { userId: user.id, itemId, amount: item.price },
      });

      const files = filesForItem(itemId);
      if (files.length > 0 && user.email) {
        const links = files.map(
          (file, index) =>
            `${APP_URL()}/api/marketplace/download/${encodeURIComponent(createDownloadToken(itemId, index))}`,
        );
        await sendPurchaseEmail(user.email, item.name, links);
      } else if (files.length === 0) {
        console.error(`Marketplace fulfillment: no files staged for ${itemId}`);
      }
    } else {
      // Already delivered once; keep the success page honest about it.
      console.log(`Marketplace fulfillment: ${itemId} already delivered to ${user.id}`);
    }

    return successRedirect(itemId, Boolean(existing || filesForItem(itemId).length));
  } catch (error: unknown) {
    console.error('Marketplace fulfillment error:', error);
    return NextResponse.json({ error: 'Fulfillment failed' }, { status: 500 });
  }
}
