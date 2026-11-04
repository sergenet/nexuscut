import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    script = """
require('dotenv').config({ path: '/var/www/nexuscut/.env' });
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');

const affiliateTag = "sergenet05-20";

async function generateNewsletterContent() {
    const prompt = `You are a professional video editing expert writing a weekly newsletter for a list of video editors.
Write a highly innovative, deeply valuable newsletter offering new editing strategies, trends, or workflow hacks.
It MUST be entirely different from previous weeks. Do not repeat standard advice. Give real, cutting-edge insight (e.g., using AI tools, specific color grading workflows, psychological retention tricks).
At the end, naturally recommend 2 pieces of physical gear (like a microphone, camera, or lighting) and include an Amazon placeholder link formatted as [AMAZON_AFFILIATE_LINK:ProductName].
Keep it engaging, professional, and formatted in HTML. Do not wrap in markdown block.`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.8
        })
    });

    const data = await res.json();
    if (!data.choices || !data.choices[0]) {
        console.error("OpenAI Error:", data);
        process.exit(1);
    }
    
    let content = data.choices[0].message.content;
    
    // Inject the actual amazon affiliate link logic
    content = content.replace(/\[AMAZON_AFFILIATE_LINK:(.*?)\]/g, (match, p1) => {
        const query = encodeURIComponent(p1.trim());
        return `<a href="https://www.amazon.com/s?k=${query}&tag=${affiliateTag}" target="_blank" style="color: #6366f1; text-decoration: underline;">${p1.trim()}</a>`;
    });

    return content;
}

async function sendNewsletters() {
    console.log("Generating newsletter content via OpenAI...");
    const htmlContent = await generateNewsletterContent();
    console.log("Content generated successfully.");

    // Connect to SQLite DB
    const db = new sqlite3.Database('/var/www/nexuscut/prisma/dev.db', (err) => {
        if (err) {
            console.error(err.message);
            process.exit(1);
        }
    });

    // Use local sendmail on the VPS
    let transporter = nodemailer.createTransport({
        sendmail: true,
        newline: 'unix',
        path: '/usr/sbin/sendmail'
    });

    db.all(`SELECT DISTINCT email FROM WaitlistEntry`, [], async (err, rows) => {
        if (err) {
            console.error("DB Error:", err.message);
            return;
        }

        console.log(`Found ${rows.length} subscribers.`);
        
        for (let row of rows) {
            try {
                await transporter.sendMail({
                    from: '"NexusCut Team" <newsletter@nexuscut.io>',
                    to: row.email,
                    subject: 'Exclusive Weekly Editing Hacks & Gear',
                    html: htmlContent
                });
                console.log(`Sent to ${row.email}`);
            } catch(e) {
                console.error(`Failed to send to ${row.email}:`, e);
            }
        }
        
        db.close();
        console.log("Newsletter dispatch complete.");
    });
}

sendNewsletters();
"""
    sftp = ssh.open_sftp()
    
    # ensure scripts dir exists
    ssh.exec_command('mkdir -p /var/www/nexuscut/scripts')
    
    with sftp.file('/var/www/nexuscut/scripts/newsletter.js', 'w') as f:
        f.write(script)
    sftp.close()
    
    # install dependencies if not exists
    ssh.exec_command('cd /var/www/nexuscut/scripts && npm install sqlite3 nodemailer dotenv')
    
    print("Script deployed and installing dependencies.")
    ssh.close()
except Exception as e:
    print(e)
