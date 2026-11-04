import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, channelUrl } = body;

    if (!email || !channelUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Still keep track of the application
    await prisma.affiliateApplication.create({
      data: {
        email,
        channelUrl,
        status: 'approved' // auto-approve
      },
    });

    // Auto-generate affiliate code based on email prefix
    const baseCode = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    const randomSuffix = Math.floor(Math.random() * 10000);
    const generatedCode = `${baseCode}${randomSuffix}`;

    const affiliate = await prisma.affiliate.upsert({
      where: { payoutEmail: email },
      update: {}, // Don't override if they already exist
      create: {
        payoutEmail: email,
        affiliateCode: generatedCode,
        commissionRate: 0.3,
        payoutThreshold: 50.0
      }
    });

    return NextResponse.json({ success: true, code: affiliate.affiliateCode });
  } catch (error: unknown) {
    console.error('Affiliate application error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
