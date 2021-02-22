const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const userId = new mongoose.Types.ObjectId()
const user = {
    _id: userId,
    name: 'shahar',
    email: "shahaer1@gmail.com",
    password: "shshar123!",
    tokens: [
        {
            token: jwt.sign({ _id: userId }, process.env.JWT_SECRET)
        }
    ]
}
const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name: 'alma',
    email: "alma1@gmail.com",
    password: "alma123!",
    tokens: [
        {
            token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
        }
    ]
}

const task = {
    _id: new mongoose.Types.ObjectId(),
    description: "eat lunch",
    completed: false,
    owner: userId
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: "eat lunch-second",
    completed: true,
    owner: userId
}

const taskThird = {
    _id: new mongoose.Types.ObjectId(),
    description: "eat lunch-third",
    completed: true,
    owner: userTwoId
}

const setupDB = async () => {
    await User.deleteMany();
    await Task.deleteMany();
    await new User(user).save();
    await new User(userTwo).save();
    await new Task(task).save()
    await new Task(taskTwo).save()
    await new Task(taskThird).save()
}

module.exports = {
    setupDB,
    userId,
    user,
    userTwo,
    task,
    taskTwo
}