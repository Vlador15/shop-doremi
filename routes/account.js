const express = require("express"),
  fs = require("fs"),
  path = require("path"),
  router = express.Router(),
  multer = require("multer"),
  upload = multer(),
  config = require(".././base/config.json");

let {
  getCounts,
  get_category,
  verification,
  checkSession,
  date,
  spaces,
} = require("../modules/utils.js");

/* ------------------------------------------------------------------------------------------------------ */

router
  .route("/create-account")
  .get(checkSession, async function (req, res) {
    if (req.session.user) {
      return res.redirect("my-account");
    }

    return res.render("create-account", {
      err: false,
      counts: getCounts(req.session),
    });
  })

  .post(upload.array(), checkSession, async function (req, res) {
    // проверка данных. Если нет такого человека - выдаем ошибку.
    // Если не верно введены данные - выдаем ошибку

    let data = req.body;
    //let { firstname, lastname, email, phone, password, password2, mailing, agreement } = data;
    let { name, phone, password } = data;
    phone = phone
      .replace("(", "")
      .replace(")", "")
      .replace(/-+/g, "")
      .replace(/\s+/g, "")
      .replace(/_+/g, "");

    if (name && phone && password) {
      //&& mailing && agreement && password2 && email && firstname && lastname

      if (await users.findOne({ phone: phone }))
        return res.render("create-account", {
          err: "Аккаунт с такие телефоном  уже зарегистрирован! ",
          counts: getCounts(req.session),
        });
      if (!(await users.findOne({ phone: phone }))) {
        let id = rand(1, 10000);
        let user_last_id = await info.findOne({ type: "users" });

        await info.findOneAndUpdate(
          { type: "users" },
          {
            $set: { count: Number(user_last_id.count + 1) },
          }
        );

        if (user_last_id) id = user_last_id.count;

        await users.insertOne({
          vk_id: false,
          id: id || 0,
          randId: rand(1000, 99999),
          name: `${name}`,
          //firstname: firstname,
          //lastname: lastname,
          //email: email,
          phone: phone,
          password: password,
          //mailing: mailing,
          //agreement: agreement,
          balance: 0, // рубли
          points: 1000, // баллы
          discount: 5,
          regDateText: date(), // текстовая дата реги
          regDate: Date.now(), // дата регистрации в unix time
          referalUrl: `https://doremi-sklad.ru/referal/${id}`,
          referals: [], // массив рефералов
          products: [], // массив для товаров
          order: [], // массив для заказов
          logs: [], // массив для сообщений чата
          invited: req.session.referal || 0, // id реферала, кто пригласил клиента
          admin: 0,
        });

        let user = await users.findOne({ phone: phone });
        if (!req.session.user) req.session.user = user;

        // реферальная система
        if (req.session.referal != undefined) {
          let userInvited = await users.findOne({
            id: Number(req.session.referal),
          });
          if (userInvited) {
            // выдача баллов перешедшему по ссылке
            /*await users.findOneAndUpdate({ phone: phone }, {
                $set: { "points": Number(user.points+(config.referalPoints/2))}
              })*/

            // выдача баллов человеку, чья ссылка
            await users.updateOne(
              { id: Number(req.session.referal) },
              {
                $set: {
                  points: Number(userInvited.points + config.referalPoints),
                },
                $push: {
                  referals: {
                    id: user.id,
                    name: `${name}`,
                  },
                },
              }
            );
          }
        }
        return res.redirect("/my-account");
      }
    } else {
      return res.render("create-account", {
        err: "Вы заполнили не все поля! ",
        counts: getCounts(req.session),
      });
    }
    return res.render("create-account", {
      err: false,
      counts: getCounts(req.session),
    });
  });

/*function newRefUrl() {
    let password = "";
    let symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 15; i++){
      password += symbols.charAt(Math.floor(Math.random() * symbols.length));     
    }
    return password; 
  }*/
/* ------------------------------------------------------------------------------------------------------ */

router.get("/logout", checkSession, verification, async function (req, res) {
  req.session.user = undefined;
  res.redirect("/");
});

/* ------------------------------------------------------------------------------------------------------ */

router.get(
  "/my-account",
  checkSession,
  verification,
  async function (req, res) {
    let user = req.session.user,
      userData = await users.findOne({
        phone: user.phone,
        password: user.password,
      }),
      referalData = await users.findOne({ id: Number(userData.invited) }),
      discountSum = 5,
      referalName = referalData != undefined ? referalData.name : "",
      logs = userData.logs,
      referals = userData.referals;
    req.session.user = userData;

    switch (true) {
      case userData.points < 5000:
        discountSum = 5;
        break;
      case userData.points >= 5000 && userData.points < 10000:
        discountSum = 8;
        break;
      case userData.points >= 10000:
        discountSum = 10;
        break;
    }

    if (userData.discount != discountSum) {
      await users.findOneAndUpdate(
        { phone: user.phone },
        {
          $set: { discount: Number(discountSum) },
        }
      );
    }

    userData = await users.findOne({ phone: user.phone });

    if (!userData)
      return res.render("my-account", {
        user: user,
        counts: getCounts(req.session),
      });
    res.render("my-account", {
      user: userData,
      referalName,
      referals,
      logs,
      counts: getCounts(req.session),
    });
  }
);

/* ------------------------------------------------------------------------------------------------------ */

router
  .route("/login")
  .get(checkSession, async function (req, res) {
    if (!req.session.user) {
      return res.render("login", {
        err: false,
        counts: getCounts(req.session),
      });
    } else {
      return res.redirect("my-account");
    }
  })

  .post(upload.array(), checkSession, async function (req, res) {
    // проверка данных. Если нет такого человека - выдаем ошибку.
    // Если не верно введены данные - выдаем ошибку
    let data = req.body;
    let { phone, password } = data;

    if (!phone || !password)
      return res.render("login", {
        err: "Неправильно заполнены поле телефон и/или пароль!",
        counts: getCounts(req.session),
      });

    let user = await users.findOne({ phone: phone, password: password });
    if (!user)
      return res.render("login", {
        err: "Пользователь с таким телефоном и паролем не найден!",
        counts: getCounts(req.session),
      });

    //checkSession(req);

    req.session.user = user;
    return res.redirect("my-account");
  });

/* ------------------------------------------------------------------------------------------------------ */

router.get("/referal/:id", checkSession, async function (req, res) {
  let uid = req.params.id;
  let referal = await users.findOne({ id: Number(uid) });
  if (!referal) return res.redirect("/create-account");

  req.session.referal = uid;
  res.redirect("/create-account");
});

/* ------------------------------------------------------------------------------------------------------ */
function rand(min, max) {
  return Math.round(Math.random() * (max - min)) + min;
}
/* ------------------------------------------------------------------------------------------------------ */
module.exports = router;
