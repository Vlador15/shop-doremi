function getURLVar(key) {
	var value = [];

	var query = String(document.location).split('?');

	if (query[1]) {
		var part = query[1].split('&');

		for (i = 0; i < part.length; i++) {
			var data = part[i].split('=');

			if (data[0] && data[1]) {
				value[data[0]] = data[1];
			}
		}

		if (value[key]) {
			return value[key];
		} else {
			return '';
		}
	} else { // Изменения для seo_url от Русской сборки OpenCart 3x
		var query = String(document.location.pathname).split('/');
		if (query[query.length - 1] == 'cart') value['route'] = 'checkout/cart';
		if (query[query.length - 1] == 'checkout') value['route'] = 'checkout/checkout';

		if (value[key]) {
			return value[key];
		} else {
			return '';
		}
	}
}

 

// Cart add remove functions
var cart = {
	'add': function (product_id, quantity, key) {
		$.ajax({
			url: 'catalog?route=checkout/cart/add',
			type: 'post',
			data: 'product_id=' + product_id + '&quantity=' + (typeof (quantity) != 'undefined' ? quantity : 1),
			dataType: 'json',
			success: function (json) {
				$('#modal-cart').remove();

				if (json['redirect']) {
					location = json['redirect'];
				}

				if (json['success']) {
					html = '<div id="modal-cart" class="modal fade">';
					html += '  <div class="modal-dialog modal-cart__dialog">';
					html += '    <div class="modal-content modal-cart__content">';
					html += '      <button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>';
					html += '      <div class="modal-cart__header">';
					html += '        <div class="modal-cart__title">' + json.title + '</div>';
					html += '      </div>';
					html += '      <div class="modal-cart__body">'
					html += '        <div class="modal-cart__img">';
					html += '          <img src="' + json.img + '" title="' + json.name + '" alt="' + json.name + '">';
					html += '        </div>';
					html += '	     <div class="modal-cart__name"><span class="modal-cart__name--value">' + json.name + '</span><span class="modal-sku">' + json.sku + '</span>' + json.stock + '</div>';
					html += '      </div>';
					html += '      <div class="modal-cart__footer">';
					html += '        <button type="button" class="btn btn-secondary" data-dismiss="modal">' + json.continue_shopping + '</button>' + json.checkout + '';
					html += '      </div>';
					html += '    </div>';
					html += '  </div>';
					html += '</div>';

					$('body').append(html);

					$('#modal-cart').modal('show');

					// Need to set timeout otherwise it wont update the total
					setTimeout(function () {
						$('.header-cart > a').html('<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="icon"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>' + json['total'] + '');
						$('.mobile-menu__cart span').html(json['countProducts']);
					}, 100);					
				}
			},
			error: function (xhr, ajaxOptions, thrownError) {
				alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
			}
		});
	},
	'update': function (key, quantity) {
		$.ajax({
			url: 'catalog?route=checkout/cart/edit',
			type: 'post',
			data: 'key=' + key + '&quantity=' + (typeof (quantity) != 'undefined' ? quantity : 1),
			dataType: 'json',
			success: function (json) {
				// Need to set timeout otherwise it wont update the total
				setTimeout(function () {
					$('.header-cart > a').html('<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="icon"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>' + json['total'] + '');
					$('.mobile-menu__cart span').html(json['countProducts']);
				}, 100);				

				if (getURLVar('route') == 'checkout/cart' || getURLVar('route') == 'checkout/checkout') {
					location = 'catalog?route=checkout/cart';
				} else {
					$('.header-cart > ul').load('catalog?route=common/cart/info ul li');
				}
			},
			error: function (xhr, ajaxOptions, thrownError) {
				alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
			}
		});
	},
	'remove': function (key) {
		$.ajax({
			url: 'catalog?route=checkout/cart/remove',
			type: 'post',
			data: 'key=' + key,
			dataType: 'json',
			success: function (json) {
				// Need to set timeout otherwise it wont update the total
				setTimeout(function () {
					$('.header-cart > a').html('<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="icon"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>' + json['total'] + '');
					$('.mobile-menu__cart span').html(json['countProducts']);
				}, 100);				

				if (getURLVar('route') == 'checkout/cart' || getURLVar('route') == 'checkout/checkout') {
					location = 'catalog?route=checkout/cart';
				} else {
					$('.header-cart > ul').load('catalog?route=common/cart/info ul li');
				}
			},
			error: function (xhr, ajaxOptions, thrownError) {
				alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
			}
		});
	}
}

var voucher = {
	'add': function () {

	},
	'remove': function (key) {
		$.ajax({
			url: 'catalog?route=checkout/cart/remove',
			type: 'post',
			data: 'key=' + key,
			dataType: 'json',
			success: function (json) {
				// Need to set timeout otherwise it wont update the total
				setTimeout(function () {
					$('.header-cart > a').html('<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="icon"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>' + json['total'] + '');
					$('.mobile-menu__cart span').html(json['countProducts']);
				}, 100);				

				if (getURLVar('route') == 'checkout/cart' || getURLVar('route') == 'checkout/checkout') {
					location = 'catalog?route=checkout/cart';
				} else {
					$('.header-cart > ul').load('catalog?route=common/cart/info ul li');
				}
			},
			error: function (xhr, ajaxOptions, thrownError) {
				alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
			}
		});
	}
}

