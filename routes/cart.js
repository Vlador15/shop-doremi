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

const limit_product = 200;

/* ------------------------------------------------------------------------------------------------------ */

router.get("/cart", checkSession, async function (req, res) {
  let user = req.session.user;

  async function getSessionProducts(session) {
    let cart = [];
    for (let i = 0; i < session.length; i++) {
      let item = session[i];
      cart.push({
        product: await catalog
          .collection(item.link)
          .findOne({ id: Number(item.product_id) }),
        count: item.count,
        comment: item.comment,
      });
    }
    return cart;
  }

  //console.log(req.session)
  res.render("cart", {
    user: user,
    counts: getCounts(req.session),
    products: await getSessionProducts(req.session.products),
  });
});

/* ------------------------------------------------------------------------------------------------------ */

router.post("/cart/add", checkSession, async function (req, res) {
  let item = await catalog
    .collection(req.body.link)
    .findOne({ id: Number(req.body.product_id) });
  let product = req.session.products.find(
    (a) => a.product_id == Number(req.body.product_id)
  );
  let quantity = Number(req.body.quantity);
  let comment = req.body.comment;

  if (
    quantity == undefined ||
    quantity < 1 ||
    quantity == null ||
    !Number(quantity)
  )
    quantity = 1;
  //console.log(req.session.products)

  if (product) {
    product.count =
      quantity < limit_product && product.count < limit_product
        ? Number(quantity) + Number(product.count)
        : limit_product;
    product.comment = comment != "undefined" ? comment : "";
  } else {
    req.session.products.push({
      product_id: item.id,
      link: item.link,
      count: quantity < limit_product ? quantity : limit_product,
      comment: comment != "undefined" ? comment : "",
      price: item.price,
    });
  }

  item.countProducts = req.session.products.reduce(function (sum, current) {
    return sum + Number(current.count);
  }, 0);
  res.send(item);
});

/* ------------------------------------------------------------------------------------------------------ */

router.post(
  "/cart/update",
  checkSession,
  upload.array(),
  async function (req, res) {
    let obj = JSON.parse(JSON.stringify(req.body));

    if (!Array.isArray(obj.product_id)) {
      let id = obj.product_id,
        comment = obj.comment != "" ? obj.comment : "",
        quantity = obj.quantity.replace(/[A-Za-zА-Яа-яЁё]/, ""),
        product = req.session.products.find((a) => a.product_id == id);

      if (!Number(quantity) || quantity == undefined || quantity == null)
        quantity = 1;
      if (quantity > limit_product || product.count > limit_product)
        quantity = limit_product;

      product.comment = comment != "undefined" ? comment : "";
      product.count = quantity > 0 ? quantity : 1;
    } else {
      for (i = 0; i < obj.product_id.length; i++) {
        let id = obj.product_id[i],
          comment = obj.comment[i],
          quantity = obj.quantity[i].replace(/[A-Za-zА-Яа-яЁё]/, ""),
          product = req.session.products.find((a) => a.product_id == id);

        if (!Number(quantity) || quantity == undefined || quantity == null)
          quantity = 1;
        if (quantity > limit_product || product.count > limit_product)
          quantity = limit_product;

        product.comment = comment != "undefined" ? comment : "";
        product.count = quantity > 0 ? quantity : 1;
      }
    }
    res.redirect("/cart");
  }
);

/* ------------------------------------------------------------------------------------------------------ */

router.get("/cart/delete/:link/:id", checkSession, async function (req, res) {
  let params = req.params;

  req.session.products.map((item, index) => {
    if (item.product_id == params.id) {
      req.session.products.splice(index, 1);
      console.log("Удаление");
    }
  });

  res.redirect("/cart");
});

/* ------------------------------------------------------------------------------------------------------ */

module.exports = router;
