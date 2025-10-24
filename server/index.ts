import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

type AuthedRequest = express.Request & { user?: { id: string; role: string; username: string } };

function authMiddleware(required: boolean = true) {
  return (req: AuthedRequest, res: express.Response, next: express.NextFunction) => {
    const header = req.headers.authorization;
    if (!header) {
      if (required) return res.status(401).json({ error: 'missing token' });
      return next();
    }
    const token = header.replace('Bearer ', '');
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      req.user = { id: payload.id, role: payload.role, username: payload.username };
      next();
    } catch {
      return res.status(401).json({ error: 'invalid token' });
    }
  };
}

function requireRole(...roles: string[]) {
  return (req: AuthedRequest, res: express.Response, next: express.NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'forbidden' });
    next();
  };
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});
// Webhook PIX (demo): confirmação de pagamento
app.post('/webhooks/pix', async (req, res) => {
  try {
    const body = req.body as any;
    const txid = body?.txid || body?.endToEndId || body?.pix?.[0]?.txid;
    if (!txid) return res.status(400).json({ error: 'missing txid' });
    // Em produção, localizar fatura/assinatura pelo txid e marcar como paga
    console.log('PIX webhook recebido (demo):', txid);
    try {
      // encontrar assinatura pelo txid e marcar como ativa
      const sub = await prisma.subscription.findFirst({ where: { txid } as any });
      if (sub) {
        await prisma.subscription.update({ where: { id: sub.id }, data: { status: 'active' } });
      }
    } catch {}
    // Responder 200 imediatamente
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'webhook error' });
  }
});

// Persistência simples de comunicações em arquivo (fallback quando banco indisponível)
const COMM_LOG_FILE = path.join(process.cwd(), 'comm_logs.json');
function readCommLogs() {
  try { return JSON.parse(fs.readFileSync(COMM_LOG_FILE, 'utf-8')); } catch { return []; }
}
function writeCommLogs(logs: any[]) {
  try { fs.writeFileSync(COMM_LOG_FILE, JSON.stringify(logs, null, 2), 'utf-8'); } catch {}
}

app.get('/api/comms/logs', authMiddleware(false), async (_req, res) => {
  try {
    const logs = readCommLogs();
    res.json(logs);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'failed' });
  }
});

app.post('/api/comms/logs', authMiddleware(false), async (req, res) => {
  try {
    const body = req.body as any;
    const logs = readCommLogs();
    logs.push({ ...body, at: new Date().toISOString() });
    writeCommLogs(logs);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'failed' });
  }
});

// Criação pública de assinatura após pagamento (simplificado)
app.post('/api/public/subscriptions', async (req, res) => {
  try {
    const body = z.object({ username: z.string(), planName: z.string(), txid: z.string() }).safeParse(req.body);
    if (!body.success) return res.status(400).json(body.error);
    const { username, planName, txid } = body.data;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(404).json({ error: 'user not found' });
    let plan = await prisma.plan.findFirst({ where: { name: planName } });
    if (!plan) plan = await prisma.plan.create({ data: { name: planName, priceCents: 0, interval: 'monthly' } as any });
    // criar tenant para o usuário se não houver
    let tenant = await prisma.tenant.findFirst({ where: { users: { some: { userId: user.id } } } });
    if (!tenant) tenant = await prisma.tenant.create({ data: { name: `${username}-tenant`, users: { create: { userId: user.id, role: 'owner' } } } });
    const sub = await prisma.subscription.create({ data: { tenantId: tenant.id, planId: plan.id, status: 'active', txid } as any });
    // ativar licença do usuário
    const lic = await prisma.license.upsert({ where: { userId: user.id }, update: { status: 'active', activatedAt: new Date() }, create: { userId: user.id, status: 'active', activatedAt: new Date() } });
    res.json({ ok: true, subscription: sub, license: lic });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'failed' });
  }
});

