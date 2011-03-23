App = function() {
    var canvas;
    var ctx;
    var timeoutId;
    var mouseDown;
    var lastPoint;
    var signals;
    var fourierTransformedData;

    function main() {
        canvas = document.getElementById("canvas");
        if (!canvas.getContext) {
            alert("Couldn't get canvas object !");
        }

		signals = new Array(canvas.width);
		fourierTransformedData = new Array(canvas.width);

	    for (var x = 0; x < canvas.width; x++) {
	        signals[x] = 0;
	        fourierTransformedData[x] = 0;
	    }

        ctx = canvas.getContext("2d");

        for (var x = 0; x < canvas.width; x++) {
            signals[x] = canvas.width/4 - (x % (canvas.width/2));
        }
        timeoutId = setTimeout(function() { drawFourierTransform(0); }, 100);
              
        canvas.addEventListener("mousedown", function(e) { onMouseDown(e) }, false);
        canvas.addEventListener("mouseup", function(e) { onMouseUp(e) }, false);
        canvas.addEventListener("mousemove", function(e) { onMouseMove(e) }, false);
    }

    function drawAxis() {
        ctx.strokeStyle = "#000";
        ctx.beginPath();
        ctx.moveTo(0, canvas.height/2);
        ctx.lineTo(canvas.width, canvas.height/2);
        ctx.stroke();
    }

    function drawSignals() {
        ctx.fillStyle = "#08A";
        ctx.beginPath();
        ctx.moveTo(0, canvas.height/2);
        for (var x = 0; x < canvas.width; x++) {
            ctx.lineTo(x, signals[x] + canvas.height/2);
            ctx.lineTo(x, canvas.height/2);
            ctx.lineTo(x, signals[x] + canvas.height/2);
        }
        ctx.lineTo(canvas.width-1, canvas.height/2);
        ctx.fill();
    }

    function drawFourierTransform(k) {
        var ck = 0;
        var sk = 0;

		if (k == 0) {
        	for (var x = 0; x < canvas.width; x++) {
            	ck += signals[x];
        	}

        	ck *= (1 / canvas.width);
						
        	for (var x = 0; x < canvas.width; x++) {
           		fourierTransformedData[x] += ck;
			}
		} else {
			var t = 2 * Math.PI * k / canvas.width;

        	for (var x = 0; x < canvas.width; x++) {
            	var tx = t * x;
            	ck += signals[x] * Math.cos(tx);
            	sk += signals[x] * Math.sin(tx);
        	}

        	ck *= (2 / canvas.width);
        	sk *= (2 / canvas.width);
	
        	for (var x = 0; x < canvas.width; x++) {
				var tx = t * x;
            	fourierTransformedData[x] += ck * Math.cos(tx) + sk * Math.sin(tx);
        	}
		}

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawAxis();
        drawSignals();

        ctx.strokeStyle = "#F00";
        ctx.beginPath();
        ctx.moveTo(0, canvas.height/2);
        for (var x = 0; x < canvas.width; x++) {
            ctx.lineTo(x, fourierTransformedData[x] + canvas.height/2);
        }
        ctx.stroke();

        ctx.font = "20pt Verdana";
        ctx.fillStyle = "#F00";
        ctx.fillText("k=" + k, 0, 20);

        if (k < canvas.width/2 - 1)
            timeoutId = setTimeout(function() { drawFourierTransform(k+1); }, 100);
    }

    function getMousePoint(e) {
        return { x: e.clientX - canvas.offsetLeft, y: e.clientY - canvas.offsetTop } 
	}

    function onMouseDown(e) {
        mouseDown = true;

        lastPoint = getMousePoint(e);
        
        for (var x = 0; x < canvas.width; x++) {
            signals[x] = 0;
            fourierTransformedData[x] = 0;
        }

		clearTimeout(timeoutId);
    }

    function onMouseUp(e) { 
        if (mouseDown) {
            mouseDown = false;
            timeoutId = setTimeout(function() { drawFourierTransform(0); }, 100);
        }
    }

    function onMouseMove(e) {
        var point = getMousePoint(e);
        if (mouseDown) {
            var dy = point.y - lastPoint.y;
            var dx = point.x - lastPoint.x;
            
            var inc = dx > 0 ? 1 : -1;

            for (var x = lastPoint.x; x != point.x; x += inc) {
                signals[x] = lastPoint.y + dy * ((x - lastPoint.x) / dx) - canvas.height/2;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawAxis();
            drawSignals();

            lastPoint = point;
        }
    }

    return { main: main };
}();