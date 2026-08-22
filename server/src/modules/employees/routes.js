const { Router } = require('express');
const { authGuard, roleGuard } = require('../../middleware/authGuard');
const controller = require('./controller');

const router = Router();

router.get('/', authGuard, controller.list);
router.get('/search', authGuard, controller.search);
router.get('/:id', authGuard, controller.getById);
router.post('/', authGuard, roleGuard(['admin']), controller.create);
router.put('/:id', authGuard, controller.update);
router.delete('/:id', authGuard, roleGuard(['admin']), controller.remove);

module.exports = router;
