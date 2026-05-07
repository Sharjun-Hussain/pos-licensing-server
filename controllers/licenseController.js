const License = require('../models/License');
const forge = require('node-forge');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

// Load Private Key with safety check
let privateKey;
try {
    const keyPath = path.join(__dirname, '../keys/private_key.pem');
    if (fs.existsSync(keyPath)) {
        const privateKeyPem = fs.readFileSync(keyPath, 'utf8');
        privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    }
} catch (err) {
    console.error('❌ CRITICAL: Failed to load RSA Private Key. Licenses cannot be signed.');
}

/**
 * Validates the license and signs a certificate for the client
 */
exports.activate = async (req, res) => {
    const { licenseKey, hwid } = req.body;

    if (!licenseKey || !hwid) {
        return res.status(400).json({ success: false, message: 'License key and Hardware ID are required.' });
    }

    try {
        const license = await License.findOne({ where: { key: licenseKey } });

        if (!license) {
            return res.status(404).json({ success: false, message: 'License key not found. Please check your spelling.' });
        }

        // Validation Logic
        if (license.status === 'revoked') {
            return res.status(403).json({ success: false, message: 'This license has been revoked. Contact support.' });
        }

        if (license.hwid && license.hwid !== hwid) {
            return res.status(403).json({ success: false, message: 'This license is already active on another device.' });
        }

        const now = new Date();
        if (license.expiry && new Date(license.expiry) < now) {
            license.status = 'expired';
            await license.save();
            return res.status(403).json({ success: false, message: 'Your license expired on ' + new Date(license.expiry).toLocaleDateString() });
        }

        // Bind HWID if first time
        if (!license.hwid) {
            license.hwid = hwid;
            license.status = 'active';
            license.activatedAt = now;
            await license.save();
        }

        // Sign the certificate
        if (!privateKey) {
            return res.status(500).json({ success: false, message: 'Server configuration error (Keys missing).' });
        }

        const payload = JSON.stringify({
            licenseKey: license.key,
            hwid: license.hwid,
            expiry: license.expiry,
            plan: license.planType,
            issuedAt: now.toISOString()
        });

        const md = forge.md.sha256.create();
        md.update(payload, 'utf8');
        const signature = forge.util.encode64(privateKey.sign(md));

        console.log(`✅ Activated: ${licenseKey} for HWID: ${hwid}`);
        return res.json({ success: true, certificate: { payload, signature } });

    } catch (error) {
        console.error('Activation error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error during activation.' });
    }
};

/**
 * Periodically re-signs a certificate to update local state (e.g. renewals)
 */
exports.sync = async (req, res) => {
    const { licenseKey, hwid } = req.body;
    
    if (!licenseKey || !hwid) return res.status(400).json({ success: false });

    try {
        const license = await License.findOne({ where: { key: licenseKey, hwid: hwid } });
        
        if (!license || license.status !== 'active') {
            return res.status(403).json({ success: false, message: 'Invalid or inactive license.' });
        }

        const payload = JSON.stringify({
            licenseKey: license.key,
            hwid: license.hwid,
            expiry: license.expiry,
            plan: license.planType,
            issuedAt: new Date().toISOString()
        });

        const md = forge.md.sha256.create();
        md.update(payload, 'utf8');
        const signature = forge.util.encode64(privateKey.sign(md));

        return res.json({ success: true, certificate: { payload, signature } });
    } catch (error) {
        console.error('Sync error:', error);
        return res.status(500).json({ success: false });
    }
};

/**
 * Lists all licenses for the Admin Dashboard
 */
exports.list = async (req, res) => {
    try {
        const licenses = await License.findAll({ 
            order: [['createdAt', 'DESC']],
            limit: 1000 
        });
        return res.json({ success: true, licenses });
    } catch (err) {
        console.error('List error:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch licenses.' });
    }
};

/**
 * Generates a batch of new license keys
 */
exports.generate = async (req, res) => {
    const { count, email, planType, billingCycle, expiryMonths } = req.body;
    
    if (!email) return res.status(400).json({ success: false, message: 'Customer email is required.' });

    const keys = [];
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + (expiryMonths || 12));

    try {
        const batchCount = Math.min(parseInt(count || 1), 50); // Limit to 50 at a time

        for (let i = 0; i < batchCount; i++) {
            const key = `POS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            await License.create({ 
                key, 
                customerEmail: email, 
                planType: planType || 'Pro',
                billingCycle: billingCycle || 'Yearly',
                expiry, 
                status: 'pending' 
            });
            keys.push(key);
        }
        
        console.log(`🎁 Generated ${batchCount} keys for ${email}`);
        return res.json({ success: true, keys });
    } catch (err) {
        console.error('Generation error:', err);
        return res.status(500).json({ success: false, message: 'Failed to generate keys.' });
    }
};

/**
 * Resets the hardware lock for a license key
 */
exports.reset = async (req, res) => {
    const { licenseKey } = req.body;
    
    if (!licenseKey) return res.status(400).json({ success: false, message: 'License key is required.' });

    try {
        const license = await License.findOne({ where: { key: licenseKey } });
        if (license) {
            license.hwid = null;
            license.status = 'pending';
            await license.save();
            console.log(`🔄 Reset HWID for: ${licenseKey}`);
            return res.json({ success: true, message: 'Hardware ID reset successfully. Customer can now activate on a new device.' });
        }
        return res.status(404).json({ success: false, message: 'License key not found.' });
    } catch (err) {
        console.error('Reset error:', err);
        return res.status(500).json({ success: false, message: 'Failed to reset hardware lock.' });
    }
};
