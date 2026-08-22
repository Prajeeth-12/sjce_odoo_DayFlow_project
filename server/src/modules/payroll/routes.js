const { Router } = require('express');
const { authGuard, roleGuard } = require('../../middleware/authGuard');
const controller = require('./controller');

const router = Router();

router.get('/:employee_id', authGuard, controller.get);
router.put('/:employee_id', authGuard, roleGuard(['admin']), controller.update);
router.get('/:employee_id/compute', authGuard, controller.compute);

module.exports = router;
