var socket = io.connect('http://localhost:3000');
var canvas = document.getElementById('pictures');
var context = canvas.getContext('2d');

context.lineWidth = 10;

context.beginPath();
context.moveTo(3456/2, 0);
context.lineTo(3456/2,2304);
context.moveTo(0,2304/2);
context.lineTo(3456, 2304/2);
context.stroke();
/*
for (var i = 0; i < 3456; i+=100) {
    
    context.moveTo(i,0);
    context.lineTo(i,2304);
    
}
for (var i = 0; i < 3456; i+=100) {
    
    context.moveTo(0, i);
    context.lineTo(3456, i);
    
}
context.stroke();
*/

var drawImage = function(img, spec) {
    context.strokeStyle="#FF0000";
    
    console.log(img);
    
    console.log('Received spec'); console.log(spec);
    var centerX = Math.round(0.5 * spec.width);
    var centerY = Math.round(0.5 * spec.height);

    console.log("center: " + centerX + "/" + centerY);

    // translate to the middle of the image
    context.translate(spec.left + centerX, spec.top + centerY);
    // rotate the canvas by the rotation
    context.rotate((spec.rotate + 180) * Math.PI / 180);
    // translate to the top/left of the image
    context.translate(-1 * centerX, -1 * centerY);// 0.5*spec.width, -0.5*spec.height);
    context.drawImage(img, 0, 0, spec.width, spec.height);
    context.setTransform(1, 0, 0, 1, 0, 0);
    socket.emit('drew-image');
}

socket.on("image", function(info) {
    console.log('received');
    console.log(info.spec);
    var img = new Image();
    img.onload = function() {
        socket.emit('received-image');
        drawImage(img, info.spec);
    };
    img.src = 'data:image/jpeg;base64,' + info.image;
    //drawImage(img, info.spec);
});

socket.on('clear', function() {
    context.clearRect(0,0,3456,2304);
})

$(document).ready(function() {
    console.log("ready");
    $('#button').click(function() {
        console.log("next");
        socket.emit('next');
    });

    $('#save').click(function() {
        console.log("Save");
        socket.emit('save', {image: canvas.toDataURL('image/jpeg', 0.8)});
    });
});



