const express = require("express"),
  fs = require("fs"),
  path = require("path"),
  router = express.Router(),
  multer = require("multer"),
  upload = multer();

const {
  getCounts,
  get_category,
  verification,
  checkSession,
  date,
  spaces,
} = require("../modules/utils.js");

/* ------------------------------------------------------------------------------------------------------ */

router.get("/contacts", checkSession, async function (req, res) {
  let user = req.session.user;
  res.render("contacts", { user: user, counts: getCounts(req.session) });
});

/* ------------------------------------------------------------------------------------------------------ */

router.get("/about-shops", checkSession, async function (req, res) {
  let user = req.session.user;
  res.render("about", { user: user, counts: getCounts(req.session) });
});

/* ------------------------------------------------------------------------------------------------------ */

router.get("/comments", checkSession, async function (req, res) {
  let user = req.session.user;
  res.render("comments", {
    user: user,
    counts: getCounts(req.session),
    comments: await comments.find().toArray(),
  });
});

/* ------------------------------------------------------------------------------------------------------ */

module.exports = router;
