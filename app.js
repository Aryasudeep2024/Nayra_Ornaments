const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT;
const connectDb = require('./config/db');
const router = require('./routes/index');
const cookieParser = require('cookie-parser');
const cors = require('cors');  // <-- Make sure this is installed

// ✅ CORS configuration: allow frontend origin and credentials
app.use(cors({
  origin: 'http://localhost:3000',  // <-- Your React frontend (or adjust as needed)
  credentials: true                 // <-- Required to allow cookies from frontend
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api', router);

// Default route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// DB connection and start server
connectDb();
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
