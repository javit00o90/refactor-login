import express from 'express';
const router = express.Router();
import auth from '../utils/authMiddleware.js'


router.get('/', auth, async (req, res) => {
    res.render('chat', { session: req.session});
});

export default router;