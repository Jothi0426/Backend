//SQL code

//const bcrypt = require('bcryptjs');
//const pool = require('../db'); // Ensure your DB connection is correct
//


// const register = async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({ message: "Username and password are required" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const pool = await poolPromise;
//     await pool
//       .request()
//       .input('username', sql.VarChar, username)
//       .input('password', sql.VarChar, password)
//       .input('hashed_password', sql.VarChar, hashedPassword)
//       .query("INSERT INTO testdata (username, password, hashed_password) VALUES (@username, @password, @hashed_password)");

//     res.status(201).json({ message: "User registered successfully" });
//   } catch (error) {
//     console.error("Error inserting data:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// const loginUser = async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({ error: "Username and password are required" });
//     }

//     const pool = await poolPromise;
//     const result = await pool
//       .request()
//       .input("username", sql.VarChar, username)
//       .query("SELECT hashed_password FROM testdata WHERE username = @username");

//     if (result.recordset.length === 0) {
//       return res.status(401).json({ error: "Invalid username or password" });
//     }

//     const hashedPassword = result.recordset[0].hashed_password;
//     const isMatch = await bcrypt.compare(password, hashedPassword);

//     if (!isMatch) {
//       return res.status(401).json({ error: "Invalid username or password" });
//     }

//     res.json({ message: "Login successful" });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// module.exports = { register, loginUser };


//

// const bcrypt = require('bcryptjs');
// const pool = require('../db'); // Make sure db.js is correct
// // const JWT_SECRET = 'b4N7$gYp@2rT!kX9zFqM#vJ5wL8dC6H9';
// // const jwt = require('jsonwebtoken');


// // Register function
// const register = async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({ message: "Username and password are required" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Save to PostgreSQL using pg style
//     await pool.query(
//       "INSERT INTO testdata (username, password, hashed_password) VALUES ($1, $2, $3)",
//       [username, password, hashedPassword]
//     );

//     res.status(201).json({ message: "User registered successfully" });
//   } catch (error) {
//     console.error("Error inserting data:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// // Login function
// const loginUser = async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({ error: "Username and password are required" });
//     }

//     const result = await pool.query(
//       "SELECT hashed_password FROM testdata WHERE username = $1",
//       [username]
//     );

//     if (result.rows.length === 0) {
//       return res.status(401).json({ error: "Invalid username or password" });
//     }

//     const hashedPassword = result.rows[0].hashed_password;
//     const isMatch = await bcrypt.compare(password, hashedPassword);

//     if (!isMatch) {
//       return res.status(401).json({ error: "Invalid username or password" });
//     }
//     // const token = jwt.sign({ username: username },JWT_SECRET,{ expiresIn: "1h" } // Token valid for 1 hour
//     // );
//     // res.json({token, message: "Login successful" });
//     res.json({ message: "Login successful" });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };





// app.get("/intake_progres", async (req, res) => {
//   try {
//     const result = await pool.query('SELECT day,intake from intake_progress;');
//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "No data found" });
//     }
//     res.json(result.rows);
//   } catch (err) {
//     console.error("❌ Error fetching data:", err);
//     res.status(500).json({ error: "Server error", details: err.message });
//   }
// });

// app.post("/tasks", async (req, res) => {
//   try {
    
//     const { sleep, hydration, fat, protein, vegetables, exercise, fiber, probiotics } = req.body;

//     const result = await pool.query(
//       "INSERT INTO tasks (sleep, hydration, fat, protein, vegetables, exercise, fiber, probiotics) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
//       [sleep, hydration, fat, protein, vegetables, exercise, fiber, probiotics]
//     );
//     console.log("SQL Result:", result);


//     res.status(201).json({ message: "Data inserted successfully", data: result.rows[0] });
//   } catch (error) {
//     console.error("Error inserting data:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });



// app.get('/weekly-nutrition-summary', async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT 
//       ROUND(AVG(fat)) AS fat,
//       ROUND(AVG(protein)) AS protein,
//       ROUND(AVG(fiber)) AS fiber,
//       ROUND(AVG(vegetables)) AS vegetables
//      FROM tasks
//     WHERE date::date >= CURRENT_DATE - INTERVAL '6 days';
//     `);

//     const data = result.rows[0];

//     res.json({
//       labels: ["Fat", "Protein", "Fiber", "Vegetables"],
//       values: [data.fat, data.protein, data.fiber, data.vegetables]
//     });

//   } catch (err) {
//     console.error("Backend error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });
// app.get('/weekly-lifestyle-summary', async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT 
//       ROUND(AVG(fat)) AS sleep,
//       ROUND(AVG(protein)) AS exercise
//      FROM tasks
//     WHERE date::date >= CURRENT_DATE - INTERVAL '6 days';
//     `);

//     const data = result.rows[0];

