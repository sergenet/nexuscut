import smtplib
import sys

try:
    server = smtplib.SMTP_SSL('mail.nexuscut.io', 465)
    server.set_debuglevel(1)
    server.login('noreply@nexuscut.io', __import__('os').environ.get('SMTP_PASSWORD',''))
    print("SUCCESS")
    server.quit()
except Exception as e:
    print("FAILED:", e)
