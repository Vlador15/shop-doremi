const 
  express = require('express'),  
  fs = require('fs'),
  path = require('path'),
  router = express.Router(),
  multer  = require('multer'),
  upload = multer();


const { VK, Keyboard }  = require('vk-io');   
const vk                = new VK();  
const str               = new VK();   
const { updates }       = vk;   

str.setOptions({ 
  token:            'e8c6d4517987fe667b9b9a92cca56686fbe4e6e3e89020128156a4e3fbce1aa9f77bc59b70285e6fab659', 
  pollingGroupId:   196658680,   
  uploadTimeout:    180e3 
});  

const { getCounts, get_category, verification, checkSession, date, spaces } = require('../modules/utils.js');
const config = require(".././base/config.json"); 

const url = config.domen;

const statuses = {
  "0": "Заказ отменен",
  "1": "Заказ ожидает оплаты",
  "2": "Заказ ожидает доставки",
  "3": "Заказ доставлен"
}
 
 
const smile_status = {
  "0": "🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫",
  "1": "⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠",
  "2": "🚚🚚🚚🚚🚚🚚🚚🚚🚚🚚",
  "3": "✅✅✅✅✅✅✅✅✅✅"
}

const mainChat = 1;
const delivery = {
  "0": "Не указано!",
  "1": "Сами заберем - бесплатно",
  "2": "Доставка заказа до 10 тысяч рублей по Лениногорску - 350₽",
  "3": "Доставка до квартиры по Лениногорску от 10 тысяч рублей - бесплатно",
  "4": "Мы с другого города - рассчитайте нам доставку"
}
 

/* ------------------------------------------------------------------------------------------------------ */

router.get("/orders", checkSession, async function(req, res){   
  let user = req.session.user;   
  res.render("orders", { user: user, counts: getCounts(req.session), products: await getSessionOrder(req.session.order) });
});

/* ------------------------------------------------------------------------------------------------------ */

router.get("/orders/delete/:id", checkSession, async function(req, res){   
    let id = req.params.id;  
    if ( !req.session.order[id-1] ) return res.redirect('/orders');   
    await msgVKDelete( await order.findOne({ id: req.session.order[id-1].id }) );
    //await order.deleteOne({ id: req.session.order[id-1].id }) 
    req.session.order.splice(id-1,1 ); 
    res.redirect("/orders");
});

/* ------------------------------------------------------------------------------------------------------ */
 

router.get("/orders/:id", checkSession, async function(req, res){   
  let user = req.session.user; 
  let id = req.params.id;  
  if ( !req.session.order[id-1] ) return res.redirect('/orders');   
  
  res.render("order-view", { user: user, counts: getCounts(req.session), products: await getProducts(req.session.order[id-1].products) });
});
   

/* ------------------------------------------------------------------------------------------------------ */

router.get("/order", checkSession, async function(req, res){   
  let user = req.session.user;  
  res.render("order", { user: user, counts: getCounts(req.session), products: await getSessionProducts(req.session.products) });
});

/* ------------------------------------------------------------------------------------------------------ */
 
router.get("/order-data", checkSession, async function(req, res){   
  let user = req.session.user;  
  res.render("order-data", { user: user, counts: getCounts(req.session), products: undefined });
});
 

/* ------------------------------------------------------------------------------------------------------ */

router.post("/order", checkSession, upload.array(), async function(req, res){   
  let user = req.session.user,
      data = req.body,
      rand_id = rand(1000000,9999999);

  data.name = data.name || undefined;
  data.address = data.address || undefined;
  data.email = data.email || undefined;
  data.phone = data.phone.replace('+7', '8').replace('(', '').replace(')', '').replace(/-+/gi, '').replace(/\s+/g, '').replace(/_+/g, '') || undefined;
  data.city = data.city || undefined;
  data.comment = data.comment || undefined;
  data.delivery = data.delivery || 0;
  data.status = 1;
  data.id = rand_id;
  data.date = date();
  
  if (data.name && data.address && data.phone && data.email) {
    await msgVK(data, req.session.products);
  }
   
  
  //email: data.email, 
  await order.insertOne({
    id: Number(rand_id),
    name: data.name,
    address: data.address,
    email: data.email, 
    phone: data.phone,
    city: data.city,
    comment: data.comment,
    delivery: data.delivery,
    status: data.status,
    date: date(),

    sessionId: req.session.id,
    products: req.session.products
  }) 
 
  req.session.order.push({
    id: Number(rand_id),
    products: req.session.products,
    date: date(),
    comment: data.comment,
    delivery: data.delivery,
    status: data.status
  });
  req.session.products = [];

  //res.redirect('/order-data');
  let products_order = req.session.order.find((a) => a.id == rand_id);
  res.render("order-data", { user: user, counts: getCounts(req.session), products: await getProducts(products_order.products) });
});  

