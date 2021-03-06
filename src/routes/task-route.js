const express = require('express')
const Task = require('../models/task')
const router = new express.Router();
const auth = require('../middlewares/auth');
const User = require('../models/user');

router.post('/tasks', auth, async (req, res) => {
    try {
        const task = new Task({
            ...req.body,
            owner: req.user._id
        })
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/tasks', auth, async (req, res) => {
    const match = {};
    if (req.query.completed)
        match.completed = req.query.completed === 'true'
    try {
        // const tasks = await Task.find({ owner: req.user._id });
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip)
            }
        }).execPopulate();
        console.log(req.user.tasks)
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findById(_id)
        if (!task)
            return res.status(404).send()
        res.send(task)
    } catch (e) {
        res.status(500).send(err)
    }
})


router.patch('/tasks/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isAllowed = updates.every((update) => allowedUpdates.includes(update))
    if (!isAllowed)
        return res.status(400).send({ 'error': 'updates Invalid' });
    try {
        const task = await Task.findById(req.params.id);
        if (!task)
            return res.status(404).send();
        updates.forEach((update) => task[update] = req.body[update])
        await task.save();
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})



router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task)
            return res.status(404).send()
        res.send(task)
    } catch (e) {
        res.status(500).send();
    }
})


module.exports = router