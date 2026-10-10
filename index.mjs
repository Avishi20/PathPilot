import express from 'express';
import crypto from 'node:crypto';

const app = express();
app.use(express.json({ limit: '100kb' }));
const users = new Map();
const sessions = new Map();
const SESSION_SECRET = process.env.SESSION_SECRET || 'pathpilot-local-session-secret-change-me';
const cookieName = 'pathpilot_session';
const AI_KEY = process.env.OPENAI_API_KEY || '';
const AI_BASE = (process.env.OPENAI_API_BASE || 'https://api.openai.com/v1').replace(/\/$/, '');
const AI_MODEL = process.env.OPENAI_MODEL || 'gpt-5-mini';
const clean = (value) => String(value || '').trim();
const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`;
const verifyPassword = (password, stored) => { const [salt, expected] = stored.split(':'); const actual = crypto.scryptSync(password, salt, 64).toString('hex'); return crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex')); };
const sign = (value) => crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('hex');
const validSignature = (value, signature) => { const expected = sign(value); return signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected)); };
const parseCookies = (header = '') => Object.fromEntries(header.split(';').map((part) => part.trim().split('=').map(decodeURIComponent)).filter(([key]) => key));
const sessionUser = (req) => { const raw = parseCookies(req.headers.cookie || '')[cookieName]; if (!raw) return null; const [id, signature] = raw.split('.'); if (!id || !signature || !validSignature(id, signature)) return null; const session = sessions.get(id); if (!session || session.expires < Date.now()) { sessions.delete(id); return null; } return users.get(session.email) || null; };
const cookieAttributes = (req, maxAge) => `${req.headers['x-forwarded-proto'] === 'https' ? 'SameSite=None; Secure' : 'SameSite=Lax'}; Path=/; Max-Age=${maxAge}`;
const setSession = (req, res, email) => { const id = crypto.randomBytes(24).toString('hex'); sessions.set(id, { email, expires: Date.now() + 1000 * 60 * 60 * 24 * 7 }); res.setHeader('Set-Cookie', `${cookieName}=${encodeURIComponent(`${id}.${sign(id)}`)}; HttpOnly; ${cookieAttributes(req, 604800)}`); };
const clearSession = (req, res) => res.setHeader('Set-Cookie', `${cookieName}=; HttpOnly; ${cookieAttributes(req, 0)}`);
const publicUser = (user) => user ? ({ name: user.name, email: user.email }) : null;

const fallbackAnswer = (question, profile = {}, skills = [], level = 'Beginner') => {
  const q = question.toLowerCase();
  const role = profile.role || 'your target role';
  const focus = skills.length ? ` Since you selected ${skills.slice(0, 4).join(', ')}, I’ll connect the example where useful.` : '';
  if (q.includes('machine learning') || q.includes('what is ai') || q.includes('difference between ai')) return `Machine learning is a way to build systems that learn patterns from examples instead of following only hand-written rules. AI is the broader field; machine learning is one approach inside it. Example: a spam classifier learns from labelled messages, then predicts whether a new message is spam. A typical workflow is data → features → training → evaluation → deployment. This is Demo Fallback, not a live AI answer.${focus}`;
  if (q.includes('inheritance') || q.includes('arraylist') || q.includes('java')) return `In Java, inheritance lets a child class reuse or extend a parent class. Example: class Dog extends Animal { void bark(){ System.out.println("Woof"); } }. ArrayList is a resizable list with indexed access; an array has a fixed length. Use ArrayList when the collection size changes. At ${level} level, start by writing a tiny class hierarchy and comparing add/remove operations. This is Demo Fallback, not a live AI answer.`;
  if (q.includes('binary search') || q.includes('dsa')) return `Binary search works on sorted data: compare the target with the middle item, discard the half that cannot contain it, and repeat. Each step halves the search space, so time is O(log n) and extra space is O(1) iteratively. Example: for [2,4,7,9,12], searching 9 checks 7, then the right half, then 9. This is Demo Fallback, not a live AI answer.`;
  if (q.includes('normalization') || q.includes('dbms')) return `DBMS normalization organizes tables to reduce duplicate data and update anomalies. First normal form uses atomic values; second normal form removes partial dependency on part of a composite key; third normal form removes transitive dependency. In practice, split repeated customer and order facts into related tables, then connect them with keys. This is Demo Fallback, not a live AI answer.`;
  if (q.includes('newton') || q.includes('motion')) return `Newton’s laws: (1) an object keeps its state unless a net force acts, (2) F = ma, and (3) forces come in equal and opposite pairs. Worked example: a 2 kg object pushed with 6 N has acceleration a = F/m = 6/2 = 3 m/s². This is Demo Fallback, not a live AI answer.`;
  if (q.includes('study plan') || q.includes('python')) return `A realistic Python plan for ${role}: Day 1 syntax and data types, Day 2 control flow and functions, Day 3 collections and files, Day 4 modules and errors, Day 5 a small project, Day 6 testing and revision, Day 7 reflection and practice. Keep each session within your configured daily hours and produce one visible proof. This is Demo Fallback, not a live AI answer.`;
  if (q.includes('interview') || q.includes('resume') || q.includes('project')) return `For ${role}, choose one proof project, explain the problem and trade-offs, quantify one outcome, and practise a concise STAR story. For interviews, alternate technical practice with explanation practice. This is Demo Fallback, not a live AI answer.`;
  if (q.includes('math') || q.includes('probability') || q.includes('algebra')) return `Let’s solve it step by step. Write the exact expression or values, identify the rule or formula, substitute carefully, and check the result against an estimate. Share the specific problem and I’ll work through it. This is Demo Fallback, not a live AI answer.`;
  return `I can help explain concepts, show examples, create notes or quizzes, solve a problem step by step, and plan study sessions for ${role}. Please include the topic and what depth you want. I’m currently using the honest Demo Fallback because no live AI provider is configured.${focus}`;
};

const liveAnswer = async ({ question, profile, skills, level, context }) => {
  if (!AI_KEY) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${AI_BASE}/chat/completions`, { method: 'POST', signal: controller.signal, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AI_KEY}` }, body: JSON.stringify({ model: AI_MODEL, temperature: 0.25, reasoning_effort: 'minimal', max_tokens: 700, messages: [{ role: 'system', content: `You are PathPilot's educational mentor. Answer general educational questions directly and beginner-friendly, using examples, code or formulas when relevant. Never claim employment certainty. Be honest about uncertainty. User role: ${profile?.role || 'not set'}. Selected skills: ${(skills || []).join(', ') || 'none'}. Learning level: ${level || 'Beginner'}. Current roadmap context: ${context || 'none'}.` }, { role: 'user', content: question }] }) });
    if (!response.ok) return null;
    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content?.trim();
    return answer || null;
  } catch { return null; } finally { clearTimeout(timeout); }
};

