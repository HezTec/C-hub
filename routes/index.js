const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth.js");
const User = require("../models/user.js");

//login page

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
	// User.findById(req.user._id, function(err, user){
	// 	if(err){
	// 		console.log(err)
	// 	}else{
	// 		console.log(user.links)
	// 	}
	// });

	User.findById(req.user._id, function(err, user) {
		if (err) {
			console.log(err)
		} else {
			// $push: {urls: { title: inTitle, url: inLink};
			if (inTitle == null || inLink == null) {

			}
			else {
				user.urls.push({ title: inTitle, url: inLink });
				user.save();
			}
		}
	});
	// User.findById(req.user._id, function(err, user) {
	// 	if (err) {
	// 		console.log(err)
	// 	} else {
	// 		// $push: {urls: { title: inTitle, url: inLink};
	// 		if (inTitle == null || inLink == null) {

	// 		}
	// 		else {
	// 			user.embeds.push({ url: embedLink });
	// 			user.save();
	// 		}
	// 	}
	// });

	User.findById(req.user._id, function(err,user){
		if(err){
			console.log(err)
		}else{
			// $push: {urls: { title: inTitle, url: inLink};
			if(inTitle == null || inLink == null){
				
			}
			else{
				user.urls.pull({title:inTitle, url: inLink});
				user.save();
			}
		}
	}).updateOne(
		{},
		{$push: {embeds: {title: embedTitle, url: embedLink}}}
	);

	// User.findById(req.user._id, function(err, user) {
	// 	if (err) {
	// 		console.log(err)
	// 	} else {
	// 		// $push: {urls: { title: inTitle, url: inLink};
	// 		if (inTitle == null || inLink == null) {

	// 		}
	// 		else {
	// 			user.urls.pull({ _id: req.body.linkId });
	// 			console.log("link removed");
	// 			user.save();
	// 		}
	// 	}
	// });

	console.log(req.body.linkId);

	User.findById(req.user._id, function(err,user){
		if(err){
			console.log(err)
		}
	}).updateOne(
		{},
		{$pull: {urls: {_id: req.body.linkId}}}
	);

	res.redirect('/dashboard');
});

//Search for user
router.post('/searchUser', (req, res) => {
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

module.exports = router;
