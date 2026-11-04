 = Invoke-RestMethod -Uri "https://nexuscut.io/api/stripe/checkout-addon" -Method Post -Body '{"itemId":"bg-gta","name":"Viral Gameplay (GTA)","price":4.99}' -ContentType "application/json" -ErrorAction Stop
 | ConvertTo-Json -Depth 5