//     res.json({
//       labels: ["sleep", "exercise"],
//       values: [ data.sleep, data.exercise]
//     });

//   } catch (err) {
//     console.error("Backend error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });


// const multer = require('multer');
// const path = require('path');
// app.use('/uploads', express.static('uploads'));


// // Multer setup to handle image upload
// const storage = multer.diskStorage({
//   destination: 'uploads/',
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// const upload = multer({ storage });
// app.post('/profiles', upload.single('photo'), async (req, res) => {
//   const { firstName, lastName, gender, birthday, goal } = req.body;

//   // ✅ Check if a photo is uploaded
//   if (!req.file) {
//     return res.status(400).json({
//       success: false,
//       error: 'Photo is required. Please upload a profile image.',
//     });
//   }

//   const photo = req.file.filename;

//   try {
//     const result = await pool.query(
//       `INSERT INTO profiles 
//       (first_name, last_name, gender, birthday, goal, photo, created_at) 
//       VALUES ($1, $2, $3, $4, $5, $6, NOW())
//       RETURNING *`,
//       [firstName, lastName, gender, birthday, goal, photo]
//     );

//     console.log("✅ SQL Result:", result.rows[0]);

//     res.json({ success: true, profile: result.rows[0] });
//   } catch (err) {
//     console.error('❌ DB Insert Error:', err);
//     res.status(500).json({ success: false, error: 'Error saving profile' });
//   }
// });




const bcrypt = require('bcryptjs');
const pool = require('../db'); // Ensure db.js is correct

const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO testdata (username, password, hashed_password) VALUES ($1, $2, $3)",
      [username, password, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



const loginUser = async (req, res) => {

  console.log("Login request body:", req.body); // Debugging line
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const result = await pool.query(
      "SELECT hashed_password FROM testdata WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const hashedPassword = result.rows[0].hashed_password;
    const isMatch = await bcrypt.compare(password, hashedPassword);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    res.json({ message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getIntakeProgress = async (req, res) => {
  try {
    const result = await pool.query('SELECT day, intake FROM intake_progress;');
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching intake progress:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// const insertTasks = async (req, res) => {
//   try {
//     const { sleep, hydration, fat, protein, vegetables, exercise, fiber, probiotics } = req.body;

//     const result = await pool.query(
//       "INSERT INTO tasks (sleep, hydration, fat, protein, vegetables, exercise, fiber, probiotics) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
//       [sleep, hydration, fat, protein, vegetables, exercise, fiber, probiotics]
//     );

//     res.status(201).json({ message: "Data inserted successfully", data: result.rows[0] });
//   } catch (error) {
//     console.error("Error inserting task:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };



const insertTasks = async (req, res) => {
  try {
    let { sleep, hydration, fat, protein, vegetables, exercise, fiber, probiotics } = req.body;

    // Convert empty strings or undefined to null
    const toNull = (value) => (value === '' || value === undefined ? null : value);

    sleep = toNull(sleep);
    hydration = toNull(hydration);
    fat = toNull(fat);
    protein = toNull(protein);
    vegetables = toNull(vegetables);
    exercise = toNull(exercise);
    fiber = toNull(fiber);
    probiotics = toNull(probiotics);

    const result = await pool.query(
      "INSERT INTO tasks (sleep, hydration, fat, protein, vegetables, exercise, fiber, probiotics) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [sleep, hydration, fat, protein, vegetables, exercise, fiber, probiotics]
    );

    res.status(201).json({ message: "Data inserted successfully", data: result.rows[0] });
  } catch (error) {
    console.error("Error inserting task:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};









const getWeeklyNutritionSummary = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ROUND(AVG(fat)) AS fat,
        ROUND(AVG(protein)) AS protein,
        ROUND(AVG(fiber)) AS fiber,
        ROUND(AVG(vegetables)) AS vegetables
      FROM tasks
      WHERE date IS NOT NULL AND date != '' AND date::date >= CURRENT_DATE - INTERVAL '6 days';
    `);

    const data = result.rows[0];
    res.json({
      labels: ["Fat", "Protein", "Fiber", "Vegetables"],
      values: [data.fat, data.protein, data.fiber, data.vegetables]
    });
  } catch (err) {
    console.error("Backend error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getWeeklyLifestyleSummary = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        ROUND(AVG(sleep)) AS sleep,
        ROUND(AVG(exercise)) AS exercise
      FROM tasks
      WHERE date IS NOT NULL AND date != '' AND date::date >= CURRENT_DATE - INTERVAL '6 days';
    `);
 
    const data = result.rows[0];
 
    res.json({
      labels: ["Sleep", "Exercise"],
      values: [data.sleep, data.exercise]
    });
 
  } catch (err) {
    console.error("Backend error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  register,
  loginUser,
  getIntakeProgress,
  insertTasks,
  getWeeklyNutritionSummary,
  getWeeklyLifestyleSummary
};