// Leads (captação de clientes da demo)
const LEADS_FILE = path.join(process.cwd(), 'leads.json');
function readLeads() {
  try { return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8')); } catch { return []; }
}
function writeLeads(leads: any[]) {
  try { fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8'); } catch {}
}

// Criar lead (público)
app.post('/api/public/leads', async (req, res) => {
  try {
    const body = z.object({ name: z.string(), email: z.string(), phone: z.string(), company: z.string().optional(), username: z.string().optional() }).safeParse(req.body);
    if (!body.success) return res.status(400).json(body.error);
    const leads = readLeads();
    const id = `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const lead = { id, status: 'pending', createdAt: new Date().toISOString(), ...body.data };
    leads.push(lead);
    writeLeads(leads);
    res.json({ ok: true, lead });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'failed' });
  }
});

// Listar leads (admin)
app.get('/api/leads', authMiddleware(), requireRole('admin','superadmin'), async (_req, res) => {
  res.json(readLeads());
});

// Registro público de usuários
app.post('/api/public/register', async (req, res) => {
  try {
    const body = z.object({ 
      name: z.string(), 
      email: z.string().email(), 
      phone: z.string(), 
      password: z.string().min(6),
      userType: z.enum(['pessoa-fisica', 'pessoa-juridica']),
      company: z.string().optional(),
      cnpj: z.string().optional(),
      cpf: z.string().optional()
    }).safeParse(req.body);
    if (!body.success) return res.status(400).json(body.error);
    
    const { name, email, phone, password, userType, company, cnpj, cpf } = body.data;
    
    // Verificar se já existe
    const exists = await prisma.user.findFirst({ where: { email } });
    if (exists) return res.status(400).json({ error: 'Email já cadastrado' });
    
    // Salvar como pendente (em produção, enviar para aprovação)
    const pendingUsers = JSON.parse(fs.readFileSync('pending_users.json', 'utf-8').catch(()=>'[]'));
    pendingUsers.push({ name, email, phone, userType, company, cnpj, cpf, createdAt: new Date().toISOString() });
    fs.writeFileSync('pending_users.json', JSON.stringify(pendingUsers, null, 2));
    
    res.json({ ok: true, message: 'Cadastro enviado para aprovação' });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'failed' });
  }
});

// Recuperação de senha
app.post('/api/public/reset-password', async (req, res) => {
  try {
    const { email, code } = z.object({ email: z.string().email(), code: z.string() }).parse(req.body);
    // Salvar solicitação
    const resets = JSON.parse(fs.readFileSync('reset_requests.json', 'utf-8').catch(()=>'[]'));
    resets.push({ email, code, createdAt: new Date().toISOString() });
    fs.writeFileSync('reset_requests.json', JSON.stringify(resets, null, 2));
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'failed' });
  }
});

// Recuperação de usuário
app.post('/api/public/reset-username', async (req, res) => {
  try {
    const { email, phone, code } = z.object({ email: z.string().email(), phone: z.string(), code: z.string() }).parse(req.body);
    // Salvar solicitação
    const resets = JSON.parse(fs.readFileSync('username_reset_requests.json', 'utf-8').catch(()=>'[]'));
    resets.push({ email, phone, code, createdAt: new Date().toISOString() });
    fs.writeFileSync('username_reset_requests.json', JSON.stringify(resets, null, 2));
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'failed' });
  }
});

// Aprovar lead -> cria usuário
app.post('/api/leads/:id/approve', authMiddleware(), requireRole('admin','superadmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const leads = readLeads();
    const lead = leads.find((l:any)=> l.id === id);
    if (!lead) return res.status(404).json({ error: 'lead not found' });
    const username = (lead.username || lead.name || 'cliente').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,24) || `cli_${Date.now()}`;
    const exists = await prisma.user.findUnique({ where: { username } });
    if (!exists) {
      const hashed = await bcrypt.hash('demo123', 10);
      const user = await prisma.user.create({ data: { username, password: hashed, role: 'user', email: (lead.email||undefined) } as any });
      await prisma.license.create({ data: { userId: user.id, status: 'trial', trialStart: new Date(), trialDays: 30 } });
    }
    const rest = leads.filter((l:any)=> l.id !== id);
    writeLeads(rest);
    // Notificações via WhatsApp (CallMeBot)
    try {
      const apikey = process.env.CALLMEBOT_API_KEY || '1782254';
      const normalizePhone = (p:string)=>{
        const d = (p||'').replace(/\D/g,'');
        if (!d) return '';
        return d.startsWith('55') ? `+${d}` : `+55${d}`;
      };
      const clientPhone = normalizePhone(lead.phone || '');
      if (clientPhone) {
        const text = encodeURIComponent(`✅ Aprovado!\nSeu acesso foi criado.\nUsuário: ${username}\nSenha: demo123\nLink: http://localhost:5173`);
        const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(clientPhone)}&text=${text}&apikey=${encodeURIComponent(apikey)}`;
        await fetch(url);
      }
      const adminPhone = process.env.ADMIN_PHONE || '+5511984801839';
      const adminText = encodeURIComponent(`🆕 Lead aprovado e usuário criado: ${username}\nNome: ${lead.name}\nEmail: ${lead.email}\nFone: ${lead.phone}`);
      const adminUrl = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(adminPhone)}&text=${adminText}&apikey=${encodeURIComponent(apikey)}`;
      await fetch(adminUrl);
    } catch {}
    res.json({ ok: true, approved: username });
  } catch (e:any) {
    res.status(500).json({ error: e?.message || 'failed' });
  }
});

