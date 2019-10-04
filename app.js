require('dotenv').config();

const express			= require('express'),
	  app				= express(),
	  bodyParser		= require('body-parser'),
 	  mongoose 			= require("mongoose"),
	  flash 			= require("connect-flash"),
	  passport 			= require("passport"),
	  LocalStrategy 	= require("passport-local"),
	  methodOverride 	= require("method-override"),
	  Campground 		= require("./models/campgrounds"),
	  Comment			= require("./models/comment"),
	  User				= require("./models/user"),
	  seedDB			= require("./seeds")

//Requiring routes
var commentRoutes 		= require("./routes/comments"),
	campgroundRoutes 	= require("./routes/campgrounds"),
	indexRoutes 		= require("./routes/index")

mongoose.connect(process.env.DATABASEURL, { 
	useNewUrlParser: true,
	useCreateIndex: true
}).then(() => {
	console.log("Connected to DB!");
}).catch(err => {
	console.log("ERROR: ", err.message);
});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment');
// seedDB();	//Seed the DB

//PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "This is an express session!",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Adds currentUser and message to all templates
app.use((req, res, next) =>{
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

// GoormIDE
// app.listen(3000, () =>{
// 	console.log("YelpCamp server has started!");
// });

// Heroku
app.listen(process.env.PORT, process.env.IP, () =>{
	console.log("Server is running!");
});