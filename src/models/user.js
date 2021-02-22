const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userScheme = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value))
                throw new Error('email invalid')
        },
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.includes('password'))
                throw new Error('cannot contain the word password and length must be greater than 6')
        }
    },
    age: {
        type: Number,
        default: 0,
        min: 0
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ],
    avatar: {
        type: Buffer
    }
})

userScheme.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userScheme.statics.findByEmailAndPass = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user)
        throw new Error('unable to login')
    const isMatched = await bcrypt.compare(password, user.password)
    if (!isMatched)
        throw new Error('unable to login')

    return user
}

userScheme.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save();
    return token
}

userScheme.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password'))
        user.password = await bcrypt.hash(user.password, 8)

    next();
})


userScheme.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject
}

const User = mongoose.model('User', userScheme)

module.exports = User
