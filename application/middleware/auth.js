const path = require('path');
const {getMessageToUser}=require("../middleware/messages");
const {getListingsByUser}=require("../middleware/listings");

module.exports={
    isLoggedIn: function(req,res,next){
        if(req.isAuthenticated()){
            next();
          }else{
            req.session.save(function(err){
              if(err) next(err);
              res.redirect('/#login');
            });
        }
    },
    checkNotAuthenticated: function (req, res, next) {
        if(req.isAuthenticated()){
            res.redirect('/dashboard')
        }
        next()
    
    }
};