const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const { authGuard, roleGuard } = require('../../middleware/authGuard');
const controller = require('./controller');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../../uploads'),
  filename: (req, file, cb) => {
    cb(null, `avatar-${req.params.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

const router = Router();

router.get('/', authGuard, controller.list);
router.get('/search', authGuard, controller.search);
router.get('/:id', authGuard, controller.getById);
router.post('/', authGuard, roleGuard(['admin']), controller.create);
router.put('/:id', authGuard, controller.update);
router.put('/:id/avatar', authGuard, upload.single('avatar'), controller.uploadAvatar);
router.post('/:id/skills', authGuard, controller.addSkill);
router.post('/:id/certifications', authGuard, controller.addCertification);
router.delete('/:id', authGuard, roleGuard(['admin']), controller.remove);

module.exports = router;
