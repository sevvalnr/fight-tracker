const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
require('dotenv').config();




const allowedOrigins = [
  process.env.FRONTEND_URL,   
  'http://localhost:3000',   
  'http://127.0.0.1:3000',
  'http://localhost:5173',    
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// --- Health ---
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// --- Root ---
app.get('/', (_req, res) => {
  res.json({ message: 'Fight Tracker API is running' });
});
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};



app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.rows[0].id, email: user.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.rows[0].id,
        email: user.rows[0].email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/fights', authenticateToken, async (req, res) => {
  try {
    const { fight_date, opponent_name, fight_type, notes } = req.body;
    const user_id = req.user.id;

    if (!fight_date || !opponent_name || !fight_type) {
      return res.status(400).json({ 
        error: 'Fight date, opponent name, and fight type required' 
      });
    }

    const newFight = await pool.query(
      `INSERT INTO fight_logs (user_id, fight_date, opponent_name, fight_type, notes) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user_id, fight_date, opponent_name, fight_type, notes || '']
    );

    res.status(201).json({
      message: 'Fight log created successfully',
      fight: newFight.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/fights', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { type } = req.query; 

    let query = 'SELECT * FROM fight_logs WHERE user_id = $1';
    let params = [user_id];

    if (type) {
      query += ' AND fight_type = $2';
      params.push(type);
    }

    query += ' ORDER BY fight_date DESC';

    const fights = await pool.query(query, params);

    res.json({
      fights: fights.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
app.patch('/fights/:id', authenticateToken, async (req, res) => {
  try {
    const fightId = Number(req.params.id);
    const user_id = req.user.id;
    const { fight_date, opponent_name, fight_type, notes } = req.body;

    const fields = [];
    const values = [];
    let idx = 1;

    if (fight_date !== undefined) { fields.push(`fight_date = $${idx++}`); values.push(fight_date); }
    if (opponent_name !== undefined) { fields.push(`opponent_name = $${idx++}`); values.push(opponent_name); }
    if (fight_type !== undefined) { fields.push(`fight_type = $${idx++}`); values.push(fight_type); }
    if (notes !== undefined) { fields.push(`notes = $${idx++}`); values.push(notes); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'Güncellenecek en az bir alan gönderin' });
    }

    const query = `
      UPDATE fight_logs
         SET ${fields.join(', ')}
       WHERE id = $${idx} AND user_id = $${idx + 1}
       RETURNING *;
    `;
    values.push(fightId, user_id);

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kayıt bulunamadı veya yetkiniz yok' });
    }

    res.json({ message: 'Fight log güncellendi', fight: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
app.delete('/fights/:id', authenticateToken, async (req, res) => {
  try {
    const fightId = Number(req.params.id);
    const user_id = req.user.id;

    const result = await pool.query(
      `DELETE FROM fight_logs WHERE id = $1 AND user_id = $2 RETURNING id;`,
      [fightId, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kayıt bulunamadı veya yetkiniz yok' });
    }

    res.json({ message: 'Fight log silindi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
// GET /fights?q=ali&from=2025-01-01&to=2025-12-31&type=Sparring&limit=20&offset=0
app.get('/fights', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const {
      q,          // opponent_name veya notes içinde arama (case-insensitive)
      from,       // ISO/tarih (>=)
      to,         // ISO/tarih (<=)
      type,       // fight_type eşitlik
      limit = 50, // default 50 (maks 100)
      offset = 0  // default 0
    } = req.query;

    const where = ['user_id = $1'];
    const params = [user_id];
    let i = 2;

    if (type) {
      where.push(`fight_type = $${i++}`);
      params.push(String(type));
    }

    if (q) {
      where.push(`(LOWER(opponent_name) LIKE LOWER($${i}) OR LOWER(notes) LIKE LOWER($${i}))`);
      params.push(`%${String(q).trim()}%`);
      i++;
    }

    if (from) {
      where.push(`fight_date >= $${i++}`);
      params.push(new Date(String(from)));
    }
    if (to) {
      where.push(`fight_date <= $${i++}`);
      params.push(new Date(String(to)));
    }

    // limit/offset koruması
    const take = Math.min(Number(limit) || 50, 100);
    const skip = Math.max(Number(offset) || 0, 0);

    const baseWhere = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // total count (UI’da sayfalama göstermek istersen)
    const countSql = `SELECT COUNT(*)::int AS total FROM fight_logs ${baseWhere};`;
    const dataSql  = `
      SELECT id, user_id, fight_date, opponent_name, fight_type, notes
      FROM fight_logs
      ${baseWhere}
      ORDER BY fight_date DESC
      LIMIT ${take} OFFSET ${skip};
    `;

    const [countRes, dataRes] = await Promise.all([
      pool.query(countSql, params),
      pool.query(dataSql, params)
    ]);

    res.json({
      total: countRes.rows[0].total,
      limit: take,
      offset: skip,
      fights: dataRes.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
