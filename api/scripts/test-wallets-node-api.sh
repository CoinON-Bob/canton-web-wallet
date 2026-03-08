#!/usr/bin/env bash
# Wallets Node API flow: register, login, create 2 accounts, transfer, query balance.
# Prerequisites: API running (with NODE_API_BASE_URL pointing to mock Node), mock Node running on 3970.
# Example: Terminal 1: node scripts/mock-node-api.js
#          Terminal 2: NODE_API_BASE_URL=http://localhost:3970 npm run start:dev
#          Terminal 3: npm run test:wallets
set -e
BASE="${BASE:-http://localhost:3000}"
EMAIL="wallet_test_$(date +%s)@example.com"
PASS="password123"

echo "1. Register..."
REG=$(curl -s -X POST "$BASE/auth/register" -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")
if ! echo "$REG" | grep -q '"id"'; then
  echo "   FAIL: $REG"
  exit 1
fi
echo "   OK"

echo "2. Login..."
LOGIN=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")
TOKEN=$(echo "$LOGIN" | node -e "
let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{
  try { const j=JSON.parse(d); console.log(j.access_token||''); } catch(e){ console.log(''); }
});")
if [ -z "$TOKEN" ]; then
  echo "   FAIL: no access_token. $LOGIN"
  exit 1
fi
echo "   OK"

echo "3. Create wallet 1..."
W1=$(curl -s -X POST "$BASE/wallets/create" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"label":"Wallet A"}')
W1_ID=$(echo "$W1" | node -e "
let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{
  try { const j=JSON.parse(d); console.log(j.id||''); } catch(e){ console.log(''); }
});")
if [ -z "$W1_ID" ]; then
  echo "   FAIL: no wallet id. $W1"
  exit 1
fi
echo "   OK id=$W1_ID"

echo "4. Create wallet 2..."
W2=$(curl -s -X POST "$BASE/wallets/create" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"label":"Wallet B"}')
W2_ID=$(echo "$W2" | node -e "
let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{
  try { const j=JSON.parse(d); console.log(j.id||''); } catch(e){ console.log(''); }
});")
if [ -z "$W2_ID" ]; then
  echo "   FAIL: no wallet id. $W2"
  exit 1
fi
echo "   OK id=$W2_ID"

echo "5. Transfer 100 from wallet 1 to wallet 2..."
TR=$(curl -s -X POST "$BASE/wallets/transfer" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"fromWalletId\":\"$W1_ID\",\"toWalletId\":\"$W2_ID\",\"amount\":100}")
if ! echo "$TR" | grep -q '"success":true'; then
  echo "   FAIL: $TR"
  exit 1
fi
echo "   OK"

echo "6. Get wallet 1 balance..."
B1=$(curl -s "$BASE/wallets/$W1_ID" -H "Authorization: Bearer $TOKEN")
BAL1=$(echo "$B1" | node -e "
let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{
  try { const j=JSON.parse(d); console.log(j.balance||''); } catch(e){ console.log(''); }
});")
echo "   balance=$BAL1 (expected 900 if seed was 1000)"

echo "7. Get wallet 2 balance..."
B2=$(curl -s "$BASE/wallets/$W2_ID" -H "Authorization: Bearer $TOKEN")
BAL2=$(echo "$B2" | node -e "
let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{
  try { const j=JSON.parse(d); console.log(j.balance||''); } catch(e){ console.log(''); }
});")
echo "   balance=$BAL2 (expected 1100 if seed was 1000)"

echo ""
echo "All steps passed."
echo "---"
echo "Wallet 1: $W1_ID balance=$BAL1"
echo "Wallet 2: $W2_ID balance=$BAL2"
