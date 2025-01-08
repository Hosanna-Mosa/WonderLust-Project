const User = require("../models/user");


//------------------------- SingUp Routes -------------------------

module.exports.singupForm = (req,res) =>{
    res.render("users/singUp.ejs");
}


module.exports.singup = async (req,res) =>{
    try{
        let {username,email,password} = req.body;
        let RegisteredUser = await User.register(new User({
        username,
        email
        }),password);
        
        req.login(RegisteredUser,function (err){
            if(err){
                return next(err);
            }
            req.flash("sucess","Sucessfully Singuped !!");
            res.redirect("/listings");
        });
    }catch(e){
        req.flash("error","Usernamae Already Existed!!");
        res.redirect("/singup");
    }
}

//---------------------------- Login Routes --------------------------------------


module.exports.loginForm = (req,res) =>{
    res.render("users/login.ejs");
}


module.exports.login = (req, res) => {
    req.flash("sucess","Welcome Be To WonderLust");
   
    
    res.redirect(( res.locals.directURLTo  ? res.locals.directURLTo : "/listings" ) );
   
  }

//---------------------------- Logout Routes --------------------------------------

module.exports.logout = (req,res) =>{
    req.logout((err) =>{
        if(err){
            return next(err);
        }
        req.flash("sucess","Your are SucessFully Logoutted");
        res.redirect("/listings");
    })
}