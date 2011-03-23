App = function() {
    var canvas;
    var ctx;
    var timeoutId;
    var mouseDown = false;    
    var lastPoint;
    var signals = new Array(512);
    var fourierTransformedData = new Array(512);

    for (var x = 0; x < 512; x++) {
        signals[x] = 0;
        fourierTransformedData[x] = 0;
    }

    function main() {
        canvas = document.getElementById("canvas");
        if (!canvas.getContext) {
            alert("Couldn't get canvas object !");
        }

        ctx = canvas.getContext("2d");

        drawAxis();

        canvas.addEventListener("mousedown", function(e) { onMouseDown(e) }, false);
        canvas.addEventListener("mouseup", function(e) { onMouseUp(e) }, false);
        canvas.addEventListener("mousemove", function(e) { onMouseMove(e) }, false);
    }

    function drawAxis() {
        ctx.strokeStyle = "#000";
        ctx.beginPath();
        ctx.moveTo(0, 128);
        ctx.lineTo(512, 128);
        ctx.stroke();
    }

    function drawSignals() {
        ctx.fillStyle = "#08A";
        ctx.beginPath();
        ctx.moveTo(0, 128);
        for (var x = 0; x < 512; x++) {
            ctx.lineTo(x, signals[x] + 128);
            ctx.lineTo(x, 128);
            ctx.lineTo(x, signals[x] + 128);
        }
        ctx.fill();
    }

    function drawFourierTransform(k) {
        var ck = 0;
        var sk = 0;

		if (k == 0) {
        	for (var x = 0; x < 512; x++) {
            	ck += signals[x];
        	}

        	ck *= (1 / 512);
						
        	for (var x = 0; x < 512; x++) {
           		fourierTransformedData[x] += ck;
			}
		} else {
			var t = 2 * Math.PI * k / 512;

        	for (var x = 0; x < 512; x++) {
            	var tx = t * x;
            	ck += signals[x] * Math.cos(tx);
            	sk += signals[x] * Math.sin(tx);
        	}

        	ck *= (2 / 512);
        	sk *= (2 / 512);
	
        	for (var x = 0; x < 512; x++) {
				var tx = t * x;
            	fourierTransformedData[x] += ck * Math.cos(tx) + sk * Math.sin(tx);
        	}
		}

        ctx.clearRect(0, 0, 512, 256);
        drawAxis();
        drawSignals();

        ctx.strokeStyle = "#F00";
        ctx.beginPath();
        ctx.moveTo(0, 128);
        for (var x = 0; x < 512; x++) {
            ctx.lineTo(x, fourierTransformedData[x] + 128);
        }
        ctx.stroke();

        ctx.font = "20pt Verdana";
        ctx.fillStyle = "#F00";
        ctx.fillText("k=" + k, 0, 20);

        if (k < 255)
            timeoutId = setTimeout(function() { drawFourierTransform(k+1); }, 100);
    }

    function getMousePoint(e) {
        return { x: e.clientX - canvas.offsetLeft, y: e.clientY - canvas.offsetTop } 
	}

    function onMouseDown(e) {
        mouseDown = true;

        lastPoint = getMousePoint(e);
        
        for (var x = 0; x < 512; x++) {
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
                signals[x] = lastPoint.y + dy * ((x - lastPoint.x) / dx) - 128;
            }

            ctx.clearRect(0, 0, 512, 256);
            drawAxis();
            drawSignals();

            lastPoint = point;
        }
    }

    return { main: main };
}();