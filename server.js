// Importul modulelor și configurarea inițială
const express = require('express');
const bcrypt = require('bcrypt');           // pentru criptarea parolelor
const passport = require('passport');       // pentru autentificare
const flash = require('express-flash');       // pentru mesaje flash
const session = require('express-session');   // gestionarea sesiunilor
const methodOverride = require('method-override');
const helmet = require('helmet');             // securizare HTTP

// Importul modulelor proprii
const { initializeDatabase } = require('./db-init');
const userDB = require('./users-database');
const hotelDB = require('./hotels-database');
const roomDB = require('./room-database');
const reservationDB = require('./reservation-database');
const { query } = require('./db-config');
const messagesDB = require('./messages-database');
const initializePassport = require('./passport-config');

const app = express();

// Configurare Passport pentru autentificare
initializePassport(passport, email => userDB.getUserByEmail(email));

// Inițializare bază de date
initializeDatabase()
  .then(() => console.log('Database initialized successfully'))
  .catch(err => console.error('Database initialization failed:', err));

// Configurarea middleware‑urilor de bază
app.use(express.static(__dirname + '/public'));  // Servirea fișierelor statice
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(flash());
app.use(helmet());

// Configurarea sesiunii cu cookie-uri securizate
app.use(session({
	secret: process.env.SESSION_SECRET || 'secret',
	resave: false,
	saveUninitialized: false,
	cookie: { httpOnly: true, secure: process.env.NODE_ENV === 'production' }
}));

// Inițializarea Passport și metoda override
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

// CSRF Middleware pentru protecție peste toate formularele
const { csrfMiddleware } = require('./utils/csrf-utils');
app.use(csrfMiddleware);

// Atașare token CSRF la render-ul fiecărei pagini
app.use((req, res, next) => {
	const originalRender = res.render;
	res.render = (view, options = {}, callback) => {
		// Adaugă token-ul CSRF dacă nu e deja prezent
		if (!options.csrfToken && res.locals.csrfToken) {
			options.csrfToken = res.locals.csrfToken;
		}
		return originalRender.call(res, view, options, callback);
	};
	next();
});

// Configurarea view engine (EJS)
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Helper pentru gestionarea erorilor în rutele async
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Rute generale
app.get('/', (req, res) => {
  // Renderizarea paginii principale
  res.render('index'); 
});
app.post('/', (req, res) => res.redirect('hotels'));

app.get('/header', (req, res) => res.render('header'));
app.get('/footer', (req, res) => res.render('footer'));
app.get('/subscribe', (req, res) => res.render('subscribe'));
app.get('/index_reservation', (req, res) => res.render('index_reservation'));
app.get('/hotels_reservation', (req, res) => res.render('hotels_reservation'));
app.get('/popular_destinations', (req, res) => res.render('popular_destinations'));

// Rute de autentificare și pagini statice cu validări
app.get('/login', checkNotAuthenticatedAndLogout, (req, res) => res.render('login'));
app.get('/signup', checkNotAuthenticated, (req, res) => res.render('signup'));
app.get('/about', (req, res) => res.render('about'));
app.get('/contact', (req, res) => res.render('contact'));

// Rute pentru gestionarea hotelurilor și rezervărilor
app.get('/hotels', asyncHandler(async (req, res) => res.render('hotels')));
app.post('/hotels', asyncHandler(async (req, res) => res.redirect('hotels')));
app.get('/hotelsdb', asyncHandler(async (req, res) => {
	const result = await hotelDB.all();
	res.json(result);
}));
app.get('/hotelpage', (req, res) => 
	res.render('hotelpage', { hotel: { id: req.query.id, hotelName: req.query.hotelName } })
);
app.get('/roomsdb', asyncHandler(async (req, res) => {
	const result = await roomDB.all(req.query.id);
	res.json(result);
}));
app.get('/list_property', checkAuthenticated, (req, res) => res.render('list_property'));

// Rute pentru booking și gestionarea contului
app.route('/booknow')
  .get(checkAuthenticated, (req, res) => {
    // Placeholder pentru pagina de booking
    console.log('TODO');
  })
  .post(checkAuthenticated, asyncHandler(async (req, res) => {
		// Preluare utilizator și inserare rezervare în baza de date
		const user = await userDB.getUserByEmail(req.session.passport.user);
		const roomId = req.query.id;
		await reservationDB.insertReservation(user.id, roomId);
		res.redirect('/');
  }));

// Rute pentru autentificare (login, signup) cu validare
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
}));

app.post('/signup', checkNotAuthenticated, asyncHandler(async (req, res) => {
	// Criptare parolă înainte de inserție
	const hashedPassword = await bcrypt.hash(req.body.pass, 10);
	const email = req.body.email;
	const user = await userDB.getUserByEmail(email);
	if (!user && req.body.pass === req.body.confpass) {
		await userDB.insertUser(email, hashedPassword);
		res.redirect('/login');
	} else res.redirect('/signup');
}));

