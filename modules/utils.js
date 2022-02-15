/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////       DEVELOPER       //////////////////////////////////////////////////////////////////////
////////////////////////////////////////      Vlad Kucher      //////////////////////////////////////////////////////////////////////
////////////////////////////////////////    vk.com/c_o_d_e_r   //////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var moment = require("moment");

/* ------------------------------------------------------------------------------------------------------ */

function getCounts(obj) {
  return {
    countProducts:
      obj.products.length > 0
        ? obj.products.reduce(function (sum, current) {
            return sum + Number(current.count);
          }, 0)
        : 0,
    //countFavourites: obj.favourites ? obj.favourites.count : 0,
    //countComparison: obj.comparison ? obj.comparison.count : 0,
  };
}

/* ------------------------------------------------------------------------------------------------------ */

function get_category(link) {
  let item = catalog.collection(link);
  return item;
}

/* ------------------------------------------------------------------------------------------------------ */

function verification(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect("/login");
}

/* ------------------------------------------------------------------------------------------------------ */

function checkSession(req, res, next) {
  if (!req.session.user) req.session.user = undefined;
  if (!req.session.products) req.session.products = [];
  //if ( !req.session.favourites ) req.session.favourites = [];
  //if ( !req.session.comparison ) req.session.comparison = [];
  if (!req.session.order) req.session.order = [];
  if (!req.session.messages) {
    req.session.messages = [];
  }
  return next();
}
/* ------------------------------------------------------------------------------------------------------ */

function checkAdmin(req, res, next) {
  if (!req.session.user) return res.redirect("/");
  if (req.session.user == undefined) return res.redirect("/");
  if (!req.session.user.admin) return res.redirect("/");
  return next();
}

/* ------------------------------------------------------------------------------------------------------ */

function date() {
  return `${moment(Date.now() + 3600000 * 3).format("DD.MM.YYYY : HH:mm:ss")}`;
}

/* ------------------------------------------------------------------------------------------------------ */

function dateMessage() {
  return `${moment(Date.now() + 3600000 * 3).format("DD.MM.YYYY : HH:mm:ss")}`;
}

/* ------------------------------------------------------------------------------------------------------ */

function spaces(string) {
  if (typeof string !== "string") string = string.toString();
  return string
    .split("")
    .reverse()
    .join("")
    .match(/[0-9]{1,3}/g)
    .join(" ")
    .split("")
    .reverse()
    .join("");
}

/* ------------------------------------------------------------------------------------------------------ */

async function updatesCatalog() {
  let arr = await catalog.collection("child_furniture").find().toArray();

  for (i = 0; i < arr.length; i++) {
    if (!Number.isInteger(arr[i].price)) {
      let price = arr[i].price_text.replace("₽", "").replace(/\s+/g, "").trim();
      console.log(Number(price));
      catalog.collection("child_furniture").findOneAndUpdate(
        { id: arr[i].id },
        {
          $set: { price: Number(price) },
        }
      );
    }
  }
}

/* ------------------------------------------------------------------------------------------------------ */

function rand(min, max) {
  return Math.round(Math.random() * (max - min)) + min;
}

/* ------------------------------------------------------------------------------------------------------ */

module.exports = {
  getCounts,
  get_category,
  verification,
  checkSession,
  checkAdmin,
  date,
  spaces,
  updatesCatalog,
  dateMessage,
  rand,
};
