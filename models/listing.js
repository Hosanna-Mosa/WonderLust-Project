const { ref } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const listing = new Schema({
    title : {
        type : String,
    },
    description : String,
    image : {
        url : String,
        filename : String
    },
    price : {
        type : Number,
        set : (value) => value === ""?0:value,
    },
    location : String,
    country : String,
    reviews : [{
        type : Schema.Types.ObjectId,
        ref : "Review",
    }],
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User",
    }  
});

listing.post("findOneAndDelete" , async (listing) =>{
    await Review.deleteMany({_id :  {$in : listing.reviews}});
});

const Listing = mongoose.model("Listing",listing);

module.exports = Listing;