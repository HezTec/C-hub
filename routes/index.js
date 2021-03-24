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
		//This finds the user through case insenstive search, but doesnt change the link
		User.find({ username: new RegExp(username ,'i')}).exec((err, user) => {
		console.log(username);
		console.log(user);
	
		if (user == 0) {
			//checking which values were found in the database to print the error in order to see if search bar is catching data
			errors.push({ msg: 'Username Not Found.. :(' });
			console.log("Username Not Found!");
			res.render('searchUser', {
				errors
			});

		} else {
			for (var i = 0; i < user.length; i++) {
				console.log("Username Found!");
				return res.render('searchUser', {
					errors,
					user, username
				});
			}
		}
	});
	}
});

module.exports = router;
