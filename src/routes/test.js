import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.render('test', { title: 'Test' });
});

router.post('/', (req, res) =>{
    const { name, email } = req.body;
    console.log(`Name: ${name}\nEmail: ${email}`);
    res.redirect('/test')
});

router.post('/login', (req, res) =>{
    console.log("You are now logged in!")
    res.redirect('/test');
});
router.post('/logout', (req, res) =>{
    console.log("You are now logged out!")
    res.redirect('/test');
});

export default router;