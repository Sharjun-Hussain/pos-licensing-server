const License = require('../models/License');
const forge = require('node-forge');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

// Load Private Key
const privateKeyPem = fs.readFileSync(path.join(__dirname, '../keys/private_key.pem'), 'utf8');
const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

exports.activate = async (req, res) => {
    const { licenseKey, hwid } = req.body;
    try {
        const license = await License.findOne({ where: { key: licenseKey } });

        if (!license) return res.status(404).json({ success: false, message: 'License key not found.' });
        if (license.status === 'revoked') return res.status(403).json({ success: false, message: 'License revoked.' });
        if (license.hwid && license.hwid !== hwid) return res.status(403).json({ success: false, message: 'Locked to another device.' });
        if (new Date(license.expiry) < new Date()) {
            license.status = 'expired';
            await license.save();
            return res.status(403).json({ success: false, message: 'License expired.' });
        }

        if (!license.hwid) {
            license.hwid = hwid;
            license.status = 'active';
            license.activatedAt = new Date();
            await license.save();
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

        res.json({ success: true, certificate: { payload, signature } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.sync = async (req, res) => {
    const { licenseKey, hwid } = req.body;
    try {
        const license = await License.findOne({ where: { key: licenseKey, hwid: hwid } });
        if (!license || license.status !== 'active') return res.status(403).json({ success: false });

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

        res.json({ success: true, certificate: { payload, signature } });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};

exports.list = async (req, res) => {
    try {
        const licenses = await License.findAll({ order: [['createdAt', 'DESC']] });
        res.json({ success: true, licenses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.generate = async (req, res) => {
    const { count, email, planType, billingCycle, expiryMonths } = req.body;
    const keys = [];
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + (expiryMonths || 12));

    try {
        for (let i = 0; i < (count || 1); i++) {
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
        res.json({ success: true, keys });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.reset = async (req, res) => {
    const { licenseKey } = req.body;
    try {
        const license = await License.findOne({ where: { key: licenseKey } });
        if (license) {
            license.hwid = null;
            license.status = 'pending';
            await license.save();
            return res.json({ success: true, message: 'Hardware ID reset.' });
        }
        res.status(404).json({ success: false, message: 'Key not found.' });
    } catch (err) {
        res.status(500).json({ success: false });
    }
};
