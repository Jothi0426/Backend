const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(bodyParser.json());
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'b4N7$gYp@2rT!kX9zFqM#vJ5wL8dC6H9';
const pool = require('./db');
const bcrypt = require('bcryptjs');

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password are required" });
 
    const result = await pool.query("SELECT * FROM testdata WHERE username = $1", [username]);
    if (result.rows.length === 0) return res.status(401).json({ error: "Invalid username or password" });
 
    const hashedPassword = result.rows[0].hashed_password;
    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (!isMatch) return res.status(401).json({ error: "Invalid username or password" });
 
    const token = jwt.sign({ username }, JWT_SECRET);
    res.json({ token, message: "Login successful" });
 
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

 
app.post('/confirm_order', async (req, res) => {
  const { status } = req.body;
 
  try {
    // Example: insert into orders table
    const result = await pool.query(
  'INSERT INTO orders (status, date_created) VALUES ($1, NOW())',
  [status]
);
 
 
    res.status(200).json({ message: 'Order saved successfully' });
  } catch (err) {
    console.error('Database insert error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
 


const PORT = 5000;



// Serve uploaded images
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/auth', require('./routes/userRoutes'));

app.use('/order', require('./routes/orderRoutes'));

app.listen(PORT,'0.0.0.0' , () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

