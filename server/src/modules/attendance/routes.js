const { Router } = require('express');
const { authGuard, roleGuard } = require('../../middleware/authGuard');
const controller = require('./controller');

const router = Router();

router.post('/check-in', authGuard, controller.checkIn);
router.post('/check-out', authGuard, controller.checkOut);
router.post('/confirm', authGuard, controller.confirmAttendance);
router.post('/reset', authGuard, controller.resetAttendance);
router.get('/status', authGuard, controller.getStatus);
router.get('/my', authGuard, controller.getMyAttendance);
router.get('/all', authGuard, roleGuard(['admin']), controller.getAllAttendance);
router.get('/summary', authGuard, controller.getSummary);

module.exports = router;
