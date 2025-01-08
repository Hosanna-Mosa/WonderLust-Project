const Listing = require("../models/listing");
const Review = require("../models/review");


//-------------------------------- Review Post Route-------------------------------------

module.exports.post = async (req,res) =>{
    // let RatingklValue = parseInt(req.body.ratingNumber);
    let listing = await Listing.findById(req.params.id);
    let {review} = req.body;
    let review1 = new Review(
    {rating : review.rating , comment : review.comment}
    );
    review1.author = req.user._id;

    await review1.save();
    listing.reviews.push(review1);
    await listing.save();
    
    
    
    req.flash('sucess', 'Review Added!');
    res.redirect(`/listings/${req.params.id}`);
}

//-------------------------------- Review Delete Route-------------------------------------


module.exports.destroy = async (req,res) =>{
    
    const {id,reviewId} = req.params;
    
    await Review.findByIdAndDelete(reviewId);
    await Listing.findByIdAndUpdate(id,{$pull : {reviews : reviewId}});
    
    req.flash('sucess', 'Review Deleted!');
    res.redirect(`/listings/${id}`);

}