const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { user, userId, setupDB } = require('./fixtures/db')


beforeEach(setupDB)

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Andrew',
        email: 'andrew@example.com',
        password: 'MyPass777!'
    }).expect(201)

    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    expect(response.body).toMatchObject({
        user: {
            name: 'Andrew',
            email: 'andrew@example.com'
        },
        token: user.tokens[0].token
    })
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: user.email,
        password: user.password
    }).expect(200)

    const userFound = await User.findById(response.body.user._id)
    expect(userFound.tokens.length).toBe(2)
})

test('Should not login not existing user', async () => {
    await request(app).post('/users/login').send({
        email: user.email + 'm',
        password: user.password + '1'
    }).expect(400)
})

test('Should get user profile', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for not authonticated users', async () => {
    await request(app)
        .get('/users/me')
        // .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send()
        .expect(400)
})

test('Should delete user correctly', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send()
        .expect(200)

    const userFound = await User.findById(user._id)
    expect(userFound).toBeNull()
})

test('Should not delete user', async () => {
    await request(app)
        .delete('/users/me')
        // .set('Authorization',`Bearer ${user.tokens[0].token}`)
        .send()
        .expect(400)
})

test('Should upload avatar picture', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/avatar.jpg')
        .expect(200)

    const userFound = await User.findById(userId)
    expect(userFound.avatar).toEqual(expect.any(Buffer))
})

test('Should update user coordinates', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send({
            name: "Mikel"
        })
        .expect(200)

    const userChanged = await User.findById(userId)
    expect(userChanged.name).toBe(response.body.name)
})

test('Should not update invalid user coordinates', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send({
            location: "Tel Aviv"
        })
        .expect(400)
})