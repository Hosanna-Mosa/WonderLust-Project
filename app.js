if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const Review = require("./models/review");
const path = require("path");
const methodOverride = require("method-override");
const engine = require('ejs-mate');
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError"); 
const {listingSchema,reviewSchema} = require("./schema");
const listingsRoute = require("./routes/listing");
const reviewsRoute = require("./routes/review");
const userRoute = require("./routes/users");
const session = require("express-session");
var MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user");
const { error } = require('console');
 

dbUrl = process.env.ATLASDB_URL;




//-----------------------------DataBase Connection---------------------------------

main().then(() =>{
    console.log("The DataBase Connected Successfully!!");
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

//----------------------------------------------------------------------------------



app.set("view engine" , "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', engine);
app.use(express.static(path.join(__dirname,"/public")));


const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto : {
        secret : process.env.SECRET,
    },
    touchAfter : 24 * 3600,
});

store.on("error" , () =>{
    console.log("Erro in Mongo Session Store",err);
    
});

const sessionOpions = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized: true,
    cookie : {
        expires:Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000
    }
}



app.use(session(sessionOpions));
app.use(flash());



app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/demo", async (req,res) =>{
    let demo = new User({
        email : "demo@gmail.com",
        username : "demo1",
    });

    let result = await User.register(demo,"demo123");
    console.log(result);
    res.send(result);
    
});

app.use((req,res,next) =>{
    res.locals.success = req.flash("sucess");
    res.locals.error = req.flash("error");
    res.locals.currRes = req.user;
    next();
});




app.use("/listings",listingsRoute);
app.use("/listings/:id/reviews",reviewsRoute);
app.use("/",userRoute);








//------------------------------Default Route-----------------------------------------
app.get("/" , (req,res) =>{
    res.send("i am root");
});


app.all("*" , (req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
});




app.use((err,req,res,next)=>{
    let {statusCode = 500,message = "Something went wrong"} = err;
    console.log(err);
    
    res.status(statusCode).render("Error.ejs",{message});
});

app.listen(8080, (req,res) =>{
    console.log("Sever is listening to Port 8080");
});