// Criar usuário de demo (público) – usado após verificação do WhatsApp
app.post('/api/public/demo-user', async (req, res) => {
  try {
    const body = z.object({ username: z.string().min(3), password: z.string().min(3).default('demo123'), email: z.string().optional() }).safeParse(req.body);
    if (!body.success) return res.status(400).json(body.error);
    const { username, password, email } = body.data;
    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) {
      return res.json({ ok: true, user: { id: exists.id, username: exists.username } });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { username, password: hashed, role: 'user', email: email || undefined } as any });
    await prisma.license.create({ data: { userId: user.id, status: 'trial', trialStart: new Date(), trialDays: 30 } });
    res.json({ ok: true, user: { id: user.id, username: user.username } });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'failed' });
  }
});

// Seed superadmin (dev-only)
app.post('/api/seed/superadmin', async (_req, res) => {
  try {
    const exists = await prisma.user.findUnique({ where: { username: 'Admin' } });
    if (exists) return res.json({ ok: true, user: exists });
    const hashed = await bcrypt.hash('Admin', 10);
    const user = await prisma.user.create({ data: { username: 'Admin', password: hashed, role: 'superadmin' } });
    await prisma.license.create({ data: { userId: user.id, status: 'trial', trialStart: new Date(), trialDays: 7 } });
    res.json({ ok: true, user });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'seed failed' });
  }
});

// Seed all users
app.post('/api/seed/users', async (_req, res) => {
  try {
    // Criar usuário Webyte (cliente)
    const webyteUser = await prisma.user.upsert({
      where: { username: 'Webyte' },
      update: {},
      create: {
        username: 'Webyte',
        password: await bcrypt.hash('Webyte', 10),
        role: 'user',
      },
    });

    // Criar usuário admin (superadmin)
    const adminUser = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        role: 'superadmin',
      },
    });

    // Criar usuário demo
    const demoUser = await prisma.user.upsert({
      where: { username: 'demo' },
      update: {},
      create: {
        username: 'demo',
        password: await bcrypt.hash('demo123', 10),
        role: 'user',
      },
    });

    // Criar usuário para caderno de notas
    const cadernoUser = await prisma.user.upsert({
      where: { username: 'caderno' },
      update: {},
      create: {
        username: 'caderno',
        password: await bcrypt.hash('caderno2025', 10),
        role: 'user',
      },
    });

    res.json({ 
      message: 'Usuários criados com sucesso',
      users: [
        { username: webyteUser.username, role: webyteUser.role },
        { username: adminUser.username, role: adminUser.role },
        { username: demoUser.username, role: demoUser.role },
        { username: cadernoUser.username, role: cadernoUser.role },
      ]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create users' });
  }
});

