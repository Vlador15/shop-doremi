$(document).ready(function(){

  $('input[type="tel"]').inputmask({"mask":"8 (999) 999-99-99"});
 
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
          }.bind(this),4000);
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

    //if ( data['firstname'].value.length < 2 || data['firstname'].value.length > 32 ) err(data['firstname']);
    //if ( data['lastname'].value.length < 2 || data['lastname'].value.length > 32 ) err(data['lastname']);
    if ( data['name'].value.length < 5 || data['name'].value.length > 42 ) err(data['name']);
    if ( data['phone'].value.length != 11 ) err(data['phone']);

    if ( data['password'].value.length < 4 || data['password'].value.length > 20 ) err(data['password']);
    //if ( data['password2'].value.length < 4 || data['password2'].value.length > 20 ) err(data['password2']);
    //if ( data['password'].value != data['password2'].value ) err(data['password2']);


     
    $('input[type=checkbox]').each(function () {
        if ($(this).prop('checked')) {
            console.log('Выбрал')
        } else {
          err({
            obj: $(this).closest('.some-form__line') 
          });
        }
    });




    function err(obj) {
      let line = obj.obj; 
       
      line.addClass('some-form__line-required'); 
      setTimeout(function() {
          line.removeClass('some-form__line-required') 
      }, 4000);
      event.preventDefault();
    }
 
    console.log('msg') 
  });
 
});