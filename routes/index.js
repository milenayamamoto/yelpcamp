var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campgrounds");

//Root route
router.get("/", (req,res) =>{
	res.render("landing");
});

//Show register form
router.get("/register", (req, res) => {
	res.render("register", {page: "register"});
});

//Handle Sign Up logic
router.post("/register", (req, res) =>{

	var newUser = new User({
		username: req.body.username, 
		firstName: req.body.firstName, 
		lastName: req.body.lastName,
		email: req.body.email,
		avatar: req.body.avatar
	});
	
	//Check if user is registered as admin
	if(req.body.adminCode === process.env.ADMINCODE) {
		newUser.isAdmin = true;
		req.flash("success", "Cadastrado como admin! ");
	} else if (req.body.adminCode && req.body.adminCode !== process.env.ADMINCODE) {
		req.flash("error", "Seu código admin está errado! ");
	}
	User.register(newUser, req.body.password, (err, user) =>{
		if(err){
			req.flash("error", err.message);
			return res.redirect("/register");
		}
		passport.authenticate("local")(req, res, ()=>{
			req.flash("success", "Bem-vindo ao AcampAki, " + user.username);
			res.redirect("/campgrounds");
		});
	});
});

//Show login form
router.get("/login", (req, res) =>{
	res.render("login", {page: "login"});
});

//Handling login logic
router.post("/login", passport.authenticate("local", 
	{
	successRedirect: "/campgrounds",
	failureRedirect: "/login",
	failureFlash: true,
	successFlash: "Bem-vindo novamente!" 
	}), (req, res) =>{
});

//Logout route
router.get("/logout", (req, res) =>{
	req.logout();
	req.flash("success", "Você foi deslogado com sucesso, esperamos te ver novamente!");
	res.redirect("/campgrounds");
});

//USER PROFILE
router.get("/users/:id", (req, res) => {
	User.findById(req.params.id, (err, foundUser) => {
		if(err) {
			req.flash("error", "Alguma coisa deu errado!");
			req.redirect("/");
		}
		Campground.find().where("author.id").equals(foundUser._id).exec((err, campgrounds) =>{
			if(err){
				req.flash("error", "Alguma coisa deu errado!");
				req.redirect("/");
			}	
			res.render("users/show", {user: foundUser, campgrounds: campgrounds});
		});	
	});
});

module.exports = router;