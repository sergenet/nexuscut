with open('prisma/schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('referrals        Referral[]', 'referrals        Referral[]\n  purchases        Purchase[]')

content += '''

model Purchase {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  itemId    String
  amount    Float
  createdAt DateTime @default(now())

  @@unique([userId, itemId])
}
'''

with open('prisma/schema.prisma', 'w', encoding='utf-8') as f:
    f.write(content)

print("Schema appended")
