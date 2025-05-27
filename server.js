const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Serve uploaded images
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/auth', require('./routes/userRoutes'));

app.use('/order', require('./routes/orderRoutes'));

app.listen(PORT,'0.0.0.0' , () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
