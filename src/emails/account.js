const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'itamar.hagai1@gmail.com',
        subject: 'Welcome to the app',
        text: `welcome ${name} ! let me know how you get along with the app !`
    })
}

const sendCancalationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'itamar.hagai1@gmail.com',
        subject: 'Welcome to the app',
        text: `Goodbye ${name} ! let me know why exactly you left the app... So i can improve it :) !`
    })
}

module.exports = { sendWelcomeEmail, sendCancalationEmail }
