var Campground = require("../models/campgrounds");
var Comment = require("../models/comment");
//All the middleware goes here
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = (req, res, next) =>{
	if(req.isAuthenticated()){
		Campground.findById(req.params.id, (err, foundCampground) =>{
			if(err || !foundCampground){
				req.flash("error", "Acampamento não encontrado!");
				res.redirect("back");
			} else {
				//Does user own the campground
				if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
					next();
				} else {
					req.flash("error", "Você não tem permissão para fazer isso!");
					res.redirect("back");
				}
			}
		});
	} else {
		req.flash("error", "Você precisa estar logado.");
		res.redirect("back");
	}
}

middlewareObj.checkCommentOwnership = (req, res, next) => {
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, (err, foundComment) =>{
			if(err || !foundComment){
				req.flash("error", "Comentário inexistente!");
				res.redirect("back");
			} else {
				//Does user own the comment?
				if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){	//Mongooseid need equals
					next();
				} else {
					req.flash("error", "Você não tem permissão!");
					res.redirect("back");
				}
			}
		});
	} else {
		req.flash("error", "Você precisa estar logado!");
		res.redirect("back");
	}
}

middlewareObj.isLoggedIn = (req, res, next) => {
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "Você precisa estar logado!");
	res.redirect("/login");
}

module.exports = middlewareObj;