var express = require("express");
var router = express.Router();
var Campground = require("../models/campgrounds");
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

//INDEX - Show all campgrounds
router.get("/", (req,res) =>{
	var noMatch = "";
	if(req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		//Get all campgrounds from DB
		Campground.find({name: regex}, (err, allCampgrounds) => {
			if(err){
				console.log(err);
			} else {
				if(allCampgrounds.length < 1) {
					noMatch = "No campgrounds match with that query, please try again.";
				}
				res.render("campgrounds/index", {campgrounds: allCampgrounds, page: "campgrounds", noMatch: noMatch});
			}
		});
	} else {
		//Get all campgrounds from DB
		Campground.find({}, (err, allCampgrounds) => {
			if(err){
				console.log(err);
			} else {
				res.render("campgrounds/index", {campgrounds: allCampgrounds, page: "campgrounds", noMatch: noMatch});
			}
		});
	}
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, (req, res) => {
	// get data from form and add to campgrounds array
	var name = req.body.name;
	var price = req.body.price;
	var desc = req.body.description;
	var image = req.body.image;
	var author = {
	  id: req.user._id,
	  username: req.user.username
	}
	geocoder.geocode(req.body.location, (err, data) => {
		if (err || !data.length) {
			req.flash('error', 'Invalid address');
			return res.redirect('back');
		}
		var lat = data[0].latitude;
		var lng = data[0].longitude;
		var location = data[0].formattedAddress;
		var newCampground = {name: name, price: price, image: image, description: desc, author: author, location: location, lat: lat, lng: lng};
		// Create a new campground and save to DB
		Campground.create(newCampground, (err, newlyCreated) => {
			if(err){
				console.log(err);
			} else {
				//redirect back to campgrounds page
				console.log(newlyCreated);
				req.flash("success", "Campground added successfully!");
				res.redirect("/campgrounds");
			}
		});
	});
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, (req,res) => {
	res.render("campgrounds/new");
});

//SHOW - Shows more info about one campground
router.get("/:id", (req, res) =>{
	//Find the campground with provided ID
	Campground.findById(req.params.id).populate("comments likes").exec((err, foundCampground) => {
		if(err || !foundCampground){
			req.flash("error", "Campground not found!");
			res.redirect("back");
		} else {
			console.log(foundCampground);
			//Render show template with that campground
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

//Campground LIKE Route
router.post("/:id/like", middleware.isLoggedIn, (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		if (err) {
			console.log(err);
			req.flash("error", err);
			return res.redirect("/campgrounds");
		}

		//Check if req.user._id exists in foundCampground.likes
		var foundUserLike = foundCampground.likes.some((like) => {
			return like.equals(req.user._id);
		});

		if (foundUserLike) {
		// user already liked, removing like
			foundCampground.likes.pull(req.user._id);
		} else {
			// adding the new user like
			foundCampground.likes.push(req.user);
		}

		foundCampground.save((err) => {
			if (err) {
				console.log(err);
				req.flash("error", "Problem saving the campground!");
				return res.redirect("/campgrounds");
			}
			return res.redirect("/campgrounds/" + foundCampground._id);
		});
	});
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) =>{
	Campground.findById(req.params.id, (err, foundCampground) =>{
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
	geocoder.geocode(req.body.location, (err, data) => {
		if (err || !data.length) {
			req.flash('error', 'Invalid address');
			return res.redirect('back');
		}
		req.body.campground.lat = data[0].latitude;
		req.body.campground.lng = data[0].longitude;
		req.body.campground.location = data[0].formattedAddress;
		
		
		Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, campground) => {
			if(err){
				req.flash("error", err.message);
				res.redirect("back");
			} else {
				req.flash("success","Successfully Updated!");
				res.redirect("/campgrounds/" + campground._id);
			}
		});
	});
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findByIdAndRemove(req.params.id, (err) =>{
		if(err){
			res.redirect("/campgrounds");
		} else {
			req.flash("success", "Campground deleted successfully!");
			res.redirect("/campgrounds");
		}
	});
});

//Searchbar helper
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;