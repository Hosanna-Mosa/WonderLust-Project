const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const review = new Schema({
    comment : String,
    rating : {
        type : String,
    },
    dateAt : {
        type : Date,
        default : Date.now()
    },
    author : {
        type : Schema.Types.ObjectId,
        ref : "User"
    }
});

const Review = mongoose.model("Review",review);

module.exports = Review;