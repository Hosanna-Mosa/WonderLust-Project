if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const Listing = require("../models/listing");
const Review = require("../models/review");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError"); 
const {listingSchema} = require("../schema");
const express = require("express");
const { ModifiedPathsSnapshot } = require("mongoose");
const router = express.Router({mergeParams : true});
const {isLoggedIn, isOwner} = require("../middleware");
const listingController = require("../controllers/listingControllers");
const multer  = require('multer')
const {storage} = require("../cloudConfig");
const upload = multer({storage});

const validatelisting = (req,res,next) =>{
    
    let {error} = listingSchema.validate(req.body);
    
    
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
    
        
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}


//----------------------------------Index Route---------------------------------

router.get("/" , wrapAsync(listingController.index));

//------------------------------- New Route---------------------------------------

router.get("/new" ,isLoggedIn, listingController.newForm);

router.post("/new" ,isLoggedIn,upload.single('listing[image]') ,validatelisting,wrapAsync( listingController.new));

//-------------------------------- Read Route(show)-------------------------------

router.get("/:id" ,wrapAsync(listingController.show));


//-------------------------------- Edit And Update Route-------------------------------------

router.get("/:id/edit" ,isLoggedIn, isOwner, wrapAsync( listingController.editForm));


router.put("/:id",upload.single('listing[image]') ,validatelisting,wrapAsync(listingController.edit ));


//-------------------------------- Delete Route-------------------------------------

router.delete("/:id" , isLoggedIn , isOwner ,wrapAsync(listingController.destroy ));

module.exports = router;
