$(document).ready(function(){

  $('input[type="tel"]').inputmask({"mask":"+7 (999) 999-99-99"});
 
  $('.js-form-validate').submit(function () {
    var form = $(this);
    var field = []; 
    var data = {};
 

    form.find('input[data-validate]').each(function () {
      field.push('input[data-validate]');
      var value = $(this).val(),
          line = $(this).closest('.some-form__line'); 

      for(var i=0;i<field.length;i++) {
        if( !value ) {
          line.addClass('some-form__line-required');
          setTimeout(function() {
            line.removeClass('some-form__line-required')
          }.bind(this),7000);
          event.preventDefault();
        }

        if ( this.name == 'phone' ) {
          value = value.replace('(', '').replace(')', '').replace(/-+/, '').replace(/\s+/g, '').replace(/_+/g, '');
        }

        data[this.name] = {
          value: value,
          obj: $(this).closest('.some-form__line'),
          this: this
        };  
      }  
    });




    console.log(data);

    if ( data['name'].value.length < 5 || data['name'].value.length > 50 ) err(data['name']);
    if ( data['address'].value.length < 3 || data['address'].value.length > 70 ) err(data['address']);
    if ( data['phone'].value.length != 12 ) err(data['phone']);

    if ( data['city'].value.length < 2 || data['city'].value.length > 50 ) err(data['city']); 
 
 

    function err(obj) {
      let line = obj.obj; 
       
      line.addClass('some-form__line-required'); 

      const el = document.getElementById('data'); 
      el.scrollIntoView({block: "start", behavior: "smooth"}) 

      setTimeout(function() {
          line.removeClass('some-form__line-required') 
      }, 7000);
      event.preventDefault();
    } 
  });
 
});