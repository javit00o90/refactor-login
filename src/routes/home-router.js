import express from 'express';
const router = express.Router();
import ProductManager from '../dao/models/products.model.js';
import auth from '../utils/authMiddleware.js'

const productManager = new ProductManager();

router.get('/', auth, async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('home', { session: req.session , products});
    } catch (error) {
        res.status(500).send('Error obteniendo productos');
    }
});

router.get('/register', (req,res)=>{

    let {error, message}=req.query

    res.setHeader('Content-Type','text/html')
    res.status(200).render('register', {error, message})
})

router.get('/login',(req,res)=>{

    let {error, message}=req.query

    res.setHeader('Content-Type','text/html')
    res.status(200).render('login', {error, message})
})

router.get('/profile',auth, (req,res)=>{

    res.setHeader('Content-Type','text/html')
    res.status(200).render('profile', { session: req.session})
})
export default router;