var wishlist = {
	'add': function (product_id) {
		$.ajax({
			url: 'catalog?route=account/wishlist/add',
			type: 'post',
			data: 'product_id=' + product_id,
			dataType: 'json',
			success: function (json) {
				$('.popupshow').remove();

				if (json['redirect']) {
					location = json['redirect'];
				}

				if (json['success']) {
					if (json.logged) {
						$("body").append('<div class="popupshow"><div class="alert alert-success alert-dismissible alertsuc zoomIn animated"><span class="check-success"></span>' + json['success'] + '<button type="button" class="close" data-dismiss="alert"></button></div></div>')
					} else {
						$("body").append('<div class="popupshow"><div class="alert alert-danger alert-dismissible alertsuc zoomIn animated"><span class="check-danger"></span>' + json['success'] + '<button type="button" class="close" data-dismiss="alert"></button></div></div>')
					}

					$(".popupshow").delay(7000).fadeOut();
					$("button.close").click(function () {
						$(".popupshow").remove();
					});
				}

				$('.wishlist-total').html(json['total']);
			},
			error: function (xhr, ajaxOptions, thrownError) {
				alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
			}
		});
	},
	'remove': function () {

	}
}

var compare = {
	'add': function (product_id) {
		$.ajax({
			url: 'catalog?route=product/compare/add',
			type: 'post',
			data: 'product_id=' + product_id,
			dataType: 'json',
			success: function (json) {
				$('.popupshow').remove();

				if (json['success']) {
					$("body").append('<div class="popupshow"><div class="alert alert-success alert-dismissible alertsuc zoomIn animated"><span class="check-success"></span>' + json['success'] + '<button type="button" class="close" data-dismiss="alert"></button></div></div>');

					$('#compare-total').html(json['total']);
				}

				$(".popupshow").delay(7000).fadeOut();
				$("button.close").click(function () {
					$(".popupshow").remove();
				});
			},
			error: function (xhr, ajaxOptions, thrownError) {
				alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
			}
		});
	},
	'remove': function () {

	}
}

/* Agree to Terms */
$(document).delegate('.agree', 'click', function (e) {
	e.preventDefault();

	$('#modal-agree').remove();

	var element = this;

	$.ajax({
		url: $(element).attr('href'),
		type: 'get',
		dataType: 'html',
		success: function (data) {
			html = '<div id="modal-agree" class="modal">';
			html += '  <div class="modal-dialog">';
			html += '    <div class="modal-content">';
			html += '      <div class="modal-header">';
			html += '        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>';
			html += '        <h4 class="modal-title">' + $(element).text() + '</h4>';
			html += '      </div>';
			html += '      <div class="modal-body">' + data + '</div>';
			html += '    </div>';
			html += '  </div>';
			html += '</div>';

			$('body').append(html);

			$('#modal-agree').modal('show');
		}
	});
});

// Autocomplete */
(function ($) {
	$.fn.autocomplete = function (option) {
		return this.each(function () {
			this.timer = null;
			this.items = new Array();

			$.extend(this, option);

			$(this).attr('autocomplete', 'off');

			// Focus
			$(this).on('focus', function () {
				this.request();
			});

			// Blur
			$(this).on('blur', function () {
				setTimeout(function (object) {
					object.hide();
				}, 200, this);
			});

			// Keydown
			$(this).on('keydown', function (event) {
				switch (event.keyCode) {
					case 27: // escape
						this.hide();
						break;
					default:
						this.request();
						break;
				}
			});

			// Click
			this.click = function (event) {
				event.preventDefault();

				value = $(event.target).parent().attr('data-value');

				if (value && this.items[value]) {
					console.log(this.items[value])
					this.select(this.items[value]);
				}
			}

			// Show
			this.show = function () {
				var pos = $(this).position();

				$(this).siblings('ul.dropdown-menu').css({
					top: pos.top + $(this).outerHeight(),
					left: pos.left
				});

				$(this).siblings('ul.dropdown-menu').show();
			}

			// Hide
			this.hide = function () {
				$(this).siblings('ul.dropdown-menu').hide();
			}

			// Request
			this.request = function () {
				clearTimeout(this.timer);

				this.timer = setTimeout(function (object) {
					object.source($(object).val(), $.proxy(object.response, object));
				}, 200, this);
			}

			// Response
			this.response = function (json) {
				html = '';

				if (json.length) {
					for (i = 0; i < json.length; i++) {
						this.items[json[i]['value']] = json[i];
					}

					for (i = 0; i < json.length; i++) {
						if (!json[i]['category']) {
							html += '<li data-value="' + json[i]['value'] + '"><a href="#">' + json[i]['label'] + '</a></li>';
						}
					}

					// Get all the ones with a categories
					var category = new Array();

					for (i = 0; i < json.length; i++) {
						if (json[i]['category']) {
							if (!category[json[i]['category']]) {
								category[json[i]['category']] = new Array();
								category[json[i]['category']]['name'] = json[i]['category'];
								category[json[i]['category']]['item'] = new Array();
							}

							category[json[i]['category']]['item'].push(json[i]);
						}
					}

					for (i in category) {
						html += '<li class="dropdown-header">' + category[i]['name'] + '</li>';

						for (j = 0; j < category[i]['item'].length; j++) {
							html += '<li data-value="' + category[i]['item'][j]['value'] + '"><a href="#">   ' + category[i]['item'][j]['label'] + '</a></li>';
						}
					}
				}

				if (html) {
					this.show();
				} else {
					this.hide();
				}

				$(this).siblings('ul.dropdown-menu').html(html);
			}

			$(this).after('<ul class="dropdown-menu"></ul>');
			$(this).siblings('ul.dropdown-menu').delegate('a', 'click', $.proxy(this.click, this));

		});
	}
})(window.jQuery);