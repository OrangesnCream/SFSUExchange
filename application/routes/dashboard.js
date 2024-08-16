//dashboard.js
const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware/auth");

var multer= require('multer');
var database =require('../conf/database');
const {getMessageToUser}=require("../middleware/messages");
const {getListingsByUser}=require("../middleware/listings");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "assets/User/Images/FullSize")
  },
  filename: function (req, file, cb) {
    var fileExt= file.mimetype.split("/")[1];
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `${file.fieldname}-${uniqueSuffix}.${fileExt}`);
  }
});

const upload = multer({ storage: storage });



router.get("/",upload.single(), getMessageToUser,getListingsByUser, function (req, res) {
  var message ={};
  if(req.messagesToUser){
    message=req.messagesToUser;
  }
  var listing ={};
  if(req.listingsByUser){
    listing=req.listingsByUser;
  }
  console.log(req.listingsByUser);
  res.render("pages/dashboard",{name : req.user.email,messages:message, listings:listing});
});

module.exports = router;