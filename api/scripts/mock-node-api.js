/**
 * Mock Canton Node API for local/testing.
 * Endpoints: POST /accounts, GET /accounts/:id, POST /transfers
 * Run: node scripts/mock-node-api.js
 * Port: 3970 (or MOCK_NODE_PORT env)
 */
const http = require('http');
const { randomUUID } = require('crypto');

const PORT = parseInt(process.env.MOCK_NODE_PORT || '3970', 10);

const accounts = new Map(); // id -> { id, partyId, balance: number }

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (ch) => { body += ch; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function send(res, statusCode, data) {
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(statusCode);
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const url = req.url || '';
  const path = url.split('?')[0];
  const method = req.method;

  // POST /accounts
  if (method === 'POST' && path === '/accounts') {
    const body = await parseBody(req).catch(() => ({}));
    const id = randomUUID();
    const partyId = `party-${id.slice(0, 8)}::1220${id.replace(/-/g, '').slice(0, 48)}`;
    accounts.set(id, { id, partyId, balance: 1000 }); // seed balance for testing
    return send(res, 201, { id, partyId });
  }

  // GET /accounts/:id
  if (method === 'GET' && path.startsWith('/accounts/')) {
    const id = decodeURIComponent(path.slice('/accounts/'.length));
    const acc = accounts.get(id);
    if (!acc) return send(res, 404, { error: 'Account not found' });
    return send(res, 200, { id: acc.id, partyId: acc.partyId, balance: String(acc.balance) });
  }

  // POST /transfers
  if (method === 'POST' && path === '/transfers') {
    const body = await parseBody(req).catch(() => ({}));
    const { fromAccountId, toAccountId, amount } = body;
    const amt = parseFloat(amount);
    if (!fromAccountId || !toAccountId || !(amt > 0)) {
      return send(res, 400, { error: 'Invalid fromAccountId, toAccountId, or amount' });
    }
    const from = accounts.get(fromAccountId);
    const to = accounts.get(toAccountId);
    if (!from) return send(res, 404, { error: 'Source account not found' });
    if (!to) return send(res, 404, { error: 'Destination account not found' });
    if (from.balance < amt) return send(res, 400, { error: 'Insufficient balance' });
    from.balance -= amt;
    to.balance += amt;
    return send(res, 200, { success: true, transactionId: randomUUID() });
  }

  send(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Mock Node API listening on http://localhost:${PORT}`);
});
