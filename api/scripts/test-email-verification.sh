#!/usr/bin/env bash
# Email verification flow: register -> send -> verify -> users/me (check emailVerified)
set -e
BASE="${BASE:-http://localhost:3001}"
EMAIL="test_email_verify@example.com"
PASS="12345678"

echo "1. Register..."
REG=$(curl -s -X POST "$BASE/auth/register" -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")
if echo "$REG" | grep -q '"id"'; then
  echo "   OK: user created"
else
  echo "   Response: $REG"
  exit 1
fi

echo "2. Send verification code..."
SEND=$(curl -s -X POST "$BASE/email-verifications/send" -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\"}")
if ! echo "$SEND" | grep -q '"success":true'; then
  echo "   FAIL: $SEND"
  exit 1
fi
echo "   OK: code generated"

CODE=$(echo "$SEND" | node -e "
let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{
  try { const j=JSON.parse(d); console.log(j.devCode || ''); } catch(e) { console.log(''); }
});")
if [ -z "$CODE" ]; then
  echo "   Could not get devCode from response (ensure NODE_ENV=development). Response: $SEND"
  exit 1
fi
echo "   Code (from devCode): $CODE"

echo "3. Verify code..."
VERIFY=$(curl -s -X POST "$BASE/email-verifications/verify" -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\",\"code\":\"$CODE\"}")
if ! echo "$VERIFY" | grep -q '"success":true'; then
  echo "   FAIL: $VERIFY"
  exit 1
fi
echo "   OK: email verified"

echo "4. Login and GET /users/me..."
LOGIN=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")
TOKEN=$(echo "$LOGIN" | node -e "
let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{
  try { const j=JSON.parse(d); console.log(j.access_token || ''); } catch(e) { console.log(''); }
});")
if [ -z "$TOKEN" ]; then
  echo "   Login failed: $LOGIN"
  exit 1
fi

ME=$(curl -s "$BASE/users/me" -H "Authorization: Bearer $TOKEN")
EMAIL_VERIFIED=$(echo "$ME" | node -e "
let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{
  try { const j=JSON.parse(d); console.log(j.emailVerified === true ? 'true' : 'false'); } catch(e) { console.log('false'); }
});")
echo "   emailVerified: $EMAIL_VERIFIED"

if [ "$EMAIL_VERIFIED" != "true" ]; then
  echo "   FAIL: expected emailVerified true"
  exit 1
fi
echo ""
echo "All steps passed."
echo "---"
echo "send:    success"
echo "verify:  success"
echo "emailVerified: $EMAIL_VERIFIED"
echo "code used: $CODE"
