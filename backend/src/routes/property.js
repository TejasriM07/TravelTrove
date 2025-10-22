const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../utils/auth');
const multer = require('multer');
const upload = multer({ dest: '/tmp' });
const controller = require('../controllers/propertyController');

// GET host's properties - MUST come before /:id route
router.get('/my-properties', authMiddleware, controller.listHostProperties);

router.get('/', controller.listProperties);
router.get('/:id', controller.getProperty);
router.post('/', authMiddleware, upload.array('images', 10), controller.createProperty);
router.put('/:id', authMiddleware, upload.array('images', 10), controller.updateProperty);

module.exports = router;