// Rute pentru inserția proprietății și a camerelor asociate
app.post('/list_property', checkAuthenticated, asyncHandler(async (req, res) => {
	const { hotel_name, location, description, roomName, roomPrice, roomDescription } = req.body;
	const user = await userDB.getUserByEmail(req.session.passport.user);
	// Inserarea hotelului în baza de date
	const hotelID = await hotelDB.insertHotel(user.id, hotel_name, location, description);
	// Inserarea camerelor, verificând dacă există mai multe
	if (Array.isArray(roomName)) {
		for (let i = 0; i < roomName.length; i++) {
			await roomDB.insertRoom(hotelID, roomName[i], roomPrice[i], roomDescription[i]);
		}
	} else {
		await roomDB.insertRoom(hotelID, roomName, roomPrice, roomDescription);
	}
	res.redirect('/');
}));

app.get('/rows', asyncHandler(async (req, res) => res.json(await hotelDB.all())));

// Rute pentru gestionarea contului utilizatorului și rezervărilor
app.get('/account', checkAuthenticated, asyncHandler(async (req, res) => {
	const user = await userDB.getUserByEmail(req.session.passport.user);
	// Filtrare hoteluri în funcție de proprietarul acestora
	let hotels = (await hotelDB.all()).filter(h => h.owner == user.id);
	// Determinarea rezervărilor în funcție de tipul utilizatorului
	let reservations = hotels.length
		? await reservationDB.getByOwner(user.id)
		: await reservationDB.getByUser(user.id);
	res.render('account', { user, hotels, reservations, favorites: [] });
}));

// Rute pentru anularea rezervărilor și actualizarea parolelor
app.post('/cancelReservation', checkAuthenticated, asyncHandler(async (req, res) => {
	await reservationDB.deleteReservation(req.body.reservationId);
	res.redirect('/account');
}));

app.post('/updatePassword', checkAuthenticated, asyncHandler(async (req, res) => {
	const { newPassword, confirmPassword } = req.body;
	// Verificare corespondență parolă
	if (newPassword !== confirmPassword) {
		req.flash('error', 'Passwords do not match.');
		return res.redirect('/account');
	}
	const user = await userDB.getUserByEmail(req.session.passport.user);
	const hashedPassword = await bcrypt.hash(newPassword, 10);
	await query('UPDATE user SET password = ? WHERE id = ?', [hashedPassword, user.id]);
	req.flash('success', 'Password updated successfully.');
	res.redirect('/account');
}));

// Rute pentru inserarea recenziilor
app.post('/submitReview', checkAuthenticated, asyncHandler(async (req, res) => {
	await require('./reviews-database').insertReview(req.session.passport.user, req.body.hotelId, req.body.reviewText);
	res.redirect('back');
}));

// Rute pentru mesaje între utilizatori
app.get('/messages', checkAuthenticated, asyncHandler(async (req, res) => {
	const user = await userDB.getUserByEmail(req.session.passport.user);
	const messages = await messagesDB.getMessagesForUser(user.id);
	// Renderizarea paginii de mesaje cu mesajele primite
	res.render('messages', { user, messages });
}));

app.post('/messages', checkAuthenticated, asyncHandler(async (req, res) => {
	const { receiverEmail, content } = req.body;
	if (!receiverEmail || !content) {
		req.flash('error', 'Email destinatar și conținutul mesajului sunt necesare.');
		return res.redirect('/messages');
	}
	const sender = await userDB.getUserByEmail(req.session.passport.user);
	const receiver = await userDB.getUserByEmail(receiverEmail);
	if (!receiver) {
		req.flash('error', 'Utilizatorul destinatar nu există.');
		return res.redirect('/messages');
	}
	await messagesDB.sendMessage(sender.id, receiver.id, content);
	req.flash('success', 'Mesaj trimis cu succes.');
	if (req.xhr) return res.json({ success: true, message: 'Mesaj trimis cu succes.' });
	res.redirect('/messages');
}));

// Helper pentru rute: verifică dacă utilizatorul este autentificat
const checkAuthenticated = (req, res, next) => req.isAuthenticated() ? next() : res.redirect('/login');
// Helper: dacă utilizatorul este autentificat, redirecționează spre pagină principală
const checkNotAuthenticated = (req, res, next) => req.isAuthenticated() ? res.redirect('/') : next();
// Helper: dacă este autentificat, deautentifică și redirecționează la homepage
const checkNotAuthenticatedAndLogout = (req, res, next) => {
	if (req.isAuthenticated()) { req.logout(); return res.redirect('/'); }
	next();
};

app.listen(3000); // Pornirea serverului pe portul 3000