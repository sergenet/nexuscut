/**
 * scripts/newsletter.js — Automated Creator Weekly Newsletter Dispatcher for NexusCut.
 *
 * Runs via cron (every Friday at 10:00 AM UTC):
 *   0 10 * * 5 cd /var/www/nexuscut && /usr/bin/node scripts/newsletter.js >> scripts/newsletter.log 2>&1
 *
 * Anti-Repetition Architecture:
 *   - Maintains persistent archive of past issues in scripts/newsletter-archive.json
 *   - Feeds past subjects, summaries, and gear picks into the OpenAI prompt with strict "no-repeat" instructions
 *   - Rotates through 8 distinct core creator pillars (pacing, audio, color, subtitles, hooks, B-roll, workflow, lighting)
 *   - Tracks recommended gear to prevent duplicate Amazon recommendations
 */

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');

const ARCHIVE_FILE = path.join(__dirname, 'newsletter-archive.json');

// 1. Load environment variables manually from .env and .env.local (no external dotenv required)
function loadEnv() {
  const root = path.resolve(__dirname, '..');
  const envFiles = [path.join(root, '.env'), path.join(root, '.env.local')];

  for (const file of envFiles) {
    if (fs.existsSync(file)) {
      const lines = fs.readFileSync(file, 'utf-8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const AFFILIATE_TAG = 'sergenet05-20';
const SMTP_HOST = process.env.SMTP_HOST || 'premium303.web-hosting.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_USER = process.env.SMTP_USER || 'noreply@nexuscut.io';
const SMTP_PASS = process.env.SMTP_PASS || '***REMOVED***';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 8 rotating creator pillars to guarantee each week covers a distinct discipline
const CREATOR_PILLARS = [
  {
    name: 'Micro-Pacing & Visual Velocity',
    theme: 'cutting techniques, 2-3 second visual resets, pattern interrupts, J-cuts/L-cuts, and eliminating dead air',
  },
  {
    name: 'Audio Engineering & Sound Design',
    theme: 'audio ducking, sub-bass riser impacts, EQ curves for voice crispness, and SFX layer stacking',
  },
  {
    name: 'Color Grading & Mobile Visual Contrast',
    theme: 'skin tone protection, LUT application, AMOLED screen contrast curves, and saturation balance for phone feeds',
  },
  {
    name: 'Kinetic Typography & Subtitle Psychology',
    theme: 'word-by-word animation curves, emphasis coloring, optimal read-rates, and vertical video safe zones',
  },
  {
    name: 'Viral Hook Architecture & Psychology',
    theme: 'proof-first cold opens, negative curiosity, optical misdirection, and first-frame composition',
  },
  {
    name: 'B-Roll Mastery & Motion Graphics',
    theme: 'speed ramping, kinetic transitions, parallax depth, 3D text tracking, and contextual overlay timing',
  },
  {
    name: 'High-Speed Editing Workflows',
    theme: 'ripple edit macros, pancake timelines, nesting strategies, asset organization, and keyboard efficiency',
  },
  {
    name: 'Lighting, Camera Rigs & Studio Setup',
    theme: 'key-to-fill ratios, rim separation, mobile sensor sweet spots, lens focal choice, and clean background depth',
  },
];

// Load past issue history
function loadArchive() {
  try {
    if (fs.existsSync(ARCHIVE_FILE)) {
      const data = JSON.parse(fs.readFileSync(ARCHIVE_FILE, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn('[Newsletter] Could not read archive, starting fresh:', err.message);
  }
  return [];
}

// Append newly dispatched issue to history
function saveArchive(entry) {
  try {
    const archive = loadArchive();
    archive.push(entry);
    fs.writeFileSync(ARCHIVE_FILE, JSON.stringify(archive, null, 2), 'utf-8');
    console.log(`[Newsletter] Saved issue #${archive.length} to archive (${entry.subject})`);
  } catch (err) {
    console.error('[Newsletter] Failed to save archive:', err.message);
  }
}

// Transporter configuration
function createTransporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

// Generate newsletter content via OpenAI with anti-repetition memory
async function generateNewsletterContent() {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is missing from environment.');
  }

  const archive = loadArchive();
  const issueNumber = archive.length + 1;
  const pillarIndex = (issueNumber - 1) % CREATOR_PILLARS.length;
  const currentPillar = CREATOR_PILLARS[pillarIndex];

  // Compile past history for the prompt
  const recentIssues = archive.slice(-12);
  const pastSubjects = recentIssues.map((i) => `"${i.subject}" (${i.pillar || 'general'})`).join('\n- ');
  const pastGear = Array.from(new Set(archive.flatMap((i) => i.gear || []))).slice(-20).join(', ');

  const pastContext = recentIssues.length > 0
    ? `\nPREVIOUSLY COVERED TOPICS & SUBJECTS (STRICT RULE: YOU MUST NOT REPEAT OR DUPLICATE THESE):\n- ${pastSubjects}\n\nPREVIOUSLY RECOMMENDED GEAR (DO NOT REPEAT THESE SPECIFIC PRODUCTS):\n${pastGear || 'None yet'}\n`
    : '';

  const prompt = `You are a viral video editing strategist writing Issue #${issueNumber} of "Creator Weekly" for NexusCut (an online AI video editor).

TODAY'S CORE PILLAR: "${currentPillar.name}"
Focus specifically on: ${currentPillar.theme}.
${pastContext}
STRICT REQUIREMENTS:
1. Provide a snappy, curiosity-inducing subject line as the very first line prefixed with "SUBJECT: ". It MUST be completely unique and not resemble past subjects.
2. Provide a 1-sentence summary of the main insight on the second line prefixed with "SUMMARY: ".
3. List 2 specific physical gear items recommended at the bottom on the third line prefixed with "GEAR: [Product 1, Product 2]". These MUST NOT have been recommended in past issues.
4. Write practical, cutting-edge insight with deep technical or psychological clarity (concrete numbers, exact millisecond timings, audio dB targets, or step-by-step workflow actions). Do NOT write vague generic fluff or high-level filler.
5. Keep the tone sharp, creator-focused, and inspiring.
6. At the bottom, introduce the "Creator Gear Pick of the Week" featuring the 2 physical gear items you chose.
   Format each gear recommendation link exactly as: [AMAZON_AFFILIATE_LINK:Exact Product Name]
7. Return the newsletter body formatted in clean, modern HTML with semantic tags (<h2>, <p>, <ul>, <li>, <strong>). Do NOT wrap in markdown code blocks or <html>/<body> tags.`;

  const model = 'gpt-4o';
  console.log(`[Newsletter] Requesting AI generation for Issue #${issueNumber} (Pillar: ${currentPillar.name}) via ${model}...`);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.85,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || '';

  let subject = `⚡ Creator Weekly #${issueNumber}: ${currentPillar.name}`;
  let summary = currentPillar.theme;
  let gear = [];
  let bodyHtml = rawText;

  const subjectMatch = rawText.match(/^SUBJECT:\s*(.+)$/m);
  if (subjectMatch) {
    subject = subjectMatch[1].trim();
    bodyHtml = bodyHtml.replace(/^SUBJECT:\s*.+$/m, '').trim();
  }

  const summaryMatch = rawText.match(/^SUMMARY:\s*(.+)$/m);
  if (summaryMatch) {
    summary = summaryMatch[1].trim();
    bodyHtml = bodyHtml.replace(/^SUMMARY:\s*.+$/m, '').trim();
  }

  const gearMatch = rawText.match(/^GEAR:\s*\[?([^\]\n]+)\]?$/m);
  if (gearMatch) {
    gear = gearMatch[1].split(',').map((g) => g.trim().replace(/^['"]|['"]$/g, ''));
    bodyHtml = bodyHtml.replace(/^GEAR:\s*.+$/m, '').trim();
  }

  // Replace Amazon placeholder links with affiliate tagged URLs
  bodyHtml = bodyHtml.replace(/\[AMAZON_AFFILIATE_LINK:(.*?)\]/g, (match, p1) => {
    const productName = p1.trim();
    if (!gear.includes(productName)) gear.push(productName);
    const query = encodeURIComponent(productName);
    const url = `https://www.amazon.com/s?k=${query}&tag=${AFFILIATE_TAG}`;
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #6366f1; font-weight: 600; text-decoration: underline;">${productName} ↗</a>`;
  });

  return {
    subject,
    summary,
    gear,
    pillar: currentPillar.name,
    issueNumber,
    bodyHtml,
  };
}

// Wrap content in a branded, responsive email template
function wrapEmailTemplate(subject, bodyHtml, recipientEmail, issueNumber) {
  const currentYear = new Date().getFullYear();
  const unsubUrl = `https://nexuscut.io/help?action=unsubscribe&email=${encodeURIComponent(recipientEmail)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0a0a0c; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #121216; border: 1px solid #26262e; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 36px; text-align: left;">
              <span style="display: inline-block; padding: 4px 12px; background: rgba(255,255,255,0.15); border-radius: 999px; font-size: 11px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                ⚡ Creator Weekly &bull; Issue #${issueNumber || 1}
              </span>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; line-height: 1.3;">
                NexusCut Creator Dispatch
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.8);">
                Actionable retention strategies, viral workflows &amp; creator tools
              </p>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 36px 36px 28px 36px; font-size: 15px; line-height: 1.7; color: #d1d5db;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- NexusCut CTA -->
          <tr>
            <td style="padding: 0 36px 32px 36px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #181820; border: 1px solid #2f2f3d; border-radius: 14px; padding: 20px 24px;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #ffffff;">Create faster in NexusCut</h3>
                    <p style="margin: 0 0 14px 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
                      Auto-captions, viral hook generators, and AI background remover built directly in your browser.
                    </p>
                    <a href="https://nexuscut.io/editor" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 13px; font-weight: 600;">
                      Open Video Editor →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0c0c0f; border-top: 1px solid #1f1f26; padding: 24px 36px; text-align: center; font-size: 12px; color: #6b7280; line-height: 1.6;">
              <p style="margin: 0 0 8px 0;">
                You are receiving this because you subscribed on <a href="https://nexuscut.io" style="color: #818cf8; text-decoration: none;">NexusCut.io</a>.
              </p>
              <p style="margin: 0;">
                <a href="${unsubUrl}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a> &bull;
                <a href="https://nexuscut.io/privacy" style="color: #9ca3af; text-decoration: underline;">Privacy</a> &bull;
                NexusCut &copy; ${currentYear}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Main execution routine
async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const testEmailArg = args.find((a) => a.startsWith('--test='));
  const testEmail = testEmailArg ? testEmailArg.split('=')[1].trim() : null;

  console.log(`[Newsletter] Starting execution at ${new Date().toISOString()}`);
  console.log(`[Newsletter] Options: dryRun=${isDryRun}, testEmail=${testEmail || 'none'}`);

  const prisma = new PrismaClient();
  const transporter = createTransporter();

  try {
    // Verify SMTP connection
    console.log(`[Newsletter] Verifying SMTP connection to ${SMTP_HOST}:${SMTP_PORT}...`);
    await transporter.verify();
    console.log('[Newsletter] SMTP connection verified successfully.');

    // Generate unique, non-repeating content
    const content = await generateNewsletterContent();
    console.log(`[Newsletter] Generated Issue #${content.issueNumber}: "${content.subject}"`);
    console.log(`[Newsletter] Pillar: ${content.pillar}`);
    console.log(`[Newsletter] Gear: ${content.gear.join(', ') || 'N/A'}`);

    // Determine recipients
    let recipients = [];
    if (testEmail) {
      recipients = [{ email: testEmail }];
    } else {
      const entries = await prisma.waitlistEntry.findMany({
        select: { email: true },
      });
      const uniqueEmails = Array.from(new Set(entries.map((e) => e.email.trim().toLowerCase())));
      recipients = uniqueEmails.map((email) => ({ email }));
    }

    console.log(`[Newsletter] Target recipients: ${recipients.length}`);

    if (recipients.length === 0) {
      console.log('[Newsletter] No subscribers found. Exiting.');
      return;
    }

    if (isDryRun) {
      console.log('[Newsletter] --dry-run active. Skipping actual email dispatch.');
      console.log('[Newsletter] Sample output length:', content.bodyHtml.length, 'characters.');
      return;
    }

    let sentCount = 0;
    let failCount = 0;

    for (const recipient of recipients) {
      try {
        const fullHtml = wrapEmailTemplate(content.subject, content.bodyHtml, recipient.email, content.issueNumber);

        await transporter.sendMail({
          from: `"NexusCut Creator Weekly" <${SMTP_USER}>`,
          to: recipient.email,
          subject: content.subject,
          html: fullHtml,
        });

        sentCount++;
        console.log(`[Newsletter] Sent successfully to ${recipient.email} (${sentCount}/${recipients.length})`);
      } catch (sendErr) {
        failCount++;
        console.error(`[Newsletter] Failed to send to ${recipient.email}:`, sendErr.message);
      }
    }

    console.log(`[Newsletter] Dispatch completed: ${sentCount} sent, ${failCount} failed.`);

    // Record into archive only on live full dispatches (or if at least 1 email sent)
    if (sentCount > 0 && !testEmail) {
      saveArchive({
        date: new Date().toISOString(),
        issueNumber: content.issueNumber,
        subject: content.subject,
        summary: content.summary,
        pillar: content.pillar,
        gear: content.gear,
        recipientCount: sentCount,
      });
    }
  } catch (err) {
    console.error('[Newsletter] Fatal error during dispatch:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
