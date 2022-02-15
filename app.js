/*===========================================vk.com/c_o_d_e_r===============================================*/

//  consts
const config = require("./base/config.json");
const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  session = require("express-session"),
  fs = require("fs"),
  colors = require("colors"),
  multer = require("multer"),
  upload = multer();

// middleware
app.disable("x-powered-by");
app.use(express.static(__dirname + "/public"));
app.use(require("cookie-parser")());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");

// dc connect
var MongoStore = require("connect-mongo")(session);
var sessionMiddleware = session({
  secret: "dfgdgr345546",
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({
    url: config.url_bd,
    collection: "sessions",
  }),
  cookie: {
    path: "/",
    httpOnly: true,
    maxAge: 3600000 * 24 * 20, // 24 часа
  },
});

app.use(sessionMiddleware);

const {
  getCounts,
  get_category,
  verification,
  checkSession,
  date,
  spaces,
  updatesCatalog,
  dateMessage,
} = require("./modules/utils.js");

// routers
const catalogPage = require("./routes/catalog");
const accountPage = require("./routes/account");
const accountCart = require("./routes/cart");
const orderPage = require("./routes/order");
const pages = require("./routes/pages");
const adminPage = require("./routes/admin");
const apiPage = require("./routes/api");

app.use("/del", async function (req, res) {
  BD_SESSIONS.deleteOne({ _id: req.session.id });
  req.session.products = [];
  req.session.order = [];
  //req.session.order = [];
  //req.session.products = [];
  res.redirect("/");
});

app.use("/", checkSession, catalogPage);
app.use("/", checkSession, accountPage);
app.use("/", checkSession, accountCart);
app.use("/", checkSession, orderPage);
app.use("/", checkSession, pages);
app.use("/", checkSession, apiPage);
app.use("/", checkSession, adminPage);

app.use("/", async function (req, res) {
  let user = req.session.user;
  res.render("main", { user: user, counts: getCounts(req.session) });
});

let forceSsl = require("express-force-ssl");
let tls = require("tls");

let secureContext = {
  "doremi-sklad.ru": tls.createSecureContext({
    key: fs.readFileSync("./api/ssl/privkey.pem", "utf8"),
    cert: fs.readFileSync("./api/ssl/fullchain.pem", "utf8"),
  }),
};

try {
  var options = {
    SNICallback: function (domain, cb) {
      if (secureContext[domain]) {
        if (cb) {
          cb(null, secureContext[domain]);
        } else {
          return secureContext[domain];
        }
      } else {
        console.error(
          "Произошла ошибка при верификации, сертифицирования домменых имён."
        );
      }
    },
    key: fs.readFileSync("./api/ssl/privkey.pem"),
    cert: fs.readFileSync("./api/ssl/fullchain.pem"),
  };
} catch (err) {
  console.log(`[error] ssl sertificat`);
}
app.use(forceSsl);

let serverHttps = require("https")
  .createServer(options, app, function (req, res) {
    res.setHeader("Content-Type", "text/plain");
  })
  .listen(443); // 8443

let serverHttp = require("http")
  .createServer(app)
  .listen(80, function () {
    const MongoClient = require("mongodb").MongoClient;
    const MONGO_URL = config.url_bd;
    MongoClient.connect(
      MONGO_URL,
      { useUnifiedTopology: true },
      (error, client) => {
        if (error) {
          //throw error;
          console.log(`[error] https`);
        }
        users = client.db("users").collection("users");
        catalog = client.db("catalog");
        order = client.db("data").collection("order");
        comments = client.db("data").collection("comments");
        info = client.db("data").collection("info");
        promocodes = client.db("data").collection("promocode");

        BD_SESSIONS = client.db("Doremi").collection("sessions");
        console.log(`${date()}`.red + ` | Connection to Mongo`);
      }
    );
    console.log(`Server start on port: 80`);
  });

let io = require("socket.io")(serverHttps);
io.attach(serverHttps);

io.use(function (socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});

io.on("connection", async function (socket) {
  console.log("Connection");
  let sessionUser = socket.request.session;
  let allMessages = await BD_SESSIONS.findOne({ _id: sessionUser.id });

  await BD_SESSIONS.findOneAndUpdate(
    { _id: sessionUser.id },
    {
      $set: { socketId: socket.id },
    }
  );

  // загрузка диалога всего
  if (allMessages != undefined) {
    io.to(socket.id).emit("update_chat", {
      arr: allMessages.messages,
    });
  }

  // получаем новые соо с клиента
  socket.on("new_message", async function (data) {
    socketsUtils.sendMsgSite(data.message, true, socket.id);
    socketsUtils.sendMsgVk(sessionUser, data.message, socket);
    socketsUtils.saveMsg(sessionUser, data.message, true, socket);
  });
});

const socketsUtils = {
  saveMsg: async (session, message, status, socket) => {
    await BD_SESSIONS.findOneAndUpdate(
      { _id: session.id },
      {
        $set: { socketId: socket.id },
        $push: {
          messages: {
            date: dateMessage(),
            message: message,
            user: status,
          },
        },
      }
    );

    console.log(session.messages);
  },

  sendMsgVk: (session, message, socket) => {
    vk.api.messages.send({
      chat_id: config.main_chat_vk,
      message: `📩 СООБЩЕНИЕ С САЙТА \n🆔 Session_id |${
        session.id
      }|\n\n⌚ Дата: ${dateMessage()}\n⚠ Вопрос: ${message}\n\nДля ответа перешлите сообщение и напишите:\n "ответ [текст]" (без скобок)`,
    });
  },

  sendMsgSite: async (message, type, socketId) => {
    console.log("send");
    console.log(socketId);
    io.to(socketId).emit("new_message", {
      date: dateMessage(),
      message: message,
      user: type,
    });
  },
};
