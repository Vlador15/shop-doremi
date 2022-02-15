
$(function() {
	
	$( 'table#sort thead tr th' ).on('click', function() { 
	    var index = $(this).index();
	    console.log(index)

	    $( 'table#sort thead tr th:eq(' + index + ')' ).siblings().removeAttr("style")

		$(this).css('background', '#ffbc00')
	});

	 
 
})

 
 
async function getResponse() {
	let response = await fetch('http://185.244.172.161:3000/api/users');
	let users = await response.json();

	let tab = document.querySelector('#sort');
   
	var col;

	var adm = ['Пользователь', 'Модератор', 'Админ'];
	var adm_colors = ['guest-role', 'moder-role', 'admin-role'];
	var _sex = ['Женский', 'Мужской'];

	 
	$('#loading').css("display", "none");
	$('#main_table').removeAttr("style");

	users.map((user, index) => { 
		col = `<tr> 
			<td id="tab-number">${index+1}</td>
			<td id="tab-color">
		      	<a href="https://vk.com/id${user.vk_id}" target="_blank"><nav class="vk">${user.name}</nav></a>
		    </td> 	 

		    <td id="tab-color">${_sex[user.sex-1]} </td>
      		<td id="tab-color" class="top-points">${user.points}</td>
      		<td id="tab-color">${user.balance}</td>

      		<td id="tab-color">${user.likes}</td>
      		<td id="tab-color">${user.comments}</td>

      		<td id="tab-color"><nav class="${adm_colors[user.admin]}">${adm[user.admin]}</nav></td>

      		${user.ban == true ? `<td class="text-light bg-danger"> Есть </td>` : `<td class="text-light bg-success"> Нет</td>`}

      		<td id="tab-color">   
				<a href="edit/user/${user.vk_id}">Открыть</a> 
			</td>

			<td id="tab-color">   
				<a class="btn btn-danger" href="delete/user/${user.vk_id}">Удалить</a> 
		  	</td>

		</tr>`;

		$( 'table#sort tbody' ).append(col);
	})  
}

getResponse();
 