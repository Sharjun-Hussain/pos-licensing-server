const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

/**
 * Handles administrator login
 */
exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    try {
        const admin = await Admin.findOne({ where: { username } });
        
        if (!admin) {
            // Use generic error for security
            return res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: admin.id, username: admin.username },
            process.env.JWT_SECRET || 'supersecret_license_key',
            { expiresIn: '12h' } // Increased to 12h for easier dashboard use
        );

        console.log(`🔐 Admin Login: ${username}`);
        return res.json({ success: true, token });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error during login.' });
    }
};

/**
 * Handles the initial setup of the first administrator account
 */
exports.createFirstAdmin = async (req, res) => {
    const { username, password, secretCode } = req.body;

    // Protection for initial setup
    if (secretCode !== 'INZEEDO_INITIAL_SETUP_2026') {
        console.warn(`⛔ Unauthorized admin setup attempt blocked.`);
        return res.status(403).json({ success: false, message: 'Unauthorized setup attempt.' });
    }

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    try {
        // Check if any admin already exists
        const existing = await Admin.findOne();
        if (existing) {
            return res.status(400).json({ success: false, message: 'Administrator already exists. Initial setup is disabled.' });
        }

        await Admin.create({ username, password });
        
        console.log(`🚀 INITIAL SETUP: Super Admin [${username}] created successfully.`);
        return res.json({ success: true, message: 'Super Admin created successfully. You can now log in.' });

    } catch (error) {
        console.error('Initial setup error:', error);
        return res.status(500).json({ success: false, message: 'Failed to create initial admin account: ' + error.message });
    }
};
