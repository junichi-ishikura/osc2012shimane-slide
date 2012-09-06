var log = console.log.bind(console);
// Client
var socket = io.connect();
var cameras = document.getElementsByName("camera"); 

$('#fontbomb').mousemove(function(e) {
    socket.emit('mouse onmove', {
      	x: e.pageX,
      	y: e.pageY
    });
});

socket.on('connect', function() {
  	log('connect');

	// move slide
  	socket.on('go', function(to) {
    	$.deck('go', to);
  	});
  	$(document).bind('deck.change', function(event, from, to) {
    	if (from != to) socket.emit('go', to);
  	});

	socket.on('img push', function (data) {
    	//image.src = data.img;
    	for(var i=0; i<cameras.length; i++) {
    		cameras[i].src = data.img;
   		}
    	//cameras.each(function(camera){
    	//	camera.src = data.img;
    	//});
	});
		
  	socket.on('viewer', function(num) {
    	$('span.deck-status-viewer').text('(' + num + ')');
  	});
  	
  	socket.on('mouse onmove', function(data) {
    	var cursor = document.getElementById(data.sid);
    	if (!cursor) {
      		cursor = $('<img>');
      		cursor.attr('class', 'cursor');
      		cursor.attr('id', data.sid);
      		cursor.attr('src', 'http://ishikura.osc2012.jit.su/images/cursor.png');
      		cursor.css('position', 'absolute');
      		cursor.css('width', '18px');
      		cursor.css('height', '24px');
      		$('#fontbomb').append(cursor);
    	}
    	cursor = $(cursor);
    	cursor.css('left', data.x + 'px');
    	cursor.css('top', data.y + 'px');
    	cursor.show();
  	});

    socket.on('mouse hide', function(id) {
    	var cursor = $('#' + id);
    	if (cursor.attr('id')) {
    		cursor.hide();
    	}
    });

    socket.on('dropbomb', function(data) {
      	_explosion.bombs.push(new Bomb(data.x, data.y));
      	if (window.FONTBOMB_PREVENT_DEFAULT) {
        	return event.preventDefault();
      	}
    });

    socket.on('reset', function() {
      	_explosion.reset();
    });

  	socket.on('disconnect', function() {
    	log('disconnected');
  	});
});

$(function() {
});
