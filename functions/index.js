const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Database } = require('sqlite3').verbose();

admin.initializeApp();

// Initialize express app
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Create users table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        origin TEXT,
        nim TEXT NOT NULL,
        university TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        isTalentIncubator BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      } else {
        console.log('Users table created or already exists');
      }
    });

    // Create admins table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating admins table:', err.message);
      } else {
        console.log('Admins table created or already exists');
        
        // Check if default admin exists
        db.get('SELECT * FROM admins WHERE email = ?', ['admininbis@eduv.com'], async (err, admin) => {
          if (err) {
            console.error('Error checking for default admin:', err.message);
          } else if (!admin) {
            // Create default admin if doesn't exist
            try {
              const salt = await bcrypt.genSalt(10);
              const hashedPassword = await bcrypt.hash('REKTOR1', salt);
              
              db.run(
                'INSERT INTO admins (email, password, role) VALUES (?, ?, ?)',
                ['admininbis@eduv.com', hashedPassword, 'PUSAT'],
                (err) => {
                  if (err) {
                    console.error('Error creating default admin:', err.message);
                  } else {
                    console.log('Default admin created');
                  }
                }
              );
            } catch (error) {
              console.error('Error hashing password:', error.message);
            }
          }
        });
      }
    });
  });
}

// JWT secret key
const JWT_SECRET = 'your_jwt_secret_key';

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, origin, nim, university, email, password, isTalentIncubator } = req.body;
    
    // Check if user already exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (user) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Insert new user
      const stmt = db.prepare(`
        INSERT INTO users (name, origin, nim, university, email, password, isTalentIncubator)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        name, 
        origin || '', 
        nim, 
        university, 
        email, 
        hashedPassword, 
        isTalentIncubator ? 1 : 0,
        function(err) {
          if (err) {
            console.error('Error registering user:', err.message);
            return res.status(500).json({ message: 'Failed to register user' });
          }
          
          // Generate JWT
          const token = jwt.sign({ id: this.lastID }, JWT_SECRET, { expiresIn: '24h' });
          
          res.status(201).json({
            token,
            message: 'User registered successfully'
          });
        }
      );
      
      stmt.finalize();
    });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Generate JWT
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({
        token,
        name: user.name,
        nim: user.nim,
        university: user.university,
        origin: user.origin,
        isTalentIncubator: user.isTalentIncubator === 1
      });
    });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin login endpoint
app.post('/api/auth/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find admin by email
    db.get('SELECT * FROM admins WHERE email = ?', [email], async (err, admin) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (!admin) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Compare password
      const isMatch = await bcrypt.compare(password, admin.password);
      
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Generate JWT
      const token = jwt.sign({ id: admin.id, role: admin.role, isAdmin: true }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({
        token,
        role: admin.role,
        email: admin.email
      });
    });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all users (admin only)
app.get('/api/admin/users', verifyAdminToken, (req, res) => {
  db.all('SELECT id, name, email, nim, university, origin, isTalentIncubator, created_at FROM users', [], (err, users) => {
    if (err) {
      console.error('Error fetching users:', err.message);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json({ users });
  });
});

// Update user (admin only)
app.put('/api/admin/users/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, nim, university, origin, isTalentIncubator } = req.body;
    
    let updateFields = [];
    let params = [];
    
    if (name) {
      updateFields.push('name = ?');
      params.push(name);
    }
    if (email) {
      updateFields.push('email = ?');
      params.push(email);
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.push('password = ?');
      params.push(hashedPassword);
    }
    if (nim) {
      updateFields.push('nim = ?');
      params.push(nim);
    }
    if (university) {
      updateFields.push('university = ?');
      params.push(university);
    }
    if (origin !== undefined) {
      updateFields.push('origin = ?');
      params.push(origin);
    }
    if (isTalentIncubator !== undefined) {
      updateFields.push('isTalentIncubator = ?');
      params.push(isTalentIncubator ? 1 : 0);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    params.push(id);
    
    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    
    db.run(query, params, function(err) {
      if (err) {
        console.error('Error updating user:', err.message);
        return res.status(500).json({ message: 'Failed to update user' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({ message: 'User updated successfully' });
    });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk update users (admin only)
app.put('/api/admin/users/bulk-update', verifyAdminToken, async (req, res) => {
  try {
    const { userIds, isTalentIncubator } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'Invalid user IDs' });
    }
    
    const placeholders = userIds.map(() => '?').join(',');
    const params = [...userIds, isTalentIncubator ? 1 : 0];
    
    const query = `UPDATE users SET isTalentIncubator = ? WHERE id IN (${placeholders})`;
    
    db.run(query, params, function(err) {
      if (err) {
        console.error('Error updating users:', err.message);
        return res.status(500).json({ message: 'Failed to update users' });
      }
      
      res.json({ message: 'Users updated successfully' });
    });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export the API as a Firebase function
exports.api = functions.https.onRequest(app);

// Schedule function to keep the service warm
exports.keepAlive = functions.pubsub.schedule('every 5 minutes').onRun((context) => {
  console.log('Keeping the server alive...');
  return null;
});