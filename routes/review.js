const Listing = require("../models/listing");
const Review = require("../models/review");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError"); 
const {reviewSchema} = require("../schema");
const express = require("express");
const { ModifiedPathsSnapshot } = require("mongoose");
const { isLoggedIn, isAuthor} = require("../middleware");
const router = express.Router({mergeParams : true});
const reviewController = require("../controllers/reviewControllers");



const validatereview = (req,res,next) =>{
    
    let {error} = reviewSchema.validate(
        req.body );
    
    
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}


//-------------------------------- Review Post Route-------------------------------------

router.post("/:id/review", validatereview, wrapAsync(reviewController.post));



//-------------------------------- Review Delete Route-------------------------------------

router.delete("/:id/reviews/:reviewId" ,isLoggedIn,isAuthor, wrapAsync( reviewController.destroy));


module.exports = router;