const express = require("express"),
  fs = require("fs"),
  path = require("path"),
  router = express.Router(),
  multer = require("multer"),
  upload = multer();

const excel = require("excel4node"),
  workbook = new excel.Workbook(),
  worksheet = workbook.addWorksheet("Sheet 1"),
  style = workbook.createStyle({
    font: {
      color: "#000000",
      size: 12,
    },
    numberFormat: "###; ($#,##0.00); -",
  });

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

const statuses = {
  0: "Заказ отменен",
  1: "Заказ ожидает оплаты",
  2: "Внесен аванс",
  3: "Полная оплата",
  4: "Заказ доставлен",
};

const smile_status = {
  0: "🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫",
  1: "⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠",
  2: "🚚🚚🚚🚚🚚🚚🚚🚚🚚🚚",
  3: "✅✅✅✅✅✅✅✅✅✅",
};

const mainChat = 1;
const delivery = {
  0: "Не указано!",
  1: "Сами заберем - бесплатно",
  2: "Доставка заказа до 10 тысяч рублей по Лениногорску - 350₽",
  3: "Доставка до квартиры по Лениногорску от 10 тысяч рублей - бесплатно",
  4: "Мы с другого города - рассчитайте нам доставку",
};

router.get("/admin/save", checkSession, checkAdmin, async function (req, res) {
  let user = req.session.user;

  let usersAll = await users.find().toArray();
  usersAll.forEach((user, index) => {
    let count = index + 1;
    console.log(user.name);
    worksheet.cell(Number(count), 1).number(Number(count)).style(style);
    worksheet.cell(Number(count), 2).string(user.name).style(style);
    worksheet.cell(Number(count), 3).number(Number(user.phone)).style(style);
    worksheet.cell(Number(count), 4).number(Number(user.points)).style(style);
  });
  workbook.write("base/Users_Phone.xlsx");

  res.render("admin-save", { user: user, counts: getCounts(req.session) });
});

router.get(
  "/admin/download-phone",
  checkSession,
  checkAdmin,
  async function (req, res) {
    res.download(path.join(__dirname, "../base/Users_Phone.xlsx"), (err) => {
      if (err) console.log(err);
    });
  }
);

/* ------------------------------------------------------------------------------------------------------ */

router.get(
  "/admin/orders/delete/:id",
  checkSession,
  checkAdmin,
  async function (req, res) {
    let id_order = Number(req.params.id);

    if (!(await order.findOne({ id: id_order })))
      return res.redirect("/admin/orders");
    await order.deleteOne({ id: id_order });
    res.redirect("/admin/orders");
  }
);

/* ------------------------------------------------------------------------------------------------------ */

router.post(
  "/admin/orders/update",
  checkSession,
  checkAdmin,
  async function (req, res) {
    let status = Number(req.body.update),
      id = Number(req.body.id);

    if (typeof status != "number") return res.redirect("/admin/orders");
    if (typeof id != "number") return res.redirect("/admin/orders");
    if (!(await order.findOne({ id: id })))
      return res.redirect("/admin/orders");

    await order.findOneAndUpdate(
      { id: id },
      {
        $set: { status: status },
      }
    );
    res.redirect("/admin/orders/" + id);
  }
);

/* ------------------------------------------------------------------------------------------------------ */

router.get(
  "/admin/orders/:id",
  checkSession,
  checkAdmin,
  async function (req, res) {
    let user = req.session.user;
    let _order = await order.findOne({ id: Number(req.params.id) });

    if (!_order) return res.redirect("/admin/orders");

    res.render("admin-order-view", {
      user: user,
      counts: getCounts(req.session),
      products: await getOrderProducts(_order),
      data: _order,
    });
  }
);

/* ------------------------------------------------------------------------------------------------------ */

router.get(
  "/admin/orders",
  checkSession,
  checkAdmin,
  async function (req, res) {
    let user = req.session.user;
    res.render("admin-orders", {
      user: user,
      counts: getCounts(req.session),
      products: await getOrders(),
    });
  }
);

/* ------------------------------------------------------------------------------------------------------ */

