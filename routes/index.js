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

	//if the the user sent an empty packet to the backend just do nothing else
	//do everything as normal
	if (req.body.editData.length <= 0) {
		res.redirect('/dashboard');
	} else {

		//creating the json object of data to edit in the db
		let editArray = (JSON.parse(req.body.editData))

		insertIntoDB(editArray).then(setTimeout(() => {
			res.redirect('/dashboard')
		}, 5000));

		/**
		takes the data parameter full of json objects executes all the indicated database alterations
		@async
		@param data {array} an array of json objects
		*/
		async function insertIntoDB(data) {
			data.forEach(item => {

				var inLink = item.url;
				var inTitle = item.title;

				var embedLink = item.embedUrl;
				var embedTitle = item.embedTitle;

				/*
				if the current json object's action is set to save, execute actions that
				saves data to the database
				*/
				if (item.action == 'save') {
					User.findById(req.user._id, function(err, user) {
						if (err) {
							console.log(err);
						} else {
							if (inTitle == null || inLink == null || inLink == '' || inTitle == '') {

							} else {
								/*
								if the postion is set to absolute while both the top and left attribute
								are 0 then the button will move to a weird spot
								*/
								let position = 'absolute';
								if (item.top == 0 && item.left == 0) {
									position = ''
								}

								user.urls.push({
									title: inTitle,
									url: inLink,
									top: item.top,
									left: item.left,
									position: position
								});
								user.save();
							}
						}
					});

					User.findById(req.user._id, function(err, user) {
						if (err) {
							console.log(err);
						} else {
							// $push: {urls: { title: inTitle, url: inLink};
							if (embedTitle == null || embedLink == null || embedTitle == "" || embedLink == "") {

							} else {
								//if the postion is set to absolute while both the top and left attribute
								//are 0 then the button will move to a weird spot
								let position = 'absolute';
								if (item.top == 0 && item.left == 0) {
									position = ''
								}

								user.embeds.push({
									title: embedTitle,
									url: embedLink,
									top: item.top,
									left: item.left,
									position: position
								});
								user.save();
							}
						}
					});
					/*
					if the current packet has an _id in the json that means it exsists within the db
					so there must be a move change going on. the below code checks for that _id and then
					updates the db accodingly
					*/
					if (item._id != null) {
						const username = req.body.username;
						let top = item.top;
						let left = item.left;
						let elementId = item._id;

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
					}
				};
				/*
				if the current json object's action is set to delete, delete that entry
				from the database
				*/
				if (item.action == 'delete') {

					//deletes URLs
					User.findById(req.user._id, function(err, user) {
						if (err) {
							console.log(err);
						}
					}).updateOne({}, {
						$pull: {
							urls: {
								_id: item._id
							}
						}
					});

					//DELETES: Embeds
					User.findById(req.user._id, function(err, user) {
						if (err) {
							console.log(err);
						}
					}).updateOne({}, {
						$pull: {
							embeds: {
								_id: item._id
							}
						}
					});
				}

				if (item.action == 'pfpChange') {

					User.findById(req.user._id, function(err, user) {
						if (err) {
							console.log(err);
						} else {
							user.pfp = item.picture;
							user.save();
						}
					});
				}
			});
		};
	}
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

router.get('/:userProfile', function(req, res) {
	res.redirect('/profile/' + req.params.userProfile);
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
