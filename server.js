require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sequelize = require('./config/db');

const logger = require('./utils/logger');
const app = express();

const SECRET_TOKEN = process.env.APP_SECRET_TOKEN || 'INZEEDO_SECURE_2026_PROD';

// Security Middlewares
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com"],
            "script-src-attr": ["'unsafe-inline'"],
            "style-src": ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com", "fonts.googleapis.com"],
            "font-src": ["'self'", "cdnjs.cloudflare.com", "fonts.gstatic.com"],
            "img-src": ["'self'", "data:", "https:"]
        },
    },
}));
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Security & Professional Logger Middleware
app.use((req, res, next) => {
    const token = req.headers['x-inzeedo-token'];
    
    // Log every request
    logger.info(`${req.method} ${req.url} - IP: ${req.ip} - Token: ${token ? 'Present' : 'Missing'}`);

    if (req.path === '/activate' || req.path === '/sync') {
        if (token !== SECRET_TOKEN) {
            logger.warn(`🚫 Unauthorized access attempt from ${req.ip} - Invalid Token`);
            return res.status(401).json({ success: false, message: 'Unauthorized access.' });
        }
    }
    next();
});

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
