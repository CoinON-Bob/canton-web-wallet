#!/usr/bin/env bash
# Canton: create-wallet then get party by id. Run after API and Canton network are up.
set -e
BASE="${BASE:-http://localhost:3000}"

echo "1. POST /canton/create-wallet..."
CREATE=$(curl -s -w "\n%{http_code}" -X POST "$BASE/canton/create-wallet" -H "Content-Type: application/json")
HTTP_CODE=$(echo "$CREATE" | tail -n1)
BODY=$(echo "$CREATE" | sed '$d')

if [ "$HTTP_CODE" != "201" ] && [ "$HTTP_CODE" != "200" ]; then
  echo "   FAIL: HTTP $HTTP_CODE. Response: $BODY"
  exit 1
fi

PARTY_ID=$(echo "$BODY" | node -e "
let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{
  try { const j=JSON.parse(d); console.log(j.partyId || ''); } catch(e) { console.log(''); }
});")
if [ -z "$PARTY_ID" ]; then
  echo "   FAIL: no partyId in response. Response: $BODY"
  exit 1
fi
echo "   OK: partyId=$PARTY_ID"

# URL-encode party id (replace :: with %3A%3A for safety in path)
PARTY_ID_ENC=$(echo "$PARTY_ID" | sed 's/::/%3A%3A/g')

echo "2. GET /canton/party/:id..."
GET=$(curl -s -w "\n%{http_code}" "$BASE/canton/party/$PARTY_ID_ENC")
GET_HTTP=$(echo "$GET" | tail -n1)
GET_BODY=$(echo "$GET" | sed '$d')

if [ "$GET_HTTP" != "200" ]; then
  echo "   FAIL: HTTP $GET_HTTP. Response: $GET_BODY"
  exit 1
fi
echo "   OK: party exists"

echo ""
echo "All steps passed."
echo "---"
echo "partyId: $PARTY_ID"
echo "create-wallet: OK"
echo "getParty: OK"
