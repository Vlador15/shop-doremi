

function openForm() {
  document.getElementById("chat").style.display = "block";
  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight; 
}

function closeForm() {
  document.getElementById("chat").style.display = "none";
}
 
$(document).ready(function() {
 	socket = io.connect(); 	
	socket.on("new_message", function (data) {  
		let color = !data.user ? 'danger' : 'darker';
		let tag = !data.user ? '<p><b>Администратор:</b></p>' : '<p><b>Вы:</b></p>';
		document.getElementById("messages").innerHTML += 
		'<div class="chat-container '+color+'">'+ 
	        tag +
	        '<p>'+data.message+'</p>'+
	        '<span class="time-left">'+data.date+'</span>'+
	    '</div>';
	    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight; 
	}); 

	
	socket.on('update_chat', (data) => {
		let arr = data.arr;   
		if (arr) {
			for (let i=0; i<arr.length; i++) { 

				let color = !arr[i].user ? 'danger' : 'darker';
				let tag = !arr[i].user ? '<p><b>Администратор:</b></p>' : '<p><b>Вы:</b></p>';
				document.getElementById("messages").innerHTML +=  
				'<div class="chat-container '+color+'">'+  
	        		tag +
			        '<p>'+arr[i].message+'</p>'+
			        '<span class="time-left">'+arr[i].date+'</span>'+
			    '</div>';
			} 
		}  
	}); 


	$("#send_message").on("click", function() {

		msg = $("#message").val();
		$("#message").val("");
		if ( msg.length > 0) {
			socket.emit('new_message', { message: msg }) 
		} 
	});

	socket.on('reconnect_error', (error) => { 
		socket.disconnect()
	}); 
})

 
 

 

 