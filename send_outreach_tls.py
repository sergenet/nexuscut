import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import time

smtp_server = "premium303.web-hosting.com"
smtp_port = 465
username = "noreply@nexuscut.io"
password = __import__('os').environ.get('VPS_PASSWORD','')

recipients = [
    ("Justin Brown", "business@primalvideo.com", "your videos on video editing tools and speeding up workflow"),
    ("Kelsey Brannan", "contact@premieregal.com", "your tutorials on new editing tech and AI plugins"),
    ("Sean Cannell", "support@seancannell.com", "your videos on YouTube growth and tools for creators"),
    ("Sam Kolder", "samkoldermedia@gmail.com", "your cinematic edits and transitions"),
    ("No Film School Editor", "editor@nofilmschool.com", "your coverage of filmmaking tech and indie editing tools"),
    ("FilterGrade Team", "support@filtergrade.com", "your roundups of creator tools and templates"),
    ("CineD Office", "office@cined.com", "your tech reviews for filmmakers"),
    ("TechRadar Computing", "computing@techradar.com", "your consumer software reviews"),
    ("PCMag Reviews", "reviews@pcmag.com", "your software benchmarking and reviews")
]

try:
    server = smtplib.SMTP_SSL(smtp_server, smtp_port)
    server.login(username, password)
    
    for name, email, topic in recipients:
        msg = MIMEMultipart()
        msg['From'] = username
        msg['To'] = email
        msg['Subject'] = "Early access: A browser video editor that doesn't freeze"
        
        body = f"""Hey {name},

I love {topic}. 

I just built NexusCut, a next-gen browser-based video editor. Unlike other web editors that crash on heavy files, we just deployed a custom rendering engine that processes cinematic transitions in seconds, entirely in the cloud.

I'd love to give you a free lifetime Pro account if you're open to testing it out and sharing your feedback. 

You can try it here: https://nexuscut.io

Let me know what you think!

Best,
Serge
Founder, NexusCut"""
        
        msg.attach(MIMEText(body, 'plain'))
        server.send_message(msg)
        print(f"Sent email to {email}")
        time.sleep(1)
        
    server.quit()
    print("All outreach emails sent successfully!")
except Exception as e:
    print(f"Failed to send emails: {e}")
