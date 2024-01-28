$(document).ready(function() {
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