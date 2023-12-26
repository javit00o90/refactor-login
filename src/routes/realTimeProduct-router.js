import express from 'express';
const router = express.Router();
import { deleteProduct, addProduct } from '../utils/productOperations.js';
import auth from '../utils/authMiddleware.js'


router.get('/', auth, (req, res) => {
    res.render('realTimeProducts', { session: req.session});
});
router.delete('/:pid', deleteProduct);
router.post('/', addProduct);


export default router;