app.get('/api/health', (_, res) => res.json({ aiAvailable: Boolean(AI_KEY), provider: AI_KEY ? 'server-configured' : 'none', mode: AI_KEY ? 'Live AI when available' : 'Demo Fallback', auth: 'local-session' }));
app.get('/api/auth/session', (req, res) => res.json({ authenticated: Boolean(sessionUser(req)), user: publicUser(sessionUser(req)) }));
app.post('/api/auth/signup', (req, res) => { const name = clean(req.body?.name); const email = clean(req.body?.email).toLowerCase(); const password = String(req.body?.password || ''); if (name.length < 2) return res.status(400).json({ error: 'Enter your name (at least 2 characters).' }); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' }); if (password.length < 8) return res.status(400).json({ error: 'Use a password with at least 8 characters.' }); if (users.has(email)) return res.status(409).json({ error: 'An account with this email already exists. Try signing in.' }); users.set(email, { name, email, passwordHash: hashPassword(password) }); setSession(req, res, email); res.status(201).json({ user: publicUser(users.get(email)) }); });
app.post('/api/auth/signin', (req, res) => { const email = clean(req.body?.email).toLowerCase(); const password = String(req.body?.password || ''); const user = users.get(email); if (!user || !verifyPassword(password, user.passwordHash)) return res.status(401).json({ error: 'Email or password is incorrect.' }); setSession(req, res, email); res.json({ user: publicUser(user) }); });
app.post('/api/auth/signout', (req, res) => { clearSession(req, res); const raw = parseCookies(req.headers.cookie || '')[cookieName]; if (raw) sessions.delete(raw.split('.')[0]); res.status(204).end(); });
app.post('/api/roadmap/generate', (req, res) => { const role = req.body?.role || 'your target role'; res.json({ mode: 'demo', message: `Demo roadmap prepared for ${role}. Review the estimates before acting.` }); });
app.post('/api/mentor/chat', async (req, res) => { const question = clean(req.body?.question); if (!question) return res.status(400).json({ mode: 'fallback', answer: 'Ask me a specific educational question and I’ll help.' }); const answer = await liveAnswer(req.body || {}); res.json({ mode: answer ? 'live' : 'fallback', answer: answer || fallbackAnswer(question, req.body?.profile, req.body?.skills || [], req.body?.level) }); });
app.listen(process.env.PORT || 8787, '0.0.0.0', () => console.log('PathPilot API listening on 8787'));
