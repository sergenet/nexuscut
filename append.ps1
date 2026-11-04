$content = Get-Content -Raw -Path prisma\schema.prisma
$content = $content.Replace('  referrals        Referral[]', "  referrals        Referral[]
  purchases        Purchase[]")
$content += "

model Purchase {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  itemId    String
  amount    Float
  createdAt DateTime @default(now())

  @@unique([userId, itemId])
}"
Set-Content -Path prisma\schema.prisma -Value $content
