const express = require('express');
const router = express.Router();
const app = express();
const mongoose = require('mongoose');
const expressEjsLayout = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');

//importing the passport config
require("./config/passport")(passport);

//mongoose
//may need to configure the mongodb, unsure if this will work on a hosted server
mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('connected,,'))
  .catch((err) => console.log(err + ' thrown error'));


//CSS linking 
app.use(express.static(__dirname + '/public'));

//EJS
app.set('view engine', 'ejs');
app.use(expressEjsLayout);

//BodyParser
app.use(express.urlencoded({ extended: false }));

//express session code
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

//flashing a message to the screen upon sucessful register
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

//Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));


app.listen(3000);
