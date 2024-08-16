const express = require('express');
const router = express.Router();
const { recentListings,makeThumbnail } = require('../middleware/listings');
const { isLoggedIn } = require('../middleware/auth');

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
router.get('/createlisting', isLoggedIn, (req, res) => {
    res.render('pages/createlisting');
});
const upload = multer({ storage: storage });
router.post('/createlisting/create', upload.single("uploadImage"), makeThumbnail,function(req,res,next) {
    var {title,description,category,flexRadioDefault,price}=req.body;
    var{path,thumbnail}=req.file;

    if(path==''){
      path="assets/User/Images/FullSize/600x400.png";
      thumbnail="assets/User/Images/Thumbnails/300x300.png";
    }
    //var{userId}=req.session.user;
    var barter =true;
    if(flexRadioDefault=='price'){
        barter=false;
    }
    var categoryNumber=0;
    if(category=='electronics'){
      categoryNumber=1;
    }else if(category=='furniture'){
      categoryNumber=2;
    }else if (category=='textbooks'){
      categoryNumber=3;
    }
    var query='';
    if(barter==true){
     //add sessions later 
      query= `INSERT INTO Listings (title,Description,image,thumbnail,fk_UserId,fk_categoryID,barter,offers) VALUE (?,?,?,?,?,?,?,?);`;
    }else{
      if(typeof price != 'number'){
        price=0.0;
      }
       query= `INSERT INTO Listings (title,Description,image,thumbnail,fk_UserId,fk_categoryID,barter,price) VALUE (?,?,?,?,?,?,?,?);`;
    }
    database.query(query, [title, description, path, thumbnail,req.user.Id,categoryNumber,barter,price], (err, result) => {
        if (err) {

          next(err);
        }
        return res.redirect(`/index`);
        next();
    });

});
router.get('/details',  (req, res) => {
    //individual listing page
    res.render('pages/productdetails');
});
router.post('/delete/:id',  (req, res,next) => {
  const id = req.params.id;
  //individual listing page
  var query= `DELETE FROM Listings WHERE (Id = ?);`;
  database.query(query, [id], (err, result) => {
    if (err) {

      next(err);
    }
    return  res.redirect('/dashboard');
    next();
});
 
});
router.get('/:id', (req, res, next) => {
    const id = req.params.id;

    // query to fetch the product details
    var query = 'SELECT * FROM Listings WHERE Id = ?';

    database.query(query, [id], (err, result) => {
        if (err) {
            next(err);
        }
        if(!result[0]){
          req.flash("error",`Post does not exist`);
          res.redirect('/');
        }
        console.log(result[0]);
        res.render('pages/productdetails', { listing: result[0] });
    });
});
module.exports = router;
