import express from 'express';
const router = express.Router();
import { getProducts } from '../utils/productOperations.js';
import auth from '../utils/authMiddleware.js'

router.get('/', auth, async (req, res) => {
    try {
        let {message}=req.query
        const productsData = await getProducts(req);
        res.render('products', { session: req.session, productsData, message });
    } catch (error) {
        console.error('Error retrieving products:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;