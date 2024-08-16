const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
var database = require('../conf/database');
const passport = require('passport')

// Serialize user to session
passport.serializeUser((user, done) => {
    console.log('Inside Serialize User');
    console.log(user)
    console.log(user.Id)
    done(null, user.Id); // assuming user.id is the correct field
});

// Deserialize user from session
passport.deserializeUser((id, done) => {
    console.log('Inside Deserialize User');
    console.log(`Deserializing User ID: ${id}`);
    try {
        var query = 'SELECT * FROM user WHERE Id = ?';
        database.query(query, [id], (err, results) => {
            if (err) return done(err);
            if (!results) return done(new Error("User not found"));
            const user = results[0];
            done(null, user);
        });
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport.use(new localStrategy({ usernameField: 'email' }, (email, password, done) => {
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    try {
        var query = 'SELECT * FROM user WHERE email = ?';
        database.query(query, [email], async (err, results) => {
            if (err) return done(err);
            if (!results.length || !await bcrypt.compare(password, results[0].password)) {
                return done(null, false, { message: 'Email or Password is incorrect' });
            } else {
                const user = results[0];
                return done(null, user);
            }
        });
    } catch (error) {
        done(error, null);
    }
}));
