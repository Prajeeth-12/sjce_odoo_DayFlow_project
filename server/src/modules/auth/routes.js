const { Router } = require('express');
const { signup, signin, refresh, changePassword, getMe } = require('./controller');
const { authGuard } = require('../../middleware/authGuard');

const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/refresh', refresh);
router.post('/change-password', authGuard, changePassword);
router.get('/me', authGuard, getMe);

module.exports = router;
