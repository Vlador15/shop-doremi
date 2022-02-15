const express = require("express"),
  fs = require("fs"),
  path = require("path"),
  multer = require("multer"),
  upload = multer(),
  router = express.Router();

const {
  getCounts,
  get_category,
  verification,
  checkSession,
  date,
  spaces,
} = require("../modules/utils.js");
const config = require(".././base/config.json");

/* ------------------------------------------------------------------------------------------------------ */

router.get("/catalog/:category", async function (req, res) {
  let user = req.session.user;
  let query = req.query;
  console.log("================================================= CATALOG");
  if (req.params.category) {
    var category = get_category(req.params.category);

    if (category) {
      let sort = query.sort,
        order = query.order,
        q = {};

      if (sort != undefined && order != undefined) {
        if (order == "ASC") {
          q[sort] = 1;

          var arr_products = await category.find().sort(q).toArray();
          console.log(arr_products[0].name);
          return res.render("catalog", {
            products: arr_products,
            title: arr_products[0].name,
            link: await arr_products[0].link,
            query: query,
            user: user,
            counts: getCounts(req.session),
          });
        }
        if (order == "DESC") {
          q[sort] = -1;
          var arr_products = await category.find().sort(q).toArray();
          return res.render("catalog", {
            products: arr_products,
            title: arr_products[0].name,
            link: await arr_products[0].link,
            query: query,
            user: user,
            counts: getCounts(req.session),
          });
        }
      }
      var arr_products = await category.find().toArray();

      return res.render("catalog", {
        products: arr_products,
        title: arr_products[0].name,
        link: await arr_products[0].link,
        query: query,
        user: user,
        counts: getCounts(req.session),
      });
    }
  } else {
    return res.redirect("/");
  }
});

/* ------------------------------------------------------------------------------------------------------ */

router.get("/catalog/:category/:id", async function (req, res) {
  let user = req.session.user;

  let id = req.params.id;
  let qCategory = req.params.category;

  if (id != undefined && qCategory != undefined) {
    let category = get_category(qCategory);
    if (category) {
      let product = await category.findOne({ id: Number(id) });
      if (product)
        return res.render("view", {
          product: product,
          link: product.link,
          user: user,
          counts: getCounts(req.session),
        });
      res.redirect("/");
    }
  }
  res.redirect("/");
});

/* ------------------------------------------------------------------------------------------------------ */

var arr_catalog = config.catalog;

/*
router.post("/search", checkSession, upload.array(), async function(req, res){   
	let user = req.session.user; 

	let obj = JSON.parse(JSON.stringify(req.body)),
		query = obj.search;
 
	console.log(query)
	if ( !query.length ) {
		return res.render("search", { product: undefined, user: user, counts: getCounts(req.session), query: undefined }); 
	} else {
 
		let allArr = [];
		for ( let i = 0; i < arr_catalog.length; i++ ) { 
 
			let results = await catalog.collection(arr_catalog[i].file).find({$text: {$search: query}}).limit(70).toArray();
		 
			for ( let x=0; x<results.length; x++ ) {
				if (results[x] != undefined) {
					allArr.push(results[x]);
				} 
			}
		} 

		return res.render("search", { products: allArr, user: user, counts: getCounts(req.session), query: query }); 
	}

	return res.redirect("/"); 
}); */

router.post("/search", checkSession, upload.array(), async function (req, res) {
  let user = req.session.user;
  let obj = JSON.parse(JSON.stringify(req.body)),
    query = obj.search;

  if (!query.length || query == "") {
    return res.redirect("/");
  }

  return res.render("search", {
    user: user,
    counts: getCounts(req.session),
    query: query,
    lengthCatalog: arr_catalog.length,
  });
});

router.post(
  "/api/search",
  checkSession,
  upload.array(),
  async function (req, res) {
    let user = req.session.user;

    let obj = JSON.parse(JSON.stringify(req.body)),
      query = obj.search,
      categoryId = obj.category;

    if (!query.length || query == "") {
      return res.send({
        product: undefined,
        user: user,
        counts: getCounts(req.session),
        query: undefined,
      });
    } else {
      let allArr = [];

      await catalog
        .collection(arr_catalog[categoryId].file)
        .createIndex({ "$**": "text" });

      let results = await catalog
        .collection(arr_catalog[categoryId].file)
        .find({ $text: { $search: query } })
        .limit(120)
        .toArray();

      for (let x = 0; x < results.length; x++) {
        if (results[x] != undefined) {
          allArr.push(results[x]);
        }
      }

      let last = false;
      if (categoryId == arr_catalog.length - 1) {
        last = true;
      }
      return res.send({
        products: allArr,
        user: user,
        counts: getCounts(req.session),
        query: query,
        last,
      });
    }

    return res.redirect("/");
  }
);
/* ------------------------------------------------------------------------------------------------------ */

module.exports = router;