async function getOrderProducts(_order) {
  //  запрос к базе данных с заказами и сбор в массив все заказы которые есть и вывод в таблице с статусами заказа. И также редактированием статуса заказа
  let cart = [];
  for (let i = 0; i < _order.products.length; i++) {
    let item = _order.products[i];
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

/* ------------------------------------------------------------------------------------------------------ */

async function getOrders() {
  let orders = [],
    oneOrder = [],
    allOrders = await order.find().toArray();

  //console.log(session)

  for (let i = 0; i < allOrders.length; i++) {
    let obj = allOrders[i];

    oneOrder = {
      name: obj.name,
      phone: obj.phone,
      status: obj.status, // statuses[obj.status]
      date: obj.date,
      id: obj.id,
      comment: obj.comment,
      count: obj.products.reduce(function (sum, current) {
        return sum + Number(current.count);
      }, 0),
      totalPrice: obj.products.reduce(function (sum, current) {
        return sum + Number(current.price * current.count);
      }, 0),
      delivery: delivery[obj.delivery],
      products: [],
    };

    for (j = 0; j < obj.products.length; j++) {
      let item = obj.products[j];
      oneOrder.products.push({
        product: await catalog
          .collection(item.link)
          .findOne({ id: Number(item.product_id) }),
        comment: item.comment,
        count: item.count,
      });
    }

    orders.push(oneOrder);
  }

  //console.log(orders[1].products)
  return orders;
}

/* ------------------------------------------------------------------------------------------------------ */

router.get("/admin/users", checkSession, checkAdmin, async function (req, res) {
  let user = req.session.user;
  res.render("admin-users", { user: user, counts: getCounts(req.session) });
});

/* ------------------------------------------------------------------------------------------------------ */

router.get(
  "/admin/users/:id",
  checkSession,
  checkAdmin,
  async function (req, res) {
    let user = req.session.user;
    let userView = await users.findOne({ id: Number(req.params.id) });
    if (!userView) return res.redirect("/admin/users");

    let discountSum = 5;

    switch (true) {
      case userView.points < 5000:
        discountSum = 5;
        break;
      case userView.points >= 5000 && userView.points < 10000:
        discountSum = 8;
        break;
      case userView.points >= 10000:
        discountSum = 10;
        break;
    }

    if (userView.discount != discountSum) {
      await users.findOneAndUpdate(
        { phone: user.phone },
        {
          $set: { discount: Number(discountSum) },
        }
      );
    }
    userView = await users.findOne({ id: Number(req.params.id) });
    res.render("admin-users-view", {
      user: user,
      userView,
      counts: getCounts(req.session),
    });
  }
);

/* ------------------------------------------------------------------------------------------------------ */

router.post(
  "/api/admin/users",
  checkSession,
  checkAdmin,
  upload.array(),
  async function (req, res) {
    console.log("msg");
    let user = req.session.user,
      status = true;
    obj = JSON.parse(JSON.stringify(req.body));

    let usersAll = await users
      .find()
      .skip(Number(obj.count * 10))
      .limit(10)
      .toArray();

    if (!usersAll.length) status = false;
    return res.send({
      users: usersAll,
      user: user,
      counts: getCounts(req.session),
      status,
    });
  }
);

/* ------------------------------------------------------------------------------------------------------ */

router.post(
  "/admin/users/update",
  checkSession,
  checkAdmin,
  async function (req, res) {
    let obj = req.body;
    let params = {
      id: Number(obj.id),
      name: obj.name,
      //email: obj.email,
      password: obj.password,
      phone: obj.phone,
      points: Number(obj.points),
      regDate: obj.regDate,
      referalUrl: obj.referalUrl,
      admin: Number(obj.admin),
    };

    if (!(await users.findOne({ id: Number(params.id) })))
      return res.redirect("/admin/users");
    await users.findOneAndUpdate(
      { id: Number(params.id) },
      {
        $set: params,
      }
    );
    return res.redirect("/admin/users/" + params.id);
  }
);

/* ------------------------------------------------------------------------------------------------------ */

router.get(
  "/admin/users/delete/:id",
  checkSession,
  checkAdmin,
  async function (req, res) {
    let id = req.params.id;

    if (!(await users.findOne({ id: Number(req.params.id) })))
      return res.redirect("/admin/users");
    await users.deleteOne({ id: Number(req.params.id) });

    res.redirect("/admin/users");
  }
);

/* ------------------------------------------------------------------------------------------------------ */

router.post(
  "/admin/points/update",
  checkSession,
  checkAdmin,
  async function (req, res) {
    let obj = req.body,
      userData = await users.findOne({ id: Number(obj.id) });

    if (!userData) return res.redirect("/admin/users");
    await users.findOneAndUpdate(
      { id: Number(obj.id) },
      {
        $set: {
          points: Number(userData.points + Math.floor(obj.summa_order * 0.01)),
        },

        $push: {
          logs: {
            action: "add_points",
            date: date(),
            text: `Вы получили ${Math.floor(
              obj.summa_order * 0.01
            )} баллов за покупку на сумму: ${obj.summa_order} руб.`,
          },
        },
      }
    );
    return res.redirect("/admin/users/" + obj.id);
  }
);

/* ------------------------------------------------------------------------------------------------------ */

router.post(
  "/admin/points/delete",
  checkSession,
  checkAdmin,
  async function (req, res) {
    let obj = req.body;
    let userData = await users.findOne({ id: Number(obj.id) });
    if (!userData) return res.redirect("/admin/users");
    await users.findOneAndUpdate(
      { id: Number(obj.id) },
      {
        $set: { points: Number(userData.points - obj.remove_points) },

        $push: {
          logs: {
            action: "remove_points",
            date: date(),
            text: `Вы обменяли ${obj.remove_points} баллов на скидку. Общая стоимость заказа: ${obj.summa_order} руб.`,
          },
        },
      }
    );
    return res.redirect("/admin/users/" + obj.id);
  }
);

/* ------------------------------------------------------------------------------------------------------ */

function rand(min, max) {
  return Math.round(Math.random() * (max - min)) + min;
}

/* ------------------------------------------------------------------------------------------------------ */

module.exports = router;
