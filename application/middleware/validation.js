var validator=require('validator');
var db=require('../conf/database');
module.exports={
    passwordCheck: function(req, res, next) {
        var { password } = req.body;
        // checks the length of the password and if it is less than 8 characters, it will flash an error
        if (!validator.isLength(password, { min: 8 })) {
            req.flash("error", "Password should be at least 8 characters long");
        }
        if (req.session && req.session.flash && req.session.flash.error) {
            res.redirect('/register');
        } else {
            next();
        }
    },
    emailCheck: function(req, res, next) {
        var { Email } = req.body;
        Email = Email.trim();
        // check if the email is not a valid email or doesn't end with '@sfsu.edu'
        if (!validator.isEmail(Email) || !Email.endsWith('@sfsu.edu')) {
            req.flash("error", `${Email} is not a valid SFSU Email`);
        }
        if (req.session && req.session.flash && req.session.flash.error) {
            res.redirect('/register');
        } else {
            next();
        }
    },
    tosCheck: function(req,res,next){},
    isEmailUnique:async function(req,res,next){
        var {Email}=req.body;
    try {
            db.query(`select Id from user where email=?;`,[Email],(err, result) => {
                if (err) {
                  next(err);
                }
                //finds ammount of users with the same email
                const emailCopyCount= Object.keys(result).length;
                if(emailCopyCount>0){
                    req.flash("error",`${Email}is already taken`);
                    return req.session.save(function(err){
                        return res.redirect('/register');
                    });
                }else{
                    next();
                }
                
              });
        } catch (error) {
            next(error);
        }
    }
}