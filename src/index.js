$(document).ready(function() {
	$('button').click(function(e) {
		$.post("create", {"config": $(this).html()}, function( data ) {
			location.assign(data);
		});  
    });
});

function getUuid() {
	return crypto.randomUUID();
}