/* ------------------------------------------------------------------------------------------------------ */

async function getProducts(session) {
  let products = [];
  for ( let i = 0; i < session.length; i++ ) {
    let item = session[i]; 
    products.push({
      product: await catalog.collection(item.link).findOne({ id: Number(item.product_id) }),
      count: item.count,
      comment: item.comment
    })
  }  
  return products;
}

/* ------------------------------------------------------------------------------------------------------ */

async function msgVK(data, session) {
  /*
  `${allProducts.map((item, index) => {    
        return `${index+1}. ${url}/catalog/${item.product.link}/${item.product.id}\nКол-во: ${item.count}\nКомментарий: ${item.comment}\nНа сумму: ${item.product.price * Number(item.count)} руб.\n\n`
      }).toString().replace(/,/gi, '')}`
  */
  let allProducts = await getSessionProducts(session),
      products = '',
      totalPrice = 0,

      text = `${smile_status[data.status]}\n💡 Статус: ${statuses[data.status]}\n\n` + 
      `📢 Заказ на сайте | ID: ${data.id}\n` +  
      `📋 Дата: ${data.date}\n` + 
      `👤 Имя: ${data.name}\n` + 
      `📫 Адрес доставки: ${data.address}\n` + 
      `📩 Email: ${data.email}\n` + 
      `📱 Телефон: ${data.phone}\n` + 
      `🏦 Город: ${data.city}\n` + 
      `📝 Комментарий: ${data.comment != undefined ? `${data.comment}\n` : 'не указан'}\n` + 
      `🚚 Доставка: ${data.delivery != 0 ? `${delivery[data.delivery]}\n` : ' не указана'}\n` +  

      `\n📦 Просмотр всего заказа:\n` + 

      `https://${url}/admin/orders/${data.id}\n` +

      `💵 Сумма заказа: ${allProducts.reduce(function(sum, current) { return sum + Number(current.count * current.product.price); }, 0)} руб.`


  str.api.messages.send({
    chat_id: 1,
    random_id: rand(1,1000),
    message: text
  })
}

async function msgVKDelete(data) { 
   
  text = `${smile_status[0]}\n💡 Статус: ${statuses[0]}\n\n` + 
  `📢 Заказ на сайте | ID: ${data.id}\n` +  
  `📋 Дата: ${data.date}\n` + 
  `👤 Имя: ${data.name}\n` + 
  `📫 Адрес доставки: ${data.address}\n` + 
  `📩 Email: ${data.email}\n` + 
  `📱 Телефон: ${data.phone}\n` + 
  `🏦 Город: ${data.city}\n` + 
  `📝 Комментарий: ${data.comment != undefined ? `${data.comment}\n` : 'не указан'}\n` + 
  `🚚 Доставка: ${data.delivery != 0 ? `${delivery[data.delivery]}\n` : ' не указана'}\n` + 

  `📦 Удалите заказ вручную:\n https://${url}/admin/orders/${data.id}` 

  str.api.messages.send({
    chat_id: 1,
    random_id: rand(1,1000),
    message: text
  })
   
}

/* ------------------------------------------------------------------------------------------------------ */

async function getSessionProducts(session) {
  let cart = [];
  for ( let i = 0; i < session.length; i++ ) {
    let item = session[i]; 
    cart.push({
      product: await catalog.collection(item.link).findOne({ id: Number(item.product_id) }),
      count: item.count,
      comment: item.comment
    })
  }  
  return cart;
}

/* ------------------------------------------------------------------------------------------------------ */

async function getSessionOrder(session) {
  let orders = [],
      oneOrder = [];
 
  //console.log(session)

  for ( let i = 0; i < session.length; i++ ) {
    let obj = session[i]; 
  
    oneOrder = {
      date: obj.date,
      id: i+1,
      comment: obj.comment,
      count: obj.products.reduce(function(sum, current) { return sum + Number(current.count); }, 0),
      totalPrice: obj.products.reduce(function(sum, current) { return sum + Number(current.price * current.count); }, 0),
      delivery: delivery[obj.delivery],
      products: []
    }
 

    for ( j=0; j<obj.products.length; j++ ) {
      let item = obj.products[j]; 
      oneOrder.products.push({
        product: await catalog.collection(item.link).findOne({ id: Number(item.product_id) }), 
        comment: item.comment,
        count: item.count
      });
    }

    orders.push(oneOrder); 
  }  
 
  //console.log(orders[1].products)
  return orders;
}

/* ------------------------------------------------------------------------------------------------------ */

function rand(min, max) {return Math.round(Math.random() * (max - min)) + min} 

/* ------------------------------------------------------------------------------------------------------ */
 
module.exports = router;

 