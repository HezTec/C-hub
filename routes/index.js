const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth.js");
const User = require("../models/user.js");

//login page
router.get('/', (req, res) => {
	res.render('welcome');
});

router.get('/register', (req, res) => {
	res.render('register');
});

router.get('/dashboard', ensureAuthenticated, (req, res) => {
	res.render('dashboard', {
		user: req.user
	});
});

//Search for user
router.post('/dashboard', (req, res) => {
	const { username } = req.body;
	let errors = [];

	if (errors.length > 0) {
		res.render('dashboard', {
			errors: errors,
			username: username,
		});

	} else {

	User.find({ username: username }).exec((err, user) => {
		if (user.length > 0) {
			//checking which values were found in the database to print the error in order to see if search bar is catching data
			for (var i = 0; i < user.length; i++) {
				if (user[i].username == username) {
					errors.push({ msg: 'Username Found! :)' });
					console.log("Username Found!");
				} 
				if (user[i].username !== username ) {
					errors.push({ msg: 'Username Not Found.. :(' });
					console.log("Username Not Found!");
				}
			}
			res.render('searchUser', {
				errors,
				username
			});
		}
	});
	}
});


module.exports = router;
