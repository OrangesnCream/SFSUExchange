// about.js
const express = require("express");
const router = express.Router();

// route handler for /about
router.get("/", function (req, res) {
  res.render("pages/about/about");
});

// route handler for /about subpages
router.get("/:name", function (req, res) {
  const aboutPage = req.params.name;
  res.render(`pages/about/${aboutPage}`);
});

module.exports = router;