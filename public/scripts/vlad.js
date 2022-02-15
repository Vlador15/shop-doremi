$(".custom-select").each(function () {
  var classes = $(this).attr("class"),
    id = $(this).attr("id"),
    name = $(this).attr("name");
  var template = '<div class="' + classes + '">';
  template +=
    '<span class="custom-select-trigger">' +
    $(this).attr("placeholder") +
    "</span>";
  template += '<div class="custom-options">';
  $(this)
    .find("option")
    .each(function () {
      template +=
        '<span class="custom-option ' +
        $(this).attr("class") +
        '" data-value="' +
        $(this).attr("value") +
        '">' +
        $(this).html() +
        "</span>";
    });
  template += "</div></div>";

  $(this).wrap('<div class="custom-select-wrapper"></div>');
  $(this).hide();
  $(this).after(template);
});

$(".custom-option:first-of-type").hover(
  function () {
    $(this).parents(".custom-options").addClass("option-hover");
  },
  function () {
    $(this).parents(".custom-options").removeClass("option-hover");
  }
);
$(".custom-select-trigger").on("click", function () {
  $("html").one("click", function () {
    $(".custom-select").removeClass("opened");
  });
  $(this).parents(".custom-select").toggleClass("opened");
  event.stopPropagation();
});
$(".custom-option").on("click", function () {
  $(this)
    .parents(".custom-select-wrapper")
    .find("select")
    .val($(this).data("value"));
  $(this)
    .parents(".custom-options")
    .find(".custom-option")
    .removeClass("selection");
  $(this).addClass("selection");
  $(this).parents(".custom-select").removeClass("opened");
  $(this)
    .parents(".custom-select")
    .find(".custom-select-trigger")
    .text($(this).text());
});

