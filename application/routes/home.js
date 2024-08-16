// home.js
const express = require('express');
const router = express.Router();
const { recentListings,makeThumbnail } = require('../middleware/listings');
const { passwordCheck,emailCheck, isEmailUnique} = require('../middleware/validation');
var bcrypt = require('bcrypt');

const passport = require('passport')
require('../middleware/passportConfig')




var multer= require('multer');
var database =require('../conf/database');
//storage for full sized images 
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
// landing page/home page
router.get('/',recentListings, (req, res) => {
    res.render('pages/index',{recentListings:req.recentListings});
});

router.get('/index', recentListings, (req, res) => {
    res.render('pages/index',{recentListings:req.recentListings});
});


router.get('/register',  (req, res) => {
  res.render('pages/register');
});

router.post('/register/create',  upload.single(),passwordCheck,emailCheck,isEmailUnique,async (req, res,next) => {
  console.log(req.body);
  var {Email,password}=req.body;

  try {
      var hashedPassword = await bcrypt.hash(password, 8);

      var query=`INSERT INTO user (email, password) value (?,?);`;


      database.query(query, [Email,hashedPassword], (err, result) => {
        if (err) {
          req.flash("error", `${Email} failed to register`);
          return req.session.save(function(err) {
              console.log(err);
              return res.redirect('/register');
          });
        }
        req.flash("success", `Account created`);
          return req.session.save(function(err) {
              return res.redirect("/");
          });
        next();
      });
  } catch (error) {
      next(error);
  }
  
});

router.post('/login',upload.single(),
 passport.authenticate("local",{
  successRedirect: '/dashboard',
  failureRedirect: '/index#login',
  failureFlash: true
}),
(req,res)=>{
  res.sendStatus(200);
});

router.post('/logout',upload.single(), recentListings,(req, res, next) =>{
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  //res.render('pages/index',{recentListings:req.recentListings});
});
})


router.get('/login/status',(req,res)=>{
  if(req.user) return res.send(req.user);
  return res.sendStatus(401)
});

module.exports = router;