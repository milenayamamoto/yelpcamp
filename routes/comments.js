var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campgrounds");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//Comments new
router.get("/new", middleware.isLoggedIn, (req, res) => {
	//Find campground by id
	Campground.findById(req.params.id, (err, campground) => {
		if(err){
			console.log(err);
		} else {
			res.render("comments/new", {campground: campground});
		}
	});
});

//Comments Create
router.post("/", middleware.isLoggedIn, (req, res) => {
	//Lookup campground using ID
	Campground.findById(req.params.id, (err, campground) => {
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			Comment.create(req.body.comment, (err, comment) =>{
				if(err){
					req.flash("error", "Alguma coisa deu errado!");
					console.log(err);
				} else{
					//Add username and id to comment 
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					//Save comment
					comment.save();
					campground.comments.push(comment);
					campground.save();
					console.log(comment);
					req.flash("success", "Comentário adicionado com sucesso!");
					res.redirect("/campgrounds/" + campground._id);
				}
			});
		}
	});
});

//COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) =>{
	Campground.findById(req.params.id, (err, foundCampground) =>{
		if(err || !foundCampground){
			req.flash("error", "Nenhum acampamento foi encontrado!");
			return res.redirect("back");
		}
		Comment.findById(req.params.comment_id, (err, foundComment) => {
			if(err){
				res.redirect("back");
			} else {
				res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
			}
		});
	});
});

//COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) =>{
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) =>{
		if(err){
			res.redirect("back");
		} else{
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

//COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) =>{
	// Comment.findByIdAndRemove(req.params.comment_id, (err) =>{
	// 	if(err){
	// 		res.redirect("back");
	// 	} else {
	// 		req.flash("success", "Comentário excluído com sucesso!");
	// 		res.redirect("/campgrounds/" + req.params.id);
	// 	}
	// });

	Comment.findByIdAndRemove(req.params.comment_id, (err) => {
		if (err) {
			req.flash("error", "Problemas em deletar o comentário!");
			console.log(err);
			res.redirect("back");
		} else {
			//remove comment id from campgrounds db
			Campground.findByIdAndUpdate(req.params.id, {
				$pull: { comments: req.params.comment_id }
			}, (err, data) => {
				if (err) {
					req.flash("error", "Problemas em deletar o comentário!");
					console.log(err);
				} else {
					req.flash("success", "Comentário excluído com sucesso!");
					res.redirect("/campgrounds/" + req.params.id);
				}
			});
		};
	});



});

module.exports = router;