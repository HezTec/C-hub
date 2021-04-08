const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth.js");
const User = require("../models/user.js");

router.get('/', (req, res) => {
	//sending data to tell if the user is logged in
	res.render('welcome', { auth_info: req.isAuthenticated() });
});

router.get('/register', (req, res) => {
	res.render('register');
});

router.get('/dashboard', ensureAuthenticated, (req, res) => {
	res.render('dashboard', {
		user: req.user
	});
});

router.post('/dashboard', ensureAuthenticated, (req, res) => {
	var inLink = req.body.url;
	var inTitle = req.body.title;

	//finds the users list of url and adds the new link to it
	User.findById(req.user._id, function(err, user) {
		if (err) {
			console.log(err)
		} else {
			if (inTitle == null || inLink == null) {

			} else {
				user.urls.push({ title: inTitle, url: inLink });
				user.save();
			}
		}
	});

	res.redirect('/dashboard');

});

//Search for user
router.post('/search', (req, res) => {
	const { username } = req.body;
	let errors = [];

	if (errors.length > 0) {
		res.render('dashboard', {
			errors: errors,
			username: username,
		});

	} else {
		//This finds the user through case insenstive search, but doesnt change the link
		User.find({ username: new RegExp(username, 'i') }).exec((err, user) => {
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

//the custom middleware that checks if user is an admin
var requiresAdmin = function() {
	return [
		ensureAuthenticated,
		function(req, res, next) {
			if (req.user && req.user.admin === true) {
				next();
			} else {//if the user isnt an admin redirect to another page
				res.status(401).send('Unauthorized');
			}
		}
	]
};
//making all admin routes check to see if the user is an admin
router.all('/admin', requiresAdmin());
router.all('/admin/*', requiresAdmin());

module.exports = router;
