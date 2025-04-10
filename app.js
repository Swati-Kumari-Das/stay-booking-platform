if (process.env.NODE_ENV!="production") {
    require("dotenv").config();
}
require('dotenv').config();
// console.log(process.env.secret);

const express=require("express");
const app=express();
const mongoose= require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate =require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js")


const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";


main()
   .then(() =>{
    console.log("connected to DB");

   })
   .catch((err)=>{
    console.log(err);
   });
async function main() {
    await mongoose.connect(MONGO_URL);
    
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"))
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const sessionOptions={
    secret: "mysupersecretcode",
    resave:false,
    saveUninitialized: true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly:true,  //use for security purpose use for cross scripting attacks

    },
};

// app.get("/",(req,res)=>{
//     res.send("hi I am root");
// });

app.use(session(sessionOptions));
app.use(flash());
//flash use pehle than routes

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());  //stores the info related to user
passport.deserializeUser(User.deserializeUser());  //remove the info related to user
 
//middleware
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    // console.log(res.locals.success);
    res.locals.currUser=req.user;
    next();
});

// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"student@gmail.com",
//         username:"delta-student"
//     });
//     let registeredUser =await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// });


app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


// //index route
// app.get("/listings",wrapAsync(async(req,res)=>{
//     const allListings= await Listing.find({});
//     res.render("listings/index.ejs",{allListings});

    
// }));
// //new route 
// app.get("/listings/new",(req,res)=>{
//     res.render("listings/new.ejs")
// });

// //show route 
// app.get("/listings/:id",
//     wrapAsync(async(req,res)=>{
//     let {id}=req.params;
//     const listing =await Listing.findById(id).populate("reviews");
//     res.render("listings/show.ejs",{listing})
// }));







// app.get("/testListing",async(req,res)=>{
//     let sampleListing=new Listing({
//      title:"My New Villa",
//      description:"By the beach",
//      price:1200,
//      location: "Calcangute,Goa",
//      country: "India",
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing")
// });
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
});
app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something Went Wrong!"}=err;
    res.status(statusCode).render("error.ejs",{message});
    // res.render("error.ejs",{message});
    // res.status(statusCode).send(message);
});

app.listen(8080,()=>{
    console.log("Server is listening to port 8080");
});