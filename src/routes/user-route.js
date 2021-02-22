const express = require('express')
const User = require('../models/user')
const router = new express.Router();
const auth = require('../middlewares/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancalationEmail } = require('../emails/account')

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        const token = await user.generateAuthToken()
        sendWelcomeEmail(user.email, user.name)
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isAllowed = updates.every((update) => allowedUpdates.includes(update))
    if (!isAllowed)
        return res.status(400).send({ 'error': 'updates Invalid' });
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save();
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByEmailAndPass(req.body.email, req.body.password)
        const token = await user.generateAuthToken();
        res.send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/logout', async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
        await user.save()
        res.send()
    } catch (e) {
        res.status(500).send();
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        sendCancalationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send();
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('file must be an image!'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save();
    res.send()
}, (err, req, res, next) => {
    res.status(400).send({ error: err.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    const id = req.params.id
    try {
        const user = await User.findById(id)
        if (!user || !user.avatar)
            throw new Error()
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (err) {
        res.status(404).send()
    }
})

module.exports = router