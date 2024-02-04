"use strict";

var express = require('express');

var passport = require('passport');

var LocalStrategy = require('passport-local').Strategy;

var session = require('express-session');

var app = express(); // Use middleware to parse incoming request bodies

app.use(express.urlencoded({
  extended: true
})); // Set up session management

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
})); // Initialize Passport and restore authentication state from the session

app.use(passport.initialize());
app.use(passport.session()); // In-memory database (replace this with a real database in a production environment)

var users = [{
  id: 1,
  username: 'teacher',
  password: 'teacherpassword',
  role: 'teacher'
}, {
  id: 2,
  username: 'student',
  password: 'studentpassword',
  role: 'student'
}]; // Serialize user information to store in the session

passport.serializeUser(function (user, done) {
  done(null, user.id);
}); // Deserialize user information from the session

passport.deserializeUser(function (id, done) {
  var user = users.find(function (u) {
    return u.id === id;
  });
  done(null, user);
}); // Set up local strategy for username/password authentication

passport.use(new LocalStrategy(function (username, password, done) {
  var user = users.find(function (u) {
    return u.username === username && u.password === password;
  });

  if (!user) {
    return done(null, false, {
      message: 'Incorrect username or password.'
    });
  }

  return done(null, user);
})); // Define routes
// Login page

app.get('/login', function (req, res) {
  res.sendFile(__dirname + '/login.html');
}); // Process login form

app.post('/login', passport.authenticate('local', {
  failureRedirect: '/login'
}), function (req, res) {
  // Redirect based on user role
  if (req.user.role === 'teacher') {
    res.redirect('/teacher');
  } else if (req.user.role === 'student') {
    res.redirect('/student');
  }
}); // Teacher page

app.get('/teacher', isAuthenticated('teacher'), function (req, res) {
  res.send('Welcome, Teacher!');
}); // Student page

app.get('/student', isAuthenticated('student'), function (req, res) {
  res.send('Welcome, Student!');
}); // Logout

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
}); // Middleware to check if user is authenticated and has the correct role

function isAuthenticated(role) {
  return function (req, res, next) {
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    }

    res.redirect('/');
  };
} // Start the server


var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log("Server is running on http://localhost:".concat(PORT));
});
//# sourceMappingURL=app.dev.js.map
