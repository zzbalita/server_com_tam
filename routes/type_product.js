var express = require('express');
var router = express.Router();
const tp = require('../controllers/typeProduct.controller')
const authMiddleware = require('../middlewares/authMiddleware');


router.get('/', tp.getTypeProducts);

router.post('/add_type', authMiddleware, tp.addTypeProduct);

router.put('/:typeId', authMiddleware, tp.updateTypeProduct);

router.delete('/:typeId', authMiddleware, tp.deleteTypeProduct);

router.get('/:typeId', tp.getTypeProductById);

module.exports = router;