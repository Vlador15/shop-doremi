 
 
 

async function searchUsers() { 
 
    let count = 0;
	getUsers(); 

  	function getUsers() {
		console.log('Start function') 	
  		$.ajax({
          	url: 'api/admin/users',
          	type: 'post',
          	data: 'count=' + count,
          	dataType: 'json',
          	success: function (json) {   
          		let statuses = ['Пользователь', 'Модератор', 'Администратор', 'Разработчик'];
          		let status_style = ['background: #ececec; color: #000;', 'background: #98eff3; color: #000;', 'background: #ec2424; color: #fff;', 'background: #8a1ade; color: #fff;'];

		        json.users.map((user, index) => {   
			        col = 
			          '<tr>' + 
                        '<td class="text-left" style="min-width: 150px;">' + 
                           '<a href="admin/users/'+user.id+'">'+user.name+'</a>' + 
                        '</td>' + 
                        '<td class="text-left" style="min-width: 100px;">' +  
                           	user.id + 
                        '</td> ' + 
                        // '<td class="text-left" style="min-width: 200px;"> ' + 
                        //    	user.email + 
                        // '</td>' +  
                        //'<td class="text-left" style="min-width: 150px;"> ' + 
                        //   	user.password  + 
                        //'</td>' + 
                        '<td class="text-left" style="min-width: 150px;"> ' + 
                           	user.phone  + 
                        '</td>' + 
                        '<td class="text-left" style="min-width: 100px;"> ' + 
                        	user.points + 
                        '</td>' + 
                        '<td class="text-left" style="min-width: 90px;">' + 
                        	user.regDateText +                                                                    
                        '</td> ' + 
                        '<td class="text-left" style="min-width: 150px;"><a href="'+user.referalUrl+'">'+user.referalUrl+'</a></td>' +  
                        '<td class="text-center">'+user.referals.length+'</td>' +  
                        '<td class="text-center" style="min-width: 150px; '+status_style[user.admin]+'">'+statuses[user.admin]+'</td>' +  

                        '<td class="text-center" style="min-width: 150px;">' +
	                    '    <a href="admin/users/delete/'+user.id+'" class="btn btn-danger" style="color: #fff; width: 100px; height: 30px;">' +
	                    '       <b>Удалить</b>' +
	                    '    </a> ' +
	                    '</td>' +

                    '</tr>'

			        $( '#loading' ).css("display", "none"); 
			        $( '#admin-table-users' ).append(col);  
	          	});  
	          	 

		        if (json.status) {
		        	count += 1; 
		        	getUsers(); 
	        	}
	        },
	        
	        error: function (xhr, ajaxOptions, thrownError) {
	            alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
	        }
    	}); 
  	}
 
}

 