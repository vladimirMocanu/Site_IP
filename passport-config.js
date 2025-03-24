// Configurare Passport pentru autentificare locală
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const initialize = (passport, getUserByEmail) => {
  // Funcția de autentificare ce verifică email-ul și parola
  const authenticateUser = async (email, password, done) => {
    try {
      const user = await getUserByEmail(email);
      if (!user) 
        return done(null, false, { message: 'No user with that email' });
      const match = await bcrypt.compare(password, user.password);
      // Returnează utilizatorul dacă parola se potrivește
      return match ? done(null, user) : done(null, false, { message: 'Password incorrect' });
    } catch (error) {
      return done(error);
    }
  };

  // Setarea strategiei Passport, definind câmpul email în loc de nume de utilizator
  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
  // Serializare pentru sesiune
  passport.serializeUser((user, done) => done(null, user.email));
  // Deserializare pentru recuperarea utilizatorului
  passport.deserializeUser(async (email, done) => {
    try {
      // Eroare intenționată: folosim getUserByMail în loc de getUserByEmail
      const user = await getUserByEmail(email);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};

module.exports = initialize;