// Users
app.post('/api/users', authMiddleware(), requireRole('superadmin'), async (req, res) => {
  const body = z.object({ username: z.string().min(3), password: z.string().min(3), role: z.string().optional() }).safeParse(req.body);
  if (!body.success) return res.status(400).json(body.error);
  const { username, password, role } = body.data;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { username, password: hashed, role: role ?? 'user' } });
    // Create trial license
    await prisma.license.create({ data: { userId: user.id, status: 'trial', trialStart: new Date(), trialDays: 7 } });
    res.json(user);
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'failed' });
  }
});

app.get('/api/users', authMiddleware(), requireRole('admin','superadmin'), async (_req, res) => {
  const users = await prisma.user.findMany({ include: { license: true } });
  res.json(users);
});

app.patch('/api/users/:id/role', authMiddleware(), requireRole('superadmin'), async (req, res) => {
  const { id } = req.params;
  const body = z.object({ role: z.enum(['user','admin','superadmin']) }).safeParse(req.body);
  if (!body.success) return res.status(400).json(body.error);
  try {
    const updated = await prisma.user.update({ where: { id }, data: { role: body.data.role } });
    res.json(updated);
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'failed' });
  }
});

// Licenses
app.get('/api/licenses/:username', authMiddleware(), requireRole('admin','superadmin'), async (req, res) => {
  const { username } = req.params;
  const user = await prisma.user.findUnique({ where: { username }, include: { license: true } });
  if (!user) return res.status(404).json({ error: 'user not found' });
  res.json(user.license);
});

app.post('/api/licenses/:username/activate', authMiddleware(), requireRole('admin','superadmin'), async (req, res) => {
  const { username } = req.params;
  const body = z.object({ key: z.string().min(6), validityDays: z.number().int().optional() }).safeParse(req.body);
  if (!body.success) return res.status(400).json(body.error);
  const { key, validityDays } = body.data;

  const user = await prisma.user.findUnique({ where: { username }, include: { license: true } });
  if (!user || !user.license) return res.status(404).json({ error: 'user/license not found' });

  if (!user.license.activationKey || user.license.activationKey.toUpperCase() !== key.toUpperCase()) {
    return res.status(403).json({ error: 'invalid key' });
  }

  const validUntil = validityDays && validityDays > 0 ? new Date(Date.now() + validityDays * 86400000) : null;
  const updated = await prisma.license.update({ where: { userId: user.id }, data: { status: 'active', activatedAt: new Date(), validUntil } });
  res.json(updated);
});

app.post('/api/licenses/:username/block', authMiddleware(), requireRole('admin','superadmin'), async (req, res) => {
  const { username } = req.params;
  const user = await prisma.user.findUnique({ where: { username }, include: { license: true } });
  if (!user || !user.license) return res.status(404).json({ error: 'user/license not found' });
  const activationKey = Math.random().toString(36).slice(2, 12).toUpperCase();
  const updated = await prisma.license.update({ where: { userId: user.id }, data: { status: 'blocked', activationKey } });
  res.json(updated);
});

// Auth
app.post('/api/auth/login', async (req, res) => {
  const body = z.object({ username: z.string(), password: z.string() }).safeParse(req.body);
  if (!body.success) return res.status(400).json(body.error);
  const { username, password } = body.data;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, role: user.role, username: user.username });
});

app.get('/api/auth/me', authMiddleware(), async (req: AuthedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  res.json(req.user);
});

