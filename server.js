require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sequelize = require('./config/db');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rate Limiting (Prevent brute force on activation)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/activate', limiter);

// Routes
app.get('/', (req, res) => res.redirect('/admin.html'));
app.use('/', require('./routes/licenseRoutes'));
app.use('/auth', require('./routes/authRoutes'));

const PORT = process.env.PORT || 5050;

// Database Sync and Start
sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Super Secure License Server running on port ${PORT}`);
        console.log(`🚀 MVC Architecture Active.`);
    });
});
