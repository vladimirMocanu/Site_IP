const express = require('express')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const database = require('./database')
const initializePassport = require('./passport-config')

const app = express()

initializePassport(
	passport,
	email => database.getUserByEmail(email)
)

app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
	secret: 'secret',
	resave: false,
	saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')

app.get('/', (req, res) => {
	res.render('index.html')
})

app.get('/header', function (req, res) {
	res.render('header.html')
})

app.get('/subscribe', function (req, res) {
	res.render('subscribe.html')
})

app.get('/footer', function (req, res) {
	res.render('footer.html')
})

app.get('/login', checkNotAuthenticated, function (req, res) {
	res.render('login.html')
})

app.get('/signup', checkNotAuthenticated, function (req, res) {
	res.render('signup.html')
})

app.get('/about', function (req, res) {
	res.render('about.html')
})

app.get('/contact', function (req, res) {
	res.render('contact.html')
})

app.get('/hotels', function (req, res) {
	res.render('hotels.html')
})

app.get('/hotel', function (req, res) {
	res.render('hotel.html')
})

app.get('/hotelpage', function (req, res) {
	res.render('hotelpage.html')
})

app.get('/room', function (req, res) {
	res.render('room.html')
})

app.get('/list_property', checkAuthenticated, function (req, res) {
	res.render('list_property.html')
})

app.get('/booknow', checkAuthenticated, function (req, res) {
	console.log('TODO')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
}))

app.post('/signup', checkNotAuthenticated, async (req, res) => {
	try {
		const hashedPassword = await bcrypt.hash(req.body.pass, 10)
		let email = req.body.email
		let user = await database.getUserByEmail(email)

		if (user == null) {
			database.insertUser(req.body.email, hashedPassword)
			res.redirect('/login')
		} else {
			res.redirect('/signup')
		}
	} catch (e) {
		res.redirect('/signup')
	}
})

function checkAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next()
	}

	res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return res.redirect('/')
	}

	next()
}

app.listen(3000)