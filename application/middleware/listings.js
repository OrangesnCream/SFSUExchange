/*
listings.js
Description: This middleware handles the database queries related to listings. 
It provides functions to search listings and to retrieve the most recent listings.
Credits: Luis, Vianna
*/
var fs = require('fs');
var sharp = require('sharp');//for thumbnail generation


var database =require('../conf/database');//loads database connections
module.exports={//module exports makes whatever is in the brackets an output other files can use 
    searchListings: function search(req, res, next) {
        const urlParams = new URLSearchParams(req.query);//extracts search parameters from page URL
      
        var category = urlParams.get("category");
        var searchTerm = urlParams.get("searchInput");
        console.log(category);

        let query =
          "SELECT *,Listings.Id as ListID FROM  Listings INNER JOIN Category ON fk_categoryID=Category.Id where Listings.approved=true";

        const queryParams = [];//stores parameters that will be passed to query function 

        if (category == "ALL " || category == "All") {
          //sets category to empty if the category is all 
          //the code below will search all entries instead of searching for entries with the category ALL
          category = "";
        }
      
        if (searchTerm != "" && category != "") {
          //if both category and search are not empty then search all listings that have that category and that match the search
          query = `SELECT *,Listings.Id as ListID FROM Listings INNER JOIN Category ON fk_categoryID=Category.Id WHERE Category.name = ? AND ( title LIKE ? OR description LIKE ? )and  Listings.approved=true`;
          queryParams.push(category);//parameters are added seperately to protect from sql injections
          queryParams.push(`%${searchTerm}%`);
          queryParams.push(`%${searchTerm}%`);
        } else if (searchTerm != "" && category == "") {
          //if category is empty but search is not then search all listings and return the ones that match the search term
          query = `SELECT *,Listings.Id as ListID FROM Listings INNER JOIN Category ON fk_categoryID=Category.Id WHERE (title LIKE ? OR description LIKE ?) and  Listings.approved=true`;
          queryParams.push(`%${searchTerm}%`);
          queryParams.push(`%${searchTerm}%`);
        } else if (searchTerm == "" && category != "") {
          //if search is empty but category is not then return all listings in that category 
          query = `SELECT *,Listings.Id as ListID FROM Listings INNER JOIN Category ON fk_categoryID=Category.Id WHERE Category.name = ? and  Listings.approved=true`;
          queryParams.push(category);
        }
        //finally send the query we just built to the database
        database.query(query, queryParams, (err, result) => {
          if (err) {
            req.searchResult = "";
            req.searchTerm = "";
            req.category = "";
            next();
          }
          req.searchResult = result;
          console.log(result);

          //returning our result with this value
          req.searchTerm = searchTerm;
          req.category = "";
          next();
        });
    },
    recentListings: function (req, res, next){
      //my sql code that sorts the listings by dateCreated
      database.query("SELECT *,Listings.Id as ListID FROM Listings INNER JOIN Category ON fk_categoryID=Category.Id WHERE Listings.approved=true ORDER BY dateCreated DESC LIMIT 8", (err, result) => {
        if (err) {
          //handle error
          next(err);
        } else {
          //handle success
          req.recentListings = result;
          next();
        }
      });
    },
    makeThumbnail:  function(req, res, next) {
      if (!req.file) {
        
          next(new Error('File upload failed'));
      } else {
          try {
              var destinationOfThumbnail = `assets/User/Images/Thumbnails-${req.file.filename.split(".")[0]}.png`;
              sharp(req.file.path)
                  .resize(300, 300) // Resize the image to 300x300 pixels
                  .toBuffer((err, buffer) => {
                      if (err) throw err;
                      fs.writeFileSync(destinationOfThumbnail, buffer);
                      req.file.thumbnail = destinationOfThumbnail;
                      next();
                  });
          } catch (error) {
              next(error);
          }
      }
  },
  getListingsByUser:  function(req, res, next) {
    var ID=req.user.Id;
        var query= " SELECT * FROM Listings WHERE fk_UserID=?";
        database.query(query,[ID],(err, result) => {
            if (err) {
              //handle error
              next(err);
            } else {
              //handle success
              req.listingsByUser = result;
              next();
            }
        });
  }

  
    
    
}