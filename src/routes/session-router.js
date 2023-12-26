import express from 'express';
import passport from 'passport';

const router = express.Router();


router.post('/login', (req, res, next) => {
    passport.authenticate('login', (err, user, info) => {
        if (err) {
            return next(err)
        }
        if (!user) {
            return res.redirect('/login?error=' + info.message)
        }

        req.session.user = {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            age: user.age,
            role: user.role,
            cartId: user.cartId,
        }
    
        res.redirect('/products?message=You logged in correctly');
    })(req, res, next)
})

router.post('/register', (req, res, next) => {
    passport.authenticate('register', (err, user, info) => {
        if (err) {
            return next(err)
        }
        if (!user) {
            return res.redirect('/register?error=' + info.message)
        }
        let email=user.email

        res.redirect(`/login?message=User ${email} created successfully!`);
    })(req, res, next)
})


router.get('/github', passport.authenticate('github', {}), (req, res) => {
});

router.get('/callbackGithub', passport.authenticate('github', { failureRedirect: "/login" }), (req, res) => {
    req.session.user = req.user
    res.redirect('/products?message=You logged in correctly');
});

router.get('/logout', (req, res) => {

    req.session.destroy(error => {
        if (error) {
            res.redirect('/login?error=Logout failed')
        }
    })

    res.redirect('/login')

});



export default router;