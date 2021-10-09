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

	var embedLink = req.body.embedUrl;
	var embedTitle = req.body.embedTitle;

	User.findById(req.user._id, function(err, user) {
		if (err) {
			console.log(err);
		} else {
			if (inTitle == null || inLink == null) {

			}
			else {
				user.urls.push({ title: inTitle, url: inLink });
				user.save();
			}
		}
	});

	User.findById(req.user._id, function(err, user) {
		if (err) {
			console.log(err);
		} else {
			// $push: {urls: { title: inTitle, url: inLink};
			if (embedTitle == null || embedLink == null) {

			}
			else {
				user.embeds.push({ title: embedTitle, url: embedLink });
				user.save();
			}
		}
	});

	//deletes URLs
	User.findById(req.user._id, function(err, user) {
		if (err) {
			console.log(err);
		}
	}).updateOne(
		{},
		{ $pull: { urls: { _id: req.body.linkId } } }
	);

	//DELETES: Embeds
	User.findById(req.user._id, function(err, user) {
		if (err) {
			console.log(err);
		}
	}).updateOne(
		{},
		{ $pull: { embeds: { _id: req.body.embID } } }
	);

	res.redirect('/dashboard');
});

router.post('/moveElement', ensureAuthenticated, (req, res) => {
	const username = req.body.username;
	let top = req.body.top;
	let left = req.body.left;
	let elementId = req.body.elementId;

	User.findOne({ username: username }).exec(function(err, user) {
		if (!user) {
			req.flash('error', 'that user does not exsist');
			return res.redirect('/');
		}
		//for here i need to find a way to specify if what was moved was an embed or a url to
		//search the correct array, also this stuff kinda seems like it is slow so maybe a faster way
		//would be better

		for (var i = 0; i < user.urls.length; i++) {
			if (user.urls[i]._id == elementId) {
				user.urls[i].top = top;
				user.urls[i].left = left;
				user.urls[i].position = "absolute";
			}
		}

		for (var i = 0; i < user.embeds.length; i++) {
			if (user.embeds[i]._id == elementId) {
				user.embeds[i].top = top;
				user.embeds[i].left = left;
				user.embeds[i].position = "absolute";
			}
		}
		user.save();
	});
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

			if (user == 0) {
				//checking which values were found in the database to print the error in order to see if search bar is catching data
				errors.push({ msg: 'Username Not Found.. :(' });
				res.render('searchUser', {
					errors
				});

			} else {
				for (var i = 0; i < user.length; i++) {
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

function deleteEntry() {
	//req.user._id.urls.splice(index,1);
};



module.exports = router;
