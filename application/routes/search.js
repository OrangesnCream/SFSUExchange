// search.js
const express = require("express");
const router = express.Router();
const { searchListings,recentListings } = require("../middleware/listings");

router.get("/", recentListings,searchListings, (req, res) => {
  const searchResultSize = Object.keys(req.searchResult).length;

  res.render("pages/search", {
    searchResult: req.searchResult,
    searchResultSize: searchResultSize,
    recentListings:req.recentListings
  });
});

module.exports = router;