// Self license ensure/activate for logged user
app.post('/api/self/license/ensure', authMiddleware(), async (req: AuthedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  let user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { license: true } });
  if (!user) return res.status(404).json({ error: 'user not found' });
  if (!user.license) {
    user = await prisma.user.update({ where: { id: req.user.id }, data: { license: { create: { status: 'trial', trialStart: new Date(), trialDays: 7 } } }, include: { license: true } });
  }
  const lic = user.license!;
  const expired = new Date().getTime() > new Date(lic.trialStart).getTime() + lic.trialDays * 86400000;
  if (expired && lic.status !== 'blocked' && lic.status !== 'active') {
    const activationKey = Math.random().toString(36).slice(2, 12).toUpperCase();
    const updated = await prisma.license.update({ where: { userId: user.id }, data: { status: 'blocked', activationKey } });
    try {
      const phone = '+5511984801839';
      const apikey = '1782254';
      const text = encodeURIComponent(`O teste de um usuário expirou. Chave de ativação gerada: ${activationKey}`);
      const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${text}&apikey=${encodeURIComponent(apikey)}`;
      await fetch(url);
    } catch {}
    return res.json(updated);
  }
  res.json(lic);
});

app.post('/api/self/license/activate', authMiddleware(), async (req: AuthedRequest, res) => {
  const body = z.object({ key: z.string().min(6), validityDays: z.number().int().optional() }).safeParse(req.body);
  if (!body.success) return res.status(400).json(body.error);
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { license: true } });
  if (!user || !user.license) return res.status(404).json({ error: 'user/license not found' });
  if (!user.license.activationKey || user.license.activationKey.toUpperCase() !== body.data.key.toUpperCase()) {
    return res.status(403).json({ error: 'invalid key' });
  }
  const validUntil = body.data.validityDays && body.data.validityDays > 0 ? new Date(Date.now() + body.data.validityDays * 86400000) : null;
  const updated = await prisma.license.update({ where: { userId: user.id }, data: { status: 'active', activatedAt: new Date(), validUntil } });
  res.json(updated);
});

// Tenants (superadmin only)
app.post('/api/tenants', authMiddleware(), requireRole('superadmin'), async (req, res) => {
  const body = z.object({ name: z.string().min(2) }).safeParse(req.body);
  if (!body.success) return res.status(400).json(body.error);
  try {
    const tenant = await prisma.tenant.create({ data: { name: body.data.name } });
    res.json(tenant);
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'failed' });
  }
});

app.get('/api/tenants', authMiddleware(), requireRole('superadmin'), async (_req, res) => {
  const tenants = await prisma.tenant.findMany({ include: { subscriptions: true, users: true } });
  res.json(tenants);
});

app.post('/api/tenants/:tenantId/users', authMiddleware(), requireRole('superadmin'), async (req, res) => {
  const { tenantId } = req.params;
  const body = z.object({ userId: z.string(), role: z.string().optional() }).safeParse(req.body);
  if (!body.success) return res.status(400).json(body.error);
  try {
    const ut = await prisma.userTenant.create({ data: { tenantId, userId: body.data.userId, role: body.data.role ?? 'member' } });
    res.json(ut);
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'failed' });
  }
});

app.post('/api/plans', authMiddleware(), requireRole('superadmin'), async (req, res) => {
  const body = z.object({ name: z.string(), priceCents: z.number().int(), interval: z.enum(['monthly','yearly']), features: z.any().optional() }).safeParse(req.body);
  if (!body.success) return res.status(400).json(body.error);
  try {
    const plan = await prisma.plan.create({ data: { ...body.data } });
    res.json(plan);
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'failed' });
  }
});

app.post('/api/tenants/:tenantId/subscriptions', authMiddleware(), requireRole('superadmin'), async (req, res) => {
  const { tenantId } = req.params;
  const body = z.object({ planId: z.string(), status: z.string().default('active'), validUntil: z.string().optional() }).safeParse(req.body);
  if (!body.success) return res.status(400).json(body.error);
  try {
    const sub = await prisma.subscription.create({ data: { tenantId, planId: body.data.planId, status: body.data.status, validUntil: body.data.validUntil ? new Date(body.data.validUntil) : null } });
    res.json(sub);
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'failed' });
  }
});

// Password reset (admin/superadmin only)
app.post('/api/users/:id/reset-password', authMiddleware(), requireRole('admin','superadmin'), async (req, res) => {
  const { id } = req.params;
  const body = z.object({ newPassword: z.string().min(6) }).safeParse(req.body);
  if (!body.success) return res.status(400).json(body.error);
  try {
    const hashed = await bcrypt.hash(body.data.newPassword, 10);
    const updated = await prisma.user.update({ where: { id }, data: { password: hashed } });
    res.json({ ok: true, id: updated.id });
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'failed' });
  }
});

// Update user (admin/superadmin only)
app.patch('/api/users/:id', authMiddleware(), requireRole('admin','superadmin'), async (req, res) => {
  const { id } = req.params;
  const body = z.object({ 
    username: z.string().min(3).optional(),
    role: z.enum(['user','admin','superadmin']).optional(),
    password: z.string().min(6).optional()
  }).safeParse(req.body);
  if (!body.success) return res.status(400).json(body.error);
  try {
    const updateData: any = {};
    if (body.data.username) updateData.username = body.data.username;
    if (body.data.role) updateData.role = body.data.role;
    if (body.data.password) updateData.password = await bcrypt.hash(body.data.password, 10);
    
    const updated = await prisma.user.update({ where: { id }, data: updateData });
    res.json(updated);
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'failed' });
  }
});

// Delete user (superadmin only)
app.delete('/api/users/:id', authMiddleware(), requireRole('superadmin'), async (req, res) => {
  const { id } = req.params;
  try {
    // Não permitir deletar o próprio usuário
    if (req.user?.id === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    await prisma.user.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'failed' });
  }
});

// CMS Configuration APIs
const CMS_CONFIG_FILE = path.join(process.cwd(), 'cms-config.json');

// Get CMS configuration
app.get('/api/cms/config', authMiddleware(), requireRole('admin','superadmin'), async (req, res) => {
  try {
    const config = JSON.parse(fs.readFileSync(CMS_CONFIG_FILE, 'utf-8').catch(() => '{}'));
    res.json(config);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'failed' });
  }
});

// Update CMS configuration
app.post('/api/cms/config', authMiddleware(), requireRole('admin','superadmin'), async (req, res) => {
  const body = z.object({
    landingPage: z.object({
      title: z.string().optional(),
      subtitle: z.string().optional(),
      primaryColor: z.string().optional(),
      theme: z.string().optional(),
      logo: z.string().optional(),
      favicon: z.string().optional()
    }).optional(),
    sections: z.object({
      hero: z.object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        ctaText: z.string().optional()
      }).optional(),
      plans: z.object({
        title: z.string().optional(),
        description: z.string().optional()
      }).optional(),
      testimonials: z.object({
        title: z.string().optional(),
        description: z.string().optional()
      }).optional(),
      features: z.object({
        title: z.string().optional(),
        description: z.string().optional()
      }).optional(),
      faq: z.object({
        title: z.string().optional(),
        description: z.string().optional()
      }).optional(),
      footer: z.object({
        title: z.string().optional(),
        description: z.string().optional()
      }).optional()
    }).optional()
  }).safeParse(req.body);
  
  if (!body.success) return res.status(400).json(body.error);
  
  try {
    const currentConfig = JSON.parse(fs.readFileSync(CMS_CONFIG_FILE, 'utf-8').catch(() => '{}'));
    const updatedConfig = { ...currentConfig, ...body.data };
    fs.writeFileSync(CMS_CONFIG_FILE, JSON.stringify(updatedConfig, null, 2));
    res.json(updatedConfig);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'failed' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});


