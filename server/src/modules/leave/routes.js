const { Router } = require('express');
const { authGuard, roleGuard } = require('../../middleware/authGuard');
const controller = require('./controller');

const router = Router();

router.get('/types', authGuard, controller.getTypes);
router.post('/request', authGuard, controller.createRequest);
router.get('/my', authGuard, controller.getMyRequests);
router.get('/all', authGuard, roleGuard(['admin']), controller.getAllRequests);
router.put('/:id/approve', authGuard, roleGuard(['admin']), controller.approve);
router.put('/:id/reject', authGuard, roleGuard(['admin']), controller.reject);
router.get('/calendar', authGuard, controller.getCalendar);
router.get('/public-holidays', authGuard, controller.getPublicHolidays);

module.exports = router;
