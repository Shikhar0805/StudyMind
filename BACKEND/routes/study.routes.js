const express = require('express');
const router = express.Router();
const multer = require('multer');
const studyController = require('../controllers/study.controller');

// Setup memory storage multer for PDF syllabus/notes uploads (max 5MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Define study application API endpoints
router.post('/generate', upload.single('file'), studyController.generateResource);

module.exports = router;
