(function() {
    var pressedKeys = {};
    //var lastKeyPressed;
    function setKey(event, status) {
        var code = event.keyCode;
        var key;

        //console.log(code);

        switch(code) {
        case 32:
			event.preventDefault();
            key = 'SPACE'; break;
        case 37:
			event.preventDefault();
            key = 'LEFT'; break;
        case 38:
			event.preventDefault();
            key = 'UP'; break;
        case 39:
			event.preventDefault();
            key = 'RIGHT'; break;
        case 40:
			event.preventDefault();
            key = 'DOWN'; break;

		case 18:
			event.preventDefault();
			key = 'ALT'; break;

        default:
            // Convert ASCII codes to letters
            key = String.fromCharCode(code);
        }

        //lastKeyPressed = key;

		//console.log(key);

        pressedKeys[key] = status;
    }


	// Listen when the first Canvas element on the page is focused. If none exist, get the page itself.
	//var keyPressFocusedTarget = document;
	//if (document.getElementsByTagName('canvas')[0])
	//	keyPressFocusedTarget = document.getElementsByTagName('canvas')[0];
	//console.log(keyPressFocusedTarget);


    document.addEventListener('keydown', function(e) {
        setKey(e, true);
    });

    document.addEventListener('keyup', function(e) {
        setKey(e, false);
    });

    window.addEventListener('blur', function() {
        pressedKeys = {};
    });

    window.input = {
        isDown: function(key) {
            return pressedKeys[key.toUpperCase()];
        }
    };
})();
