 


$(document).ready(function () {
	var s = window.matchMedia("(min-width: 1200px)");

	// Highlight any found errors
	$('.text-danger').each(function () {
		var element = $(this).parent().parent();

		if (element.hasClass('form-group')) {
			element.addClass('has-error');
		}
	});

	$('.mobile-menu__us').on('click', function () {
		$('#mobile-us').addClass('open');
		var a = $('.menu-absolute');
		if (a.hasClass('open')) {	
			setTimeout(function () {
				a.removeClass('open');
			}, 500);
		}
		$('body').addClass('no-scroll');
	});
	$('#mobile-us').on('click', function (e) {
		e.stopPropagation();
	});
	$('#mobile-us__close, .menu-absolute').on('click', function () {
		$('#mobile-us').removeClass('open');
		$('body').removeClass('no-scroll');
	});
	$('.mobile-toggle').on('click', function () {
		$('.menu-absolute').toggleClass('open');
		$('body').toggleClass('no-scroll');
	});
	$(".reward-questions").hover(function () {
		$(".dropdown-box").addClass("visible")
	}, function () {
		$(".dropdown-box").removeClass("visible")
	});

	if (s.matches) {
		$(window).scroll(function () {
			var height = $(window).scrollTop();
			if (height > 80) {
				$('#menu').addClass('fixed');
			} else {
				$('#menu').removeClass('fixed');
			}
		});
	}

	// Currency
	$('#form-currency .currency-select').on('click', function (e) {
		e.preventDefault();

		$('#form-currency input[name=\'code\']').val($(this).attr('name'));

		$('#form-currency').submit();
	});

	// Language
	$('#form-language .language-select').on('click', function (e) {
		e.preventDefault();

		$('#form-language input[name=\'code\']').val($(this).attr('name'));

		$('#form-language').submit();
	});

	 

	$('#search input[name=\'search\']').on('keydown', function (e) {
		if (e.keyCode == 13) {
			$('#search input[name=\'search\']').parent().find('button').trigger('click');
		}
	});

	// Menu
	$('#menu .dropdown-menu').each(function () {
		var menu = $('#menu').offset();
		var dropdown = $(this).parent().offset();

		var i = (dropdown.left + $(this).outerWidth()) - (menu.left + $('#menu').outerWidth());

		if (i > 0) {
			$(this).css('margin-left', '-' + (i + 10) + 'px');
		}
	});

	// What a shame bootstrap does not take into account dynamically loaded columns
	var cols = $('#column-right, #column-left').length; 
	if (cols == 2) { 
		$('#content .product-list').attr('class', 'product-layout product-grid col-lg-6 col-md-6 col-sm-12 col-xs-6');
	} else if (cols == 1) { 
		$('#content .product-list').attr('class', 'product-layout product-grid col-lg-4 col-md-6 col-sm-6 col-xs-6');
	} else { 
		$('#content .product-list').attr('class', 'product-layout product-grid col-lg-3 col-md-4 col-sm-4 col-xs-6');
	}

	// Checkout
	$(document).on('keydown', '#collapse-checkout-option input[name=\'email\'], #collapse-checkout-option input[name=\'password\']', function (e) {
		if (e.keyCode == 13) {
			$('#collapse-checkout-option #button-login').trigger('click');
		}
	});

	// tooltips on hover
	$('[data-toggle=\'tooltip\']').tooltip({
		container: 'body'
	});

	// Makes tooltips work on ajax generated content
	$(document).ajaxStop(function () {
		$('[data-toggle=\'tooltip\']').tooltip({
			container: 'body'
		});
	});
 
 

  
 
});


(function ($) {
	$('.date').datetimepicker({
		language: 'ru',
		pickTime: false
	});

	$('.datetime').datetimepicker({
		language: 'ru',
		pickDate: true,
		pickTime: true
	});

	$('.time').datetimepicker({
		language: 'ru',
		pickDate: false
	});

 

	    

	$('#review').delegate('.pagination a', 'click', function(e) {
		e.preventDefault();

		$('#review').fadeOut('slow');

		$('#review').load(this.href);

		$('#review').fadeIn('slow');
	});

	$('#review').load('index.php?route=product/product/review&product_id=42');

 
});  