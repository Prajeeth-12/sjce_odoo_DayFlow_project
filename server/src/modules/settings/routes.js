const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const { authGuard, roleGuard } = require('../../middleware/authGuard');
const controller = require('./controller');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../../uploads'),
  filename: (req, file, cb) => {
    cb(null, `logo-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

const router = Router();

router.get('/', authGuard, controller.get);
router.put('/', authGuard, roleGuard(['admin']), controller.update);
router.post('/logo', authGuard, roleGuard(['admin']), upload.single('logo'), controller.uploadLogo);

module.exports = router;
