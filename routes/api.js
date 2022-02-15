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
  checkAdmin,
  date,
  spaces,
} = require("../modules/utils.js");
const config = require(".././base/config.json");

const url = config.domen;

/* ------------------------------------------------------------------------------------------------------ */

router.post(
  "/api/promocode",
  checkSession,
  upload.array(),
  async function (req, res) {
    let user = req.session.user,
      inputCode = req.body.code,
      userData = await users.findOne({ phone: user.phone });
    promocode = await promocodes.findOne({ code: inputCode });

    if (userData != undefined && promocode != undefined) {
      if (promocode.status) {
        await users.findOneAndUpdate(
          { phone: user.phone },
          {
            $set: { points: Number(userData.points + promocode.points) },
          }
        );

        await promocodes.findOneAndUpdate(
          { code: inputCode },
          {
            $set: { status: false },
          }
        );
      }
    }
    //res.redirect("/my-account");
    return res.send({ promocode, user: user, counts: getCounts(req.session) });
  }
);

/* ------------------------------------------------------------------------------------------------------ */

function rand(min, max) {
  return Math.round(Math.random() * (max - min)) + min;
}

/* ------------------------------------------------------------------------------------------------------ */

module.exports = router;
