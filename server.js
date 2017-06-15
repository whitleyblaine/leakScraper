// Express is the de facto standard server framework for Node.js.
var express = require('express');
// Express is a module that can be used to create multiple applications. Here I am creating one application.
var app = express();

// Body-parser parses the HTTP request body, allowing you to access req.body from within your routes, and use that data for example to create a user in a database.
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

// Node.js path module is used for handling and transforming file paths.
var path = require('path');

// Handlebars view engine for express.
var exphbs = require('express-handlebars');

// Mongoose is an object data modeling (ODM) library that provides a rigorous modeling environment for your data, enforcing structure as needed while still maintaining the flexibility that makes MongoDB powerful.
var mongoose = require('mongoose');

// Passport is authentication middleware for Node.js. Extremely flexible and modular, Passport can be unobtrusively dropped in to any Express-based web application.
var passport = require('passport');

// Username and password authentication strategy for Passport
var LocalStrategy = require('passport-local').Strategy;

// Express validation middleware
var expressValidator = require('express-validator');

// Flash message middleware for Connect and Express.
var flash = require('connect-flash');

// Connect mongoose to your database, either locally or on heroku
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leakscraper');
var db = mongoose.connection;

// Log error message if there is a problem connecting to the database
db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});

// once logged in to the db through mongoose, log a success message
db.once('open', function() {
  console.log('Mongoose connection successful.');
});

// Set express view engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

// Set up body parser & cookie parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Set folder for serving your static files (html, css, JS, images, etc)
app.use(express.static(path.join(__dirname, 'public')));

// Express Session https://stormpath.com/blog/everything-you-ever-wanted-to-know-about-node-dot-js-sessions
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Set up flash messages
app.use(flash());
app.use(function(req, res, next){
    res.locals.success = req.flash('success');
    res.locals.errors = req.flash('error');
    next();
});

// initialize passport
app.use(passport.initialize());
app.use(passport.session());


// Express Validator
// The errorFormatter option can be used to specify a function that must build the error objects used in the validation result returned by req.getValidationResult().
// It should return an Object that has param, msg, and value keys defined.

// In this example, the formParam value is going to get morphed into form body format useful for printing.

app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

// Express Session
// A session store is a provision for storing session data in the backend. Sessions based on session stores can store a large amount of data that is well hidden from the user. 
// The session middleware provides a way for creating sessions using session stores. Like cookieSession, the session middleware is dependent on the cookieParser middleware for creating a signed HttpOnly cookie.

app.use(session({
    // This is the secret used to sign the session ID cookie. This can be either a string for a single secret, or an array of multiple secrets. If an array of secrets is provided, only the first element will be used to sign the session ID cookie, while all the elements will be considered when verifying the signature in requests.
    secret: 'this is my secret',
    // Forces a session that is "uninitialized" to be saved to the store. A session is uninitialized when it is new but not modified. Choosing false is useful for implementing login sessions, reducing server storage usage, or complying with laws that require permission before setting a cookie. Choosing false will also help with race conditions where a client makes multiple parallel requests without a session.
    saveUninitialized: false,
    resave: true
}));

// Routes
// Routing refers to determining how an application responds to a client request to a particular endpoint, which is a URI (or path) and a specific HTTP request method (GET, POST, and so on).
var routes = require('./routes/index');
var users = require('./routes/users');
app.use('/', routes);
app.use('/', users);

app.listen(process.env.PORT || 3000);