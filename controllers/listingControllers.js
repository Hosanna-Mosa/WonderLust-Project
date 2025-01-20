const { model } = require("mongoose");
const Listing = require("../models/listing");
const Review = require("../models/review");
const axios = require('axios');
const Booking = require('../models/booking');


//----------------------------------Index Route---------------------------------

module.exports.index = async (req,res) =>{
    let dataBs = await Listing.find({});


    res.render("listings/index.ejs",{dataBs});
}

//------------------------------- New Route---------------------------------------


module.exports.newForm = (req,res)=>{
    
    res.render("listings/newe.ejs");
}


module.exports.new = async (req,res)=>{
    
    let path = req.file.path;
    let filename = req.file.filename;


    
    const newData = new Listing(req.body.listing);
    newData.owner = req.user._id;
    newData.image.url = path;
    newData.image.filename = filename;
    await newData.save();
    req.flash('sucess', 'New List Added!');
    res.redirect("/listings");
}

//-------------------------------- Read Route(show)-------------------------------

module.exports.show = async (req,res) =>{

    let {id} = req.params;
    const dataOfId = await Listing.findById(id).populate({path :"reviews" , populate : { path : "author"}}).populate("owner");
    
    if(!dataOfId){
        req.flash('error', 'The Not Found Your Request!!');
        res.redirect("/listings");
    }
    
    const location = dataOfId.location;
   
    
      try {
        const response = await axios.get(
          `https://us1.locationiq.com/v1/search.php?key=${process.env.LOCATIONIQ_API_KEY}&q=${encodeURIComponent(location)}&format=json`);
         
        const data = response.data;
       
        
        if (data.length > 0) {

          const coordinates = data[0];
          let lat = coordinates.lat;
          let lon = coordinates.lon;  
            

          res.render("listings/showe.ejs",{dataOfId , lat , lon});
        } else{
             res.render("listings/showe.ejs",{dataOfId , lat : null , lon : null});
        }
      } catch (error) {
        
        let lat = null;
        let lon = null;
        res.render("listings/showe.ejs",{dataOfId , lat , lon});
      }
    
      
      

      
    
}

//-------------------------------- Edit And Update Route-------------------------------------

module.exports.editForm = async (req,res) =>{
    let {id} = req.params;
    
    const data = await Listing.findById(id);
    if(!data){
        req.flash('error', 'The Not Found Your Request!!');
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{data});
}




module.exports.edit = async (req,res)=>{
    const {id} = req.params;


    let {title,description,image,price,location,country} = req.body.listing;
    
    
    let newListing = await Listing.findByIdAndUpdate(id,{
        title : title,
        description :description,
        image : image,
        price : price,
        location : location,
        country : country
    });

    if(typeof(req.file) !== "undefined"){
        let path = req.file.path;
        let filename = req.file.filename;
        newListing.image.url = path;
        newListing.image.filename = filename;
        await newListing.save();
    }
    

    req.flash('sucess', 'List Edited!');
    res.redirect(`/listings/${id}`);
}

//-------------------------------- Delete Route-------------------------------------

module.exports.destroy = async (req,res) =>{
    const {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('sucess', 'List Deleted!');
    res.redirect("/listings");
}

//-------------------------------- Search Route-------------------------------------

module.exports.searching = async (req ,res) => {
    let { query } = req.query;
    query = query.trim();
    try {
        const allListings = await Listing.find({
              $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { location: { $regex: query, $options: 'i' } },
                    { country: { $regex: query, $options: 'i' } },
              ]
        });
        allListings.forEach(listing => {
              listing.formattedPrice = listing.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
        });
        res.render("listings/search.ejs" , {allListings , query});
  } catch (err) {
        console.error("Error in search:", err);
        res.status(500).send('Server Error');
  }
};

//-------------------------------- Booking Route-------------------------------------

module.exports.BookingListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/booking', { listing, bookingConfirmed: false });
};

//-------------------------------- Booked Route-------------------------------------

module.exports.BookedListing = async (req, res) => {
    const { checkInDate, checkOutDate, numberOfGuests, paymentMethod } = req.body;
    const listingId = req.params.id;
    const userId = req.user ? req.user._id : null;
    const listing = await Listing.findById(listingId);
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (checkIn >= checkOut) {
          req.flash("error", `Check-out date must be after check-in date.`);
          return res.render('listings/booking', { listing, bookingConfirmed: false });
    }
    function calculateTotalPrice(checkIn, checkOut, numberOfGuests) {
          const dailyRate = listing.price;
          const timeDifference = checkOut - checkIn;
          const days = Math.ceil(timeDifference / (1000 * 3600 * 24));
          return (dailyRate *(18/100)) * days * numberOfGuests;
    }
    const existingBooking = await Booking.findOne({listingId,$or: [
                { checkInDate: { $lt: checkOut, $gte: checkIn } },
                { checkOutDate: { $gt: checkIn, $lte: checkOut } },
                { checkInDate: { $lte: checkIn }, checkOutDate: { $gte: checkOut } }
          ]
    });
    if (existingBooking) {
          req.flash("error", `This listing is already booked from ${existingBooking.checkInDate.toDateString()} to ${existingBooking.checkOutDate.toDateString()}. Please choose dates after ${existingBooking.checkOutDate.toDateString()}.`);
          return res.render('listings/booking', { listing, bookingConfirmed: false });
    }
    const booking = new Booking({
          listingId,
          userId,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          numberOfGuests,
          paymentMethod,
          totalPrice: calculateTotalPrice(checkIn, checkOut, numberOfGuests)
    });
    await booking.save();
    const confirmationData = {
          listing: {
                title: listing.title
          },
          checkInDate: booking.checkInDate.toISOString().split('T')[0],
          checkOutDate: booking.checkOutDate.toISOString().split('T')[0],
          numberOfGuests: booking.numberOfGuests,
          paymentMethod: booking.paymentMethod,
          totalPrice: booking.totalPrice
    };
    res.render('listings/booked', confirmationData);
};