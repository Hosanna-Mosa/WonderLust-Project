const Listing = require("./models/listing");
const Review = require("./models/review");

module.exports.isLoggedIn = (req,res,next) =>{
    
    if(!req.isAuthenticated()){
        req.session.directURL= req.originalUrl;
        req.flash("error","You must be Login"
        );
        return res.redirect("/login");
    }
    next();
};

module.exports.directURL = (req,res,next) =>{
    res.locals.directURLTo = req.session.directURL;;
    next();
};


module.exports.isOwner = async (req,res,next) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!res.locals.currRes._id.equals(listing.owner._id)){
        req.flash("error","You are not owner to this listing");
        return res.redirect(`/listings/${id}`);

    }
    next();
}

module.exports.isAuthor = async (req,res,next) =>{
    const {id,reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!( res.locals.currRes && review.author._id.equals(res.locals.currRes._id))){
        req.flash("error","You unable to delete Review");
        res.redirect(`/listings/${id}`);
    } 
    
    next();
}