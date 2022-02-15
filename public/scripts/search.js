 
 
 

async function searchProducts(query, lengthCatalog) { 
  	console.log(query)
  	if (query) {

	    let status = true,
	      	category = 0,
	      	count = 0;
 
	    for (let i=0; i<lengthCatalog; i++) {

	      	$.ajax({
	          	url: 'api/search',
	          	type: 'post',
	          	data: 'search=' + query + '&category=' + i,
	          	dataType: 'json',
	          	success: function (json) {  
			        count += 1;  
			        json.products.map((item, index) => {  
				        col = 
				          '<div class="product-layout product-grid col-lg-3 col-md-4 col-sm-4 col-xs-6" style="padding-right: 5px; padding-left: 5px;">' +
				                  '<div class="product-thumb">' +
				                     '<div class="image">' +
				                        '<a href="/catalog/'+item.link+'/'+item.id+'">' +
				                        '<img src="'+item.thumb_photo+'" alt="'+item.title+'" title="'+item.title+'" class="img-responsive" style="height: 100%;"/>' +
				                        '</a>' +   
				                     '</div>' +
				                     '<div class="caption" style="min-height: 150px;">' +
				                       ' <div class="price">' +
				                           '<span class="price-main">'+item.price_text+'</span>' + 
				                        '</div>' +
				                        '<a href="/catalog/'+item.link+'/'+item.id+'" class="product-name">'+item.title+'</a>' +  
				                     '</div>' +

				                    '<div class="button-group__btn" style="text-align: center;">' + 
				                    	'<a href="/catalog/'+item.link+'/'+item.id+'" class="btn btn-danger btn-lg" style="width: 80%; border: 1px solid #000; color: #000; background-color: #FFDF00">Посмотреть товар</a>' +
				                    '</div>' +	

				                 '</div>' +
				               '</div>';

				        $('#loading').css("display", "none");
				        $('#noresult').css("display", "none");
				        $( '#products' ).append(col);  
		          	}); 
		          	
		          	let length = $('.product-layout').length; 
			        if (json.last && !length) { 
				        $('#loading').css("display", "none");
			        	$('#noresult').css("display", "block");   
			        } 
		        },
		        
		        error: function (xhr, ajaxOptions, thrownError) {
		            alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
		        }
	    	});  
	    };  
	}  
}

    /*

  let div = document.querySelector('#products');
   
  var col;

  // сначала после ввода поиска переходим get на страницу поиска. далее передаем параметр и через ajax получаем список фильтрации и загружаем
  console.log(products);

  products.map((item, index) => { 
    col = 
      '<div class="product-layout product-list col-lg-3 col-md-4 col-sm-4 col-xs-4" style="padding-right: 5px; padding-left: 5px;">' +
              '<div class="product-thumb">' +
                 '<div class="image">' +
                    '<a href="/catalog/'+item.link+'/'+item.id+'">' +
                    '<img src="'+item.thumb_photo+'" alt="'+item.title+'" title="'+item.title+'" class="img-responsive" style="height: 100%;"/>' +
                    '</a>' +   
                 '</div>' +
                 '<div class="caption">' +
                   ' <div class="price">' +
                       '<span class="price-main">'+item.price_text+'</span>' + 
                    '</div>' +
                    '<a href="/catalog/'+item.link+'/'+item.id+'" class="product-name">'+item.title+'</a>' +             
                    '<div class="button-group__flex">' + 
                       '<div class="button-group__btn" style="text-align: center; ">' +
                          '<button id="btn-cart" type="button" class="btn btn-danger btn-lg" title="Купить" onclick='cart.add(item.link, item.id)'>' +
                             '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="icon">' +
                                '<circle cx="9" cy="21" r="1"></circle>' +
                                '<circle cx="20" cy="21" r="1"></circle>' +
                                '<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>' +
                            '</svg>' +
                          '</button>' +
                       '</div>' +
                    '</div>' +
                 '</div>' +
             '</div>' +
           '</div>';

    $( '#products' ).append(col);
  })  */