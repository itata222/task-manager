const express = require('express')
require('./db/mongoose')
const userRouter = require('./routes/user-route')
const taskRouter = require('./routes/task-route')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

module.exports = app