const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await Admin.findOne({ where: { username } });
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { id: admin.id, username: admin.username },
            process.env.JWT_SECRET || 'supersecret_license_key',
            { expiresIn: '8h' }
        );

        res.json({ success: true, token });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

exports.createFirstAdmin = async (req, res) => {
    const { username, password, secretCode } = req.body;

    // Protection for initial setup
    if (secretCode !== 'INZEEDO_INITIAL_SETUP_2026') {
        return res.status(403).json({ success: false, message: 'Unauthorized setup attempt.' });
    }

    try {
        const existing = await Admin.findOne();
        if (existing) return res.status(400).json({ success: false, message: 'Admin already exists.' });

        await Admin.create({ username, password });
        res.json({ success: true, message: 'Super Admin created successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