// путь к бд, ид товара, количество
var cart = {
  add: function (link, product_id, quantity, comment) {
    quantity = $("input[name='quantity']").val();
    comment = $("textarea[name='comment']").val();

    if (quantity < 1 || quantity > 200) quantity = 1;

    console.log(comment);

    $.ajax({
      url: "cart/add",
      type: "post",
      data:
        "link=" +
        link +
        "&comment=" +
        comment +
        "&product_id=" +
        product_id +
        "&quantity=" +
        (typeof quantity != "undefined" ? quantity : 1),
      dataType: "json",
      success: function (json) {
        $("#modal-cart").remove();

        if (quantity == undefined) quantity = 1;

        if (json["id"]) {
          html = '<div id="modal-cart" class="modal fade">';
          html += '  <div class="modal-dialog modal-cart__dialog">';
          html += '    <div class="modal-content modal-cart__content">';
          html +=
            '      <button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>';
          html += '      <div class="modal-cart__header">';
          html +=
            '        <div class="modal-cart__title"> Корзина: ' +
            json.title +
            "</div>";
          html += "      </div>";
          html += '      <div class="modal-cart__body">';
          html += '        <div class="modal-cart__img">';
          html +=
            '          <img class="img-responsive" src="' +
            json.thumb_photo +
            '" title="' +
            json.title +
            '" alt="' +
            json.title +
            '">';
          html += "        </div>";
          html +=
            '      <div class="modal-cart__name"><span class="modal-cart__name--value">' +
            json.name +
            '</span><span class="modal-sku">' +
            spaces(json.price * quantity) +
            "</span> </div>";
          html += "      </div>";
          html += '     <div class="modal-cart__footer">';

          html +=
            '       <button type="button" class="btn btn-secondary" data-dismiss="modal">';
          html +=
            '         <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="icon">';
          html +=
            '           <line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>';
          html += "         </svg>";
          html += "         Продолжить покупки";
          html += "       </button>";

          html += '       <a href="/cart" class="btn btn-primary">';
          html +=
            '         <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="icon">';
          html +=
            '           <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1">';
          html += "           </circle>";
          html +=
            '           <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>';
          html += "         </svg>Открыть корзину";
          html += "       </a>";
          html += "     </div>";

          html += "    </div>";
          html += "  </div>";
          html += "</div>";

          $("body").append(html);

          $("#modal-cart").modal("show");

          // Need to set timeout otherwise it wont update the total

          setTimeout(function () {
            $(".header-cart > a").html(
              '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="icon"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg><span class="count">' +
                json["countProducts"] +
                '</span><span class="user-nav__title mobile-menu__title">Корзина</span>'
            );
            $(".mobile-menu__cart span").html(json["countProducts"]);
          }, 100);
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        alert(
          thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText
        );
      },
    });
  },

  update: function (link, product_id, text, quantity) {
    $.ajax({
      url: "cart/update",
      type: "post",
      data:
        "link=" +
        link +
        "&product_id=" +
        product_id +
        "&text=" +
        text +
        "&quantity=" +
        (typeof quantity != "undefined" ? quantity : 1),
      dataType: "json",
      success: function (json) {},
      error: function (xhr, ajaxOptions, thrownError) {
        alert(
          thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText
        );
      },
    });
  },
};

$(document).ready(function () {
  // scroll
  $(".scroll-top").click(function () {
    $("body,html").animate(
      {
        scrollTop: 0,
      },
      500
    );
    return false;
  });

  // показываем чат через 7 секунд

  setTimeout(function () {
    $("#chat-form").css("display", "block");
    $("#chat-form").animate(
      {
        bottom: "40px",
      },
      50
    );
  }, 2000);
  setTimeout(function () {
    $("#chat-form").animate(
      {
        bottom: "5px",
      },
      50
    );
  }, 2400);
});

// order

$("#cheched").on("change", function () {
  if ($("#cheched").prop("checked")) {
    $(".btn-order").attr("disabled", false);
  } else {
    $(".btn-order").attr("disabled", true);
  }
});

function spaces(string) {
  if (typeof string !== "string") string = string.toString();
  return (
    string
      .split("")
      .reverse()
      .join("")
      .match(/[0-9]{1,3}/g)
      .join(" ")
      .split("")
      .reverse()
      .join("") + "руб."
  );
}

//VK.Widgets.CommunityMessages("vk_community_messages", 30313045);

// Get all elements with class="closebtn"
var close = document.getElementsByClassName("closebtn");
var i;

// Loop through all close buttons
for (i = 0; i < close.length; i++) {
  // When someone clicks on a close button
  close[i].onclick = function () {
    // Get the parent of <span class="closebtn"> (<div class="alert">)
    var div = this.parentElement;

    // Set the opacity of div to 0 (transparent)
    div.style.opacity = "0";

    // Hide the div after 600ms (the same amount of milliseconds it takes to fade out)
    setTimeout(function () {
      div.style.display = "none";
    }, 600);
  };
}

$(document).ready(function () {
  // прокрутка страницы при загрузке

  // const el = document.getElementById('start');
  // el.scrollIntoView({block: "start", behavior: "smooth"})

  // просмотр карточки клиентов

  $("input[id='summa_order_add']").on("input keyup", function (e) {
    let summa = $("#summa_order_add").val() * 0.01; // 0.05 берем значение из ячейки ПРОЦЕНТ(скидка)
    //$('#total-sum').text(Math.floor(summa));
    $("#total-sum").val(Math.floor(summa));
  });

  $("input[id='summa_order_remove']").on("input keyup", function (e) {
    let summa = $("#summa_order_remove").val();
    let discount = $("input[name='discount']").val();
    let points = $("input[name='points']").val();
    let discount_user = Math.floor(Number(summa * (0.01 * discount)));

    if (discount_user < points) {
      $("input[name='remove_points']").val(
        Math.floor(Number(summa * (0.01 * discount)))
      );
    } else {
      $("input[name='remove_points']").val(points);
    }

    $("#max_discount").text(discount + "%");
    $("#discount_amount").text(
      Number(summa * (0.01 * discount)).toFixed(2) + " руб."
    );
    $("#for_payment").text(
      Number(summa - summa * (0.01 * discount)).toFixed(2) + " руб."
    );
  });

  // активация бонусного купона
  $("input[name='promocode']").on("input keyup", function (e) {
    let code = $("input[name='promocode']").val();

    $.ajax({
      url: "api/promocode",
      type: "post",
      data: "code=" + code,
      dataType: "json",
      success: function (json) {
        if (json.promocode == undefined) {
          $("#promocode-text").text("Такого купона не существует...");
          $("#promocode-text").css({ display: "block", color: "red" });
        } else {
          console.log(json.promocode.status);

          if (!json.promocode.status) {
            $("#promocode-text").css({ display: "block", color: "blue" });
            $("#promocode-text").text("Данный купон уже активирован!");
          } else {
            $("#promocode-text").css({ display: "block", color: "green" });
            $("#promocode-text").text(
              "Вы активировали купон на " +
                json.promocode.points +
                " балл(ов)!\nОбновите страницу для изменения данных."
            );
          }
        }
      },

      error: function (xhr, ajaxOptions, thrownError) {
        alert(
          thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText
        );
      },
    });
  });
});
