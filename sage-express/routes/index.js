const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  res.render("index", { title: "Express" });
});

router.get("/sage-express", (req, res, next) => {
  res.render("sage-express", {});
});

module.exports = router;
