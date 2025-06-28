const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT;
const connectDb = require('./config/db');
const router = require('./routes/index');
const cookieParser = require('cookie-parser');
const cors = require('cors');  // <-- Make sure this is installed

// ✅ CORS configuration: allow frontend origin and credentials
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
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
