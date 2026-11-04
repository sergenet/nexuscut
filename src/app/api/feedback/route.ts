import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return NextResponse.json({ error: 'Feedback email is temporarily unavailable.' }, { status: 503 });
    const data = await request.formData();
    const details = String(data.get('details') || '').trim();
    const type = String(data.get('type') || 'general');
    const email = String(data.get('email') || '').trim();
    const page = String(data.get('page') || '');
    const browser = String(data.get('browser') || '');
    const screen = String(data.get('screen') || '');
    const attachment = data.get('attachment');
    if (details.length < 8 || details.length > 5000) return NextResponse.json({ error: 'Please provide feedback between 8 and 5,000 characters.' }, { status: 400 });
    if (attachment instanceof File && attachment.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Attachments must be under 5 MB.' }, { status: 400 });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.nexuscut.io', port: Number(process.env.SMTP_PORT || 465), secure: Number(process.env.SMTP_PORT || 465) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      ...(process.env.SMTP_TLS_SERVERNAME ? { tls: { servername: process.env.SMTP_TLS_SERVERNAME } } : {}),
    });
    await transporter.sendMail({
      from: `"NexusCut Feedback" <${process.env.SMTP_USER}>`, to: process.env.FEEDBACK_TO || process.env.SMTP_USER,
      replyTo: email || undefined, subject: `[NexusCut feedback] ${type === 'export' ? 'Export result' : 'Editor test'}`,
      text: `Type: ${type}\nReply email: ${email || 'Not provided'}\nPage: ${page}\nScreen: ${screen}\nBrowser: ${browser}\n\nFeedback:\n${details}`,
      attachments: attachment instanceof File && attachment.size > 0 ? [{ filename: attachment.name || 'attachment', content: Buffer.from(await attachment.arrayBuffer()), contentType: attachment.type || undefined }] : undefined,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback submission failed:', error);
    return NextResponse.json({ error: 'Could not send feedback.' }, { status: 500 });
  }
}
