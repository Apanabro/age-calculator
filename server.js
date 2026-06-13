const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME = process.env.DB_NAME || 'age_master';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

let db = null;
let users = null;

async function connectDB() {
    if (MONGODB_URI) {
        try {
            const client = new MongoClient(MONGODB_URI);
            await client.connect();
            db = client.db(DB_NAME);
            users = db.collection('users');
            await users.createIndex({ email: 1 }, { unique: true });
            console.log('Connected to MongoDB Atlas');
            return;
        } catch (err) {
            console.error('Atlas connection failed:', err.message);
        }
    }

    try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        console.log('Starting in-memory MongoDB...');
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        const client = new MongoClient(uri);
        await client.connect();
        db = client.db(DB_NAME);
        users = db.collection('users');
        await users.createIndex({ email: 1 }, { unique: true });
        console.log('In-memory MongoDB running on ' + uri);
        console.log('Database: ' + DB_NAME);
    } catch (err) {
        console.error('MongoDB Memory Server error:', err.message);
        console.log('Running in localStorage fallback mode');
    }
}

const PREMIUM_EMAIL = 'jy306648@gmail.com';

app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password min 6 chars' });

    if (users) {
        try {
            const existing = await users.findOne({ email: email.toLowerCase() });
            if (existing) return res.status(409).json({ error: 'Account already exists' });
            const isPremium = email.toLowerCase() === PREMIUM_EMAIL;
            await users.insertOne({ name: name.trim(), email: email.toLowerCase(), password, isPremium, createdAt: new Date() });
            return res.json({ ok: true, user: { name: name.trim(), email: email.toLowerCase(), isPremium } });
        } catch (err) { return res.status(500).json({ error: 'Server error' }); }
    }
    return res.json({ ok: true, user: { name: name.trim(), email: email.toLowerCase(), isPremium: email.toLowerCase() === PREMIUM_EMAIL } });
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    if (users) {
        try {
            const user = await users.findOne({ email: email.toLowerCase() });
            if (!user) return res.status(401).json({ error: 'No account found' });
            if (user.password !== password) return res.status(401).json({ error: 'Incorrect password' });
            return res.json({ ok: true, user: { name: user.name, email: user.email, isPremium: user.isPremium } });
        } catch (err) { return res.status(500).json({ error: 'Server error' }); }
    }
    return res.json({ ok: true, user: { name: 'User', email: email.toLowerCase(), isPremium: email.toLowerCase() === PREMIUM_EMAIL } });
});

app.post('/api/premium/unlock', async (req, res) => {
    const { email, plan } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    if (users) {
        try {
            await users.updateOne({ email: email.toLowerCase() }, { $set: { isPremium: true, premiumPlan: plan, premiumSince: new Date() } });
            return res.json({ ok: true, premium: true, plan });
        } catch (err) { return res.status(500).json({ error: 'Server error' }); }
    }
    return res.json({ ok: true, premium: true, plan });
});

app.get('/api/user/profile', async (req, res) => {
    const email = req.query.email;
    if (!email) return res.status(400).json({ error: 'Email required' });
    if (users) {
        try {
            const user = await users.findOne({ email: email.toLowerCase() });
            if (!user) return res.status(404).json({ error: 'User not found' });
            return res.json({ ok: true, user: { name: user.name, email: user.email, isPremium: user.isPremium, createdAt: user.createdAt } });
        } catch (err) { return res.status(500).json({ error: 'Server error' }); }
    }
    return res.json({ ok: true, user: { name: 'User', email: email.toLowerCase(), isPremium: email.toLowerCase() === PREMIUM_EMAIL } });
});

app.post('/api/certificates', async (req, res) => {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    if (db) {
        try { await db.collection('certificates').insertOne({ email: email.toLowerCase(), name: name || 'User', createdAt: new Date() }); } catch (e) {}
    }
    return res.json({ ok: true });
});

app.get('/api/stats', async (req, res) => {
    if (!db) return res.json({ users: 0, certificates: 0 });
    try {
        const userCount = await users.countDocuments();
        const certCount = await db.collection('certificates').countDocuments();
        return res.json({ users: userCount, certificates: certCount });
    } catch (e) { return res.json({ users: 0, certificates: 0 }); }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log('=================================');
        console.log('  Age Master server: port ' + PORT);
        console.log('  http://localhost:' + PORT);
        console.log('=================================');
    });
});
