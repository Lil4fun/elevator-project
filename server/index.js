const express = require('express')
const session = require('express-session')
const path = require('path')
const cookieParser = require('cookie-parser')
const app = express()
const port = 3000

var accountSid = process.env.TWILIO_ACCOUNT_SID = 'AC122de17d037c7245535686b0d3661108';
var authToken = process.env.TWILIO_ACCOUNT_AUTH_TOKEN = '1e3d65849f7de5d7b307930a68a92324';

const sms = require('twilio')(accountSid, authToken, {
  lazyLoading: true
})

const apiRouter = require('./routes/api.js')
app.use(express.static('client'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(session({ secret: 'grehjznejzkhgjrez', saveUninitialized: false, resave: false }))

app.use('/api/', apiRouter)

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})

module.exports = app