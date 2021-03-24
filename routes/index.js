const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth.js");
const user = require('../models/user.js');

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

	// 

});

router.post('/dashboard', ensureAuthenticated, (req, res) => {
    var inLink = req.body.url;
	var inTitle = req.body.title;
	// User.findById(req.user._id, function(err, user){
	// 	if(err){
	// 		console.log(err)
	// 	}else{
	// 		console.log(user.links)
	// 	}
	// });

	User.findById(req.user._id, function(err, user){
		if(err){
			console.log(err)
		}else{
			// $push: {urls: { title: inTitle, url: inLink};
			if(inTitle == null || inLink == null){
				
			}
			else{
				user.urls.push({title:inTitle, url: inLink});
				user.save();
			}
		}
	});

	User.findById(userID, function(err, user){
		if(err){
			console.log(err)
		}else{
			// $push: {urls: { title: inTitle, url: inLink};
			if(inTitle == null || inLink == null){
				
			}
			else{
				console.log("fuckmecunt")
				user.urls.pull({title:inTitle, url: inLink});
				user.save();
			}
		}
	});

	console.log(inLink);

	console.log(req.user._id);

	console.log("test")
	res.redirect('/dashboard');




});


// var test = document.getElementById('jeff');
// test.onclick = deleteEntry();

function deleteEntry(){
	console.log("cunt");
	//req.user._id.urls.splice(index,1);
};	


module.exports = router;
