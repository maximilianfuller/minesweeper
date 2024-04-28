$(document).ready(function() {
	$('button.quickmatch').click(function(e) {
		console.log("CLICK")
		$.post("quickmatch", {}, function( data ) {
			console.log("quickmatch sent")
			let url = document.URL.replace('http', 'ws');
			const webSocket = new WebSocket(url);
			console.log(url)
			webSocket.onmessage = (event) => {
				location.assign(event.data);
			}
		});  
    });
	$('button.create').click(function(e) {
		$.post("create", {"config": $(this).html()}, function( data ) {
			location.assign(data);
		});  
    });
	$('button.watch').click(function(e) {
		window.location.href = $(this).html();
    });
	
});

function getUuid() {
	return crypto.randomUUID();
}