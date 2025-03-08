const express = require('express')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
// Remove csurf dependency
// const csrf = require('csurf')

const { initializeDatabase } = require('./db-init')
const userDB = require('./users-database')
const hotelDB = require('./hotels-database')
const roomDB = require('./room-database')
const reservationDB = require('./reservation-database')
const { query } = require('./db-config');
const messagesDB = require('./messages-database');

const initializePassport = require('./passport-config')

const app = express()

initializePassport(
	passport,
	email => userDB.getUserByEmail(email)
)

// Initialize database before setting up routes
initializeDatabase()
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch(err => {
    console.error('Database initialization failed:', err);
  });

app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(flash())
app.use(session({
	secret: 'secret',
	resave: false,
	saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

// REMOVE ALL CSRF MIDDLEWARE
// const { csrfMiddleware } = require('./utils/csrf-utils');
// app.use(csrfMiddleware);

// REMOVE CSRF TOKEN PASSING TO VIEWS
// app.use((req, res, next) => {
//   // Store original render function
//   const originalRender = res.render;
//   
//   // Override render to include csrfToken in all views
//   res.render = function(view, options, callback) {
//     // Ensure options is an object
//     options = options || {};
//     
//     // Add csrfToken to options if not already present
//     if (!options.csrfToken && res.locals.csrfToken) {
//       options.csrfToken = res.locals.csrfToken;
//     }
//     
//     // Call the original render with updated options
//     return originalRender.call(this, view, options, callback);
//   };
//   
//   next();
// });

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

app.get('/login', checkNotAuthenticatedAndLogout, function (req, res) {
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
  res.render('hotelpage', { hotel: { id: req.query.id, hotelName: req.query.hotelName } });
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

// Add new route for account page
app.get('/account', checkAuthenticated, async function (req, res) {
  try {
    const user = await userDB.getUserByEmail(req.session.passport.user);
    let hotels = await hotelDB.all();
    hotels = hotels.filter(h => h.owner == user.id);
    let reservations = [];
    if (hotels.length > 0) {
      // Pentru hotel owner, preia rezervările pentru proprietăți
      reservations = await reservationDB.getByOwner(user.id);
    } else {
      // Pentru utilizatorii non-hotel owner
      reservations = await reservationDB.getByUser(user.id);
    }
    res.render('account', { user, hotels, reservations, favorites: [] });
  } catch (e) {
    console.error("Error loading account page:", e);
    res.redirect('/');
  }
});

// New route to cancel a reservation
app.post('/cancelReservation', checkAuthenticated, async (req, res) => {
	const reservationId = req.body.reservationId;
	try {
		await reservationDB.deleteReservation(reservationId);
		res.redirect('/account');
	} catch (error) {
		console.error("Cancellation error:", error);
		res.redirect('/account');
	}
});

// New route to update password
app.post('/updatePassword', checkAuthenticated, async (req, res) => {
	const { newPassword, confirmPassword } = req.body;
	if(newPassword !== confirmPassword){
		req.flash('error', 'Passwords do not match.');
		return res.redirect('/account');
	}
	try {
		const user = await userDB.getUserByEmail(req.session.passport.user);
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		await query('UPDATE user SET password = ? WHERE id = ?', [hashedPassword, user.id]);
		req.flash('success', 'Password updated successfully.');
		res.redirect('/account');
	} catch (error) {
		console.error("Password update error:", error);
		req.flash('error', 'Error updating password.');
		res.redirect('/account');
	}
});

// Route pentru submit review
app.post('/submitReview', checkAuthenticated, async (req, res) => {
  const { hotelId, reviewText } = req.body;
  try {
    // Funcție de inserare recenzie (să se adauge în baza de date)
    await require('./reviews-database').insertReview(req.session.passport.user, hotelId, reviewText);
    res.redirect('back');
  } catch (err) {
    console.error("Error submitting review:", err);
    res.redirect('back');
  }
});

// Actualizare ruta de mesagerie
app.get('/messages', checkAuthenticated, async (req, res) => {
  try {
    const user = await userDB.getUserByEmail(req.session.passport.user);
    const messages = await messagesDB.getMessagesForUser(user.id);
    res.render('messages', { user, messages });
  } catch (err) {
    console.error("Error loading messages:", err);
    res.redirect('/');
  }
});

// Nouă rută POST pentru trimiterea unui mesaj
app.post('/messages', checkAuthenticated, async (req, res) => {
  const { receiverEmail, content } = req.body;
  
  if (!receiverEmail || !content) {
    req.flash('error', 'Email destinatar și conținutul mesajului sunt necesare.');
    return res.redirect('/messages');
  }
  
  try {
    const sender = await userDB.getUserByEmail(req.session.passport.user);
    const receiver = await userDB.getUserByEmail(receiverEmail);
    if (!receiver) {
      req.flash('error', 'Utilizatorul destinatar nu există.');
      return res.redirect('/messages');
    }
    await messagesDB.sendMessage(sender.id, receiver.id, content);
    req.flash('success', 'Mesaj trimis cu succes.');
    
    if (req.xhr) {
      return res.json({ success: true, message: 'Mesaj trimis cu succes.' });
    }
    
    res.redirect('/messages');
  } catch (err) {
    console.error("Error sending message:", err);
    req.flash('error', 'Eroare la trimiterea mesajului.');
    if (req.xhr) {
      return res.status(500).json({ error: 'Eroare la trimiterea mesajului.' });
    }
    res.redirect('/messages');
  }
});

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