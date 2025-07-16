const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const connectDb = require('./config/db');
const router = require('./routes/index');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// ✅ Read allowed domains from .env
const clientUrl = process.env.CLIENT_DOMAIN;
const clientProdUrl = process.env.PROD_CLIENT_DOMAIN;

const allowedOrigins = [clientUrl, clientProdUrl];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
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

// Connect DB and start server
connectDb();
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
