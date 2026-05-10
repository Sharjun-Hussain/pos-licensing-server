const express = require('express');
const router = express.Router();
const licenseController = require('../controllers/licenseController');
const authMiddleware = require('../middleware/auth');

// Public App Endpoints
router.post('/activate', licenseController.activate);
router.post('/sync', licenseController.sync);

// Protected Admin Endpoints
router.get('/admin/list', authMiddleware, licenseController.list);
router.post('/admin/generate', authMiddleware, licenseController.generate);
router.post('/admin/reset', authMiddleware, licenseController.reset);
router.get('/admin/logs', authMiddleware, licenseController.logs);

module.exports = router;
