/*
app.js
Description: Our main back end file that handles routing and the webserver
it also passes database information from the middleware to the back end 
credits: Gurvir, Luis
*/


require("dotenv").config();//loads the .env config file
const express = require("express");
const app = express();//web server
const flash = require('express-flash');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const connection = require('./conf/database')
const sessionStore = new MySQLStore({}/* session store options */, connection);
const auth = require('./middleware/auth');
const passport = require('passport')


app.use(express.static(__dirname));//allows us to use locations in the application folder
app.use("/assets", express.static("assets"));

app.use(flash());


// set the view engine to ejs
app.set("view engine", "ejs");

//set up for session
app.use(session({
  secret: "test",
  store: sessionStore,
  saveUninitialized: false,
  resave: false,
  cookie:{
    maxAge: 60000 *10000 //10000 minutes
  }
}));

app.use(passport.initialize());
app.use(passport.session());

//app.use(auth.injectAuthStatus);
app.use(function(req,res,next){
  res.locals.isAuthenticated =  req.isAuthenticated();
  
  console.log(res.locals.isAuthenticated)
  console.log(req.session);
  if(req.session.user){
    res.locals.isLoggedIn = true;
    res.locals.user = req.session.user;
    
  }else{
    
  }
  next();
});

const homeRouter = require('./routes/home');
const listingRouter = require('./routes/listing');
const messageRouter= require('./routes/message');
const aboutRouter = require('./routes/about');
const searchRouter = require('./routes/search');
const dashboardRouter = require('./routes/dashboard');



app.use('/', homeRouter);
app.use('/listing', listingRouter);
app.use('/about', aboutRouter);
app.use('/search', searchRouter);
app.use('/dashboard', dashboardRouter);
app.use('/message',messageRouter);




//this sets up which port the application listens for all the routing request 
app.set("port", process.env.PORT || 3000);
app.listen(app.get("port"), () => {
  console.log(`Express server listening on port ${app.get("port")}`);
});
