const express = require('express')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const userDB = require('./users-database')
const hotelDB = require('./hotels-database')

const initializePassport = require('./passport-config')

const app = express()

initializePassport(
	passport,
	email => userDB.getUserByEmail(email)
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
	res.render('index')
})

app.get('/header', function (req, res) {
	res.render('header')
})

app.get('/subscribe', function (req, res) {
	res.render('subscribe')
})

app.get('/footer', function (req, res) {
	res.render('footer')
})

app.get('/login', checkNotAuthenticated, function (req, res) {
	res.render('login')
})

app.get('/signup', checkNotAuthenticated, function (req, res) {
	res.render('signup')
})

app.get('/about', function (req, res) {
	res.render('about')
})

app.get('/contact', function (req, res) {
	res.render('contact')
})

app.get('/hotels', async function (req, res) {
	res.render('hotels')
})

app.get('/hotelsdb', async function (req, res) {
	const result = await hotelDB.all()
	res.json(result)
})

app.get('/hotelpage', function (req, res) {
	res.render('hotelpage')
	console.log('TODO')
})

app.get('/room', function (req, res) {
	res.render('room')
	/**
	 * cred ca room.html o sa aiba aceiasi soarta ca hotel.html
	 * trebuie transformata in printf-uri in cod
	 */
})

app.get('/list_property', checkAuthenticated, function (req, res) {
	res.render('list_property')
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
		const email = req.body.email
		const user = await userDB.getUserByEmail(email)

		if (user == null) {
			userDB.insertUser(req.body.email, hashedPassword)
			res.redirect('/login')
		} else {
			res.redirect('/signup')
		}
	} catch (e) {
		res.redirect('/signup')
	}
})

app.post('/list_property', checkAuthenticated, async function (req, res) {
	try {
		const hotel_name = req.body.hotel_name
		const location = req.body.location
		const description = req.body.description
		const user = await userDB.getUserByEmail(req.session.passport.user)
		const userID = user.id

		hotelDB.insertHotel(userID, hotel_name, location, description)
		res.redirect('/')
	} catch (e) {
		res.redirect('/signup')
	}
})

app.get('/rows', async function (req, res) {
	res.json(await hotelDB.all())
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