var database=require('../conf/database');
module.exports={
    getMessageToUser:  function(req, res, next) {
        var ID=req.user.Id;
        var query= " SELECT *,Messages.dateCreated AS messageDate,Messages.Id AS messageID FROM Messages INNER JOIN Listings ON fk_ListingID=Listings.Id INNER JOIN user ON fk_SenderID=user.Id WHERE Listings.fk_UserID= ?";
        database.query(query,[ID],(err, result) => {
            if (err) {
              //handle error
              next(err);
            } else {
              //handle success
              req.messagesToUser = result;
              next();
            }
        });
    }

};