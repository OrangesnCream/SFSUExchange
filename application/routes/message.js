const express = require('express');
const router = express.Router();
const { recentListings,makeThumbnail } = require('../middleware/listings');

var multer= require('multer');
var database =require('../conf/database');
const listings = require('../middleware/listings');
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

//creates messages
router.post('/create/:id',upload.single(), async (req, res,next) =>{
  console.log(req.session.user);
  var ID=req.user.Id;
  var postId=req.params.id;
  var{messageText,messageEmail,messageSub}=req.body;
  var message="[Contact:"+messageEmail+"]\n [Subject:"+messageSub+"]\n          "+messageText;
  var query= `INSERT INTO Messages (fk_ListingID,fk_SenderID,text) VALUE (?,?,?);`;
  database.query(query, [postId,ID,message], (err, result) => {
    if (err) {

      next(err);
    }

    res.redirect('/listing/'+postId);
    next();
  });

});
module.exports = router;


  