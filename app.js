const express = require('express');
const router = express.Router();
const app = express();
const mongoose = require('mongoose');
const expressEjsLayout = require('express-ejs-layouts');
const flash = require('connect-flash');
const passport = require('passport');
const fs = require('fs');
User = require("./models/user");


//using the dotenv library for reading env files
require('dotenv').config();

//importing the passport config
require("./config/passport")(passport);

//this code was for testing security features of mongodb
//to use this code you must update the mongod.conf file
// mongoose.connect('mongodb://default:password@localhost:21101/test?', {
//   ssl: true,
//   sslCert: fs.readFileSync('/etc/ssl/mongodb-cert.crt'),
//   sslKey: fs.readFileSync('/etc/ssl/mongodb.pem'),
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   sslValidate: false
// })

mongoose.connect('mongodb://localhost/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('connected,'))
  .catch((err) => console.log(err + ' thrown error'));

//CSS linking
app.use(express.static(__dirname + '/public'));

//EJS
app.set('view engine', 'ejs');
app.use(expressEjsLayout);

//BodyParser
app.use(express.urlencoded({
  extended: false
}));


// PASSPORT CONFIGURATION
app.use(require("express-session")({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    SameSite: 'strict',
  }
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//flashing a message to the screen upon sucessful register
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});
app.use(flash());

//Routes
app.use('/admin', require('./routes/admin'));
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/profile', require('./routes/profile'));


app.listen(3000);
