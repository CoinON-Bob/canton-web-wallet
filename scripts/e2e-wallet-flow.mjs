/**
 * E2E: Frontend + Wallet API flow. No manual steps.
 * Starts mock node, API, frontend. Runs full flow via API (login, create 2 wallets, transfer, list balances).
 * Frontend uses same API; open FRONTEND_URL in browser to test UI with same backend.
 */
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const apiDir = path.join(rootDir, 'api');

const API_PORT = 3001;
const FRONTEND_PORT = 3000;
const MOCK_NODE_PORT = 3970;
const BASE = `http://localhost:${API_PORT}`;
const FRONTEND_URL = `http://localhost:${FRONTEND_PORT}`;

const EMAIL = `e2e_${Date.now()}@test.local`;
const PASSWORD = 'password123';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function run(cmd, args, opts = {}) {
  const p = spawn(cmd, args, {
    stdio: opts.silent ? 'ignore' : 'inherit',
    shell: true,
    ...opts,
  });
  return p;
}

async function waitFor(url, maxWait = 30000) {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    try {
      const r = await fetch(url);
      if (r.ok) return true;
    } catch (_) {}
    await sleep(500);
  }
  return false;
}

async function main() {
  const children = [];
  const killAll = () => {
    children.forEach((p) => {
      try {
        p.kill('SIGTERM');
      } catch (_) {}
    });
  };
  process.on('exit', killAll);

  try {
    execSync(`lsof -ti:${MOCK_NODE_PORT} | xargs kill -9 2>/dev/null`, { stdio: 'ignore' });
    execSync(`lsof -ti:${API_PORT} | xargs kill -9 2>/dev/null`, { stdio: 'ignore' });
    execSync(`lsof -ti:${FRONTEND_PORT} | xargs kill -9 2>/dev/null`, { stdio: 'ignore' });
  } catch (_) {}
  await sleep(2000);
  console.log('Starting mock node...');
  const mockNode = run('node', ['scripts/mock-node-api.js'], {
    env: { ...process.env, MOCK_NODE_PORT: String(MOCK_NODE_PORT) },
    cwd: apiDir,
    silent: true,
  });
  children.push(mockNode);

  await sleep(1500);

  console.log('Starting API...');
  const api = run('npm', ['run', 'start'], {
    env: {
      ...process.env,
      NODE_ENV: 'development',
      PORT: String(API_PORT),
      NODE_API_BASE_URL: `http://localhost:${MOCK_NODE_PORT}`,
    },
    cwd: apiDir,
    silent: true,
  });
  children.push(api);

  await sleep(12000);

  console.log('Starting frontend...');
  const frontend = run('npm', ['run', 'dev'], {
    env: {
      ...process.env,
      VITE_API_BASE_URL: `http://localhost:${API_PORT}`,
    },
    cwd: rootDir,
    silent: true,
  });
  children.push(frontend);

  const apiOk = await waitFor(`${BASE}/health`, 45000);
  if (!apiOk) {
    killAll();
    throw new Error('API did not become ready');
  }
  const apiHealthBody = await fetch(`${BASE}/health`).then((r) => r.json()).catch(() => ({}));
  if (apiHealthBody.status !== 'ok') {
    killAll();
    throw new Error('API health did not return status ok');
  }
  const frontOk = await waitFor(FRONTEND_URL, 15000);
  if (!frontOk) {
    killAll();
    throw new Error('Frontend did not become ready');
  }

  let loginOk = false;
  let createOk = false;
  let transferOk = false;
  let balanceOk = false;
  let wallet1Balance = '-';
  let wallet2Balance = '-';
  let token = '';

  try {
    const registerRes = await fetch(`${BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    if (!registerRes.ok && registerRes.status !== 409) {
      throw new Error(`Register failed: ${registerRes.status} ${await registerRes.text()}`);
    }

    const loginRes = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const loginBody = await loginRes.text();
    if (!loginRes.ok) {
      throw new Error(`Login failed: ${loginRes.status} ${loginBody}`);
    }
    const loginData = JSON.parse(loginBody);
    token = loginData.access_token || '';
    if (!token) throw new Error('No access_token in login response');
    loginOk = true;

    const sendCodeRes = await fetch(`${BASE}/email-verifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL }),
    });
    const sendCodeData = await sendCodeRes.json().catch(() => ({}));
    if (!sendCodeRes.ok) throw new Error(`Send code: ${sendCodeRes.status}`);
    const devCode = sendCodeData.devCode;
    if (!devCode) throw new Error('No devCode in send response (set NODE_ENV=development)');

    const verifyRes = await fetch(`${BASE}/email-verifications/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, code: devCode }),
    });
    if (!verifyRes.ok) throw new Error(`Verify: ${verifyRes.status} ${await verifyRes.text()}`);

    const auth = () => ({ Authorization: `Bearer ${token}` });

    const createRes1 = await fetch(`${BASE}/wallets/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth() },
      body: JSON.stringify({}),
    });
    if (!createRes1.ok) throw new Error(`Create wallet 1: ${createRes1.status} ${await createRes1.text()}`);
    const w1 = await createRes1.json();
    const wallet1Id = w1.id;

    const createRes2 = await fetch(`${BASE}/wallets/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth() },
      body: JSON.stringify({}),
    });
    if (!createRes2.ok) throw new Error(`Create wallet 2: ${createRes2.status} ${await createRes2.text()}`);
    const w2 = await createRes2.json();
    const wallet2Id = w2.id;
    createOk = true;

    const transferRes = await fetch(`${BASE}/wallets/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth() },
      body: JSON.stringify({
        fromWalletId: wallet1Id,
        toWalletId: wallet2Id,
        amount: 100,
      }),
    });
    if (!transferRes.ok) throw new Error(`Transfer: ${transferRes.status} ${await transferRes.text()}`);
    transferOk = true;

    await sleep(1000);

    const listRes = await fetch(`${BASE}/wallets`, { headers: auth() });
    if (!listRes.ok) throw new Error(`List wallets: ${listRes.status} ${await listRes.text()}`);
    const list = await listRes.json();
    const w1Entry = list.find((x) => x.id === wallet1Id);
    const w2Entry = list.find((x) => x.id === wallet2Id);
    wallet1Balance = w1Entry?.balance != null ? String(w1Entry.balance) : '-';
    wallet2Balance = w2Entry?.balance != null ? String(w2Entry.balance) : '-';
    balanceOk = true;
  } catch (e) {
    console.error('E2E error:', e.message);
  } finally {
    killAll();
  }

  console.log('\n--- 前端钱包联调测试结果 ---\n');
  console.log('登录：', loginOk ? '成功' : '失败');
  console.log('创建钱包：', createOk ? '成功' : '失败');
  console.log('钱包转账：', transferOk ? '成功' : '失败');
  console.log('钱包余额刷新：', balanceOk ? '成功' : '失败');
  console.log('\nwallet1 余额：', wallet1Balance);
  console.log('wallet2 余额：', wallet2Balance);
  console.log('\n浏览器测试地址：', FRONTEND_URL);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
