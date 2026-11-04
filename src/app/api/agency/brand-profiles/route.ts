import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getVerifiedUser } from '@/lib/auth';

const validUrl = (value: unknown) => !value || (() => { try { return new URL(String(value)).protocol === 'https:'; } catch { return false; } })();
const allowed = (tier: string) => tier === 'agency';

export async function GET() {
  const user = await getVerifiedUser();
  if (!user || !allowed(user.planTier)) return NextResponse.json({ error: 'Agency membership required.' }, { status: 403 });
  return NextResponse.json({ profiles: await prisma.agencyBrandProfile.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'asc' } }) });
}

export async function POST(request: Request) {
  const user = await getVerifiedUser();
  if (!user || !allowed(user.planTier)) return NextResponse.json({ error: 'Agency membership required.' }, { status: 403 });
  const body = await request.json().catch(() => null) as { action?: string; id?: string; name?: string; primaryColor?: string; secondaryColor?: string; fontUrl?: string; logoUrl?: string } | null;
  if (!body) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  if (body.action === 'delete' && body.id) {
    await prisma.agencyBrandProfile.deleteMany({ where: { id: body.id, userId: user.id } });
    return NextResponse.json({ success: true });
  }
  if (body.action === 'activate' && body.id) {
    const profile = await prisma.agencyBrandProfile.findFirst({ where: { id: body.id, userId: user.id } });
    if (!profile) return NextResponse.json({ error: 'Client profile not found.' }, { status: 404 });
    const brandKit = await prisma.brandKit.upsert({ where: { userId: user.id }, update: { primaryColor: profile.primaryColor, secondaryColor: profile.secondaryColor, fontUrl: profile.fontUrl, logoUrl: profile.logoUrl }, create: { userId: user.id, primaryColor: profile.primaryColor, secondaryColor: profile.secondaryColor, fontUrl: profile.fontUrl, logoUrl: profile.logoUrl } });
    return NextResponse.json({ success: true, brandKit });
  }
  const name = body.name?.trim().slice(0, 60);
  if (!name || !/^#[0-9a-f]{6}$/i.test(body.primaryColor || '') || !/^#[0-9a-f]{6}$/i.test(body.secondaryColor || '') || !validUrl(body.fontUrl) || !validUrl(body.logoUrl)) return NextResponse.json({ error: 'Provide a name, valid colors, and HTTPS asset URLs.' }, { status: 400 });
  if (!body.id && await prisma.agencyBrandProfile.count({ where: { userId: user.id } }) >= 5) return NextResponse.json({ error: 'Agency includes up to 5 client Brand Kits.' }, { status: 409 });
  if (body.id) await prisma.agencyBrandProfile.updateMany({ where: { id: body.id, userId: user.id }, data: { name, primaryColor: body.primaryColor, secondaryColor: body.secondaryColor, fontUrl: body.fontUrl || null, logoUrl: body.logoUrl || null } });
  const profile = body.id ? await prisma.agencyBrandProfile.findFirst({ where: { id: body.id, userId: user.id } }) : await prisma.agencyBrandProfile.create({ data: { userId: user.id, name, primaryColor: body.primaryColor, secondaryColor: body.secondaryColor, fontUrl: body.fontUrl || null, logoUrl: body.logoUrl || null } });
  return NextResponse.json({ profile });
}
