const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const { user, userTwo, task, taskTwo, userId, setupDB } = require('./fixtures/db')

beforeEach(setupDB)

test('Should create a task for a user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send({
            description: "love froudo"
        })
        .expect(201)
})

test('Should get all user tasks', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body.length).toEqual(2)
})

test('Should fail second user delete first task', async () => {
    const response = await request(app)
        .delete('/tasks/' + task._id)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)

    const taskCheck = await Task.findById(task._id)
    expect(taskCheck).not.toBeNull()
})