const mongoose = require("mongoose");
var Campground = require("./models/campgrounds");
var Comment = require("./models/comment");

var data = [
	{
		name: "Cloud's Rest", 
		image: "https://cdn.pixabay.com/photo/2016/02/18/22/16/tent-1208201_1280.jpg",
		description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris ante nulla, eleifend vel quam nec, luctus porttitor sem. In hac habitasse platea dictumst. Nulla euismod massa malesuada, feugiat mauris nec, pretium mauris. Mauris orci tortor, suscipit eget dolor id, rhoncus iaculis magna. Aliquam arcu massa, iaculis id urna et, placerat consequat magna. Etiam ac lectus nec leo hendrerit tempor eget vel ligula. Suspendisse nisl dui, varius eu nulla in, pellentesque pulvinar eros. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce sed augue feugiat, tristique mauris at, lobortis purus."
	},
	{
		name: "Desert Mesa", 
		image: "https://cdn.pixabay.com/photo/2016/11/21/16/03/campfire-1846142_1280.jpg",
		description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris ante nulla, eleifend vel quam nec, luctus porttitor sem. In hac habitasse platea dictumst. Nulla euismod massa malesuada, feugiat mauris nec, pretium mauris. Mauris orci tortor, suscipit eget dolor id, rhoncus iaculis magna. Aliquam arcu massa, iaculis id urna et, placerat consequat magna. Etiam ac lectus nec leo hendrerit tempor eget vel ligula. Suspendisse nisl dui, varius eu nulla in, pellentesque pulvinar eros. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce sed augue feugiat, tristique mauris at, lobortis purus."
	},
	{
		name: "Canyon Floor", 
		image: "https://cdn.pixabay.com/photo/2016/01/19/16/48/teepee-1149402_1280.jpg",
		description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris ante nulla, eleifend vel quam nec, luctus porttitor sem. In hac habitasse platea dictumst. Nulla euismod massa malesuada, feugiat mauris nec, pretium mauris. Mauris orci tortor, suscipit eget dolor id, rhoncus iaculis magna. Aliquam arcu massa, iaculis id urna et, placerat consequat magna. Etiam ac lectus nec leo hendrerit tempor eget vel ligula. Suspendisse nisl dui, varius eu nulla in, pellentesque pulvinar eros. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce sed augue feugiat, tristique mauris at, lobortis purus."
	}
]

function seedDB(){
	//Remove all campgrounds
	Campground.remove({}, (err) => {
		if(err){
			console.log(err);
		}
		console.log("Removed campgrounds!");
		//Add a few campgrounds
		data.forEach((seed) => {
			Campground.create(seed, (err, campground) => {
				if(err){
					console.log(err);
				} else {
					console.log("Added a campground!");
					//Create a comment
					Comment.create(
						{
							text: "This place is great, but I wish there was internet.",
							author: "Homer"
						}, (err, comment) => {
							if(err){
								console.log(err);
							} else {
								campground.comments.push(comment);
								campground.save();	
								console.log("Created new comment!");
							}
						});
				}		
			});
		});
	});	
}

module.exports = seedDB;