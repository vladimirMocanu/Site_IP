const express = require('express')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const userDB = require('./users-database')
const hotelDB = require('./hotels-database')
const roomDB = require('./room-database')
const reservationDB = require('./reservation-database')

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

app.post('/', (req, res) => {
	res.redirect('hotels')
})

app.get('/header', function (req, res) {
	res.render('header')
})

app.get('/index_reservation', function (req, res) {
	res.render('index_reservation')
})

app.get('/hotels_reservation', function (req, res) {
	res.render('hotels_reservation')
})

app.get('/popular_destinations', function (req, res) {
	res.render('popular_destinations')
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

app.post('/hotels', async function (req, res) {
	res.redirect('hotels')
})

app.get('/hotelsdb', async function (req, res) {
	const result = await hotelDB.all()
	res.json(result)
})

app.get('/hotelpage', function (req, res) {
	res.render('hotelpage')
})

app.get('/roomsdb', async function (req, res) {
	const result = await roomDB.all(req.query.id)
	res.json(result)
})

app.get('/list_property', checkAuthenticated, function (req, res) {
	res.render('list_property')
})

app.get('/booknow', checkAuthenticated, function (req, res) {
	console.log('TODO')
})

app.post('/booknow', checkAuthenticated, async (req, res) => {
	try {
		const user = await userDB.getUserByEmail(req.session.passport.user)
		const userId = user.id
		const roomId = req.query.id

		reservationDB.insertReservation(userId, roomId)
		console.log(userId + " " + roomId)

		res.redirect('/')
	} catch (e) {
		res.redirect('/login')
	}
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

		if (user == null && req.body.pass == req.body.confpass) {
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

		const room_names = req.body.roomName
		const room_prices = req.body.roomPrice
		const room_descriptions = req.body.roomDescription

		const user = await userDB.getUserByEmail(req.session.passport.user)
		const userID = user.id

		if (room_names.length != room_prices.length || room_descriptions.length != room_prices.length) {
			hotelDB.insertHotel(userID, hotel_name, location, description,
				(hotelID) => {
						const room_name = room_names
						const room_price = room_prices
						const room_description = room_descriptions
						roomDB.insertRoom(hotelID, room_name, room_price, room_description)
				})
		} else {
			hotelDB.insertHotel(userID, hotel_name, location, description,
				(hotelID) => {
					for (var i = 0; i < room_names.length; i++) {
						const room_name = room_names[i]
						const room_price = room_prices[i]
						const room_description = room_descriptions[i]
						roomDB.insertRoom(hotelID, room_name, room_price, room_description)
					}
				})
		}



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

function checkNotAuthenticatedAndLogout(req, res, next) {
	if (req.isAuthenticated()) {
		req.logout();
		return res.redirect('/')
	}

	next()
}

app.listen(3000)