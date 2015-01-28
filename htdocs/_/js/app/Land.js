'use strict';

define(['jquery', 'app/Grid'], function (jquery, Grid) {

/*  An image on a canvas.
    The canvas is moved by CSS, the canvas is editable.
    Faster than repainting a large iamge eery frame.
*/
    var Land = function (args) {
        console.debug('Land.constructor enter ', arguments);
        var self    = this;
        this.ready  = false;
        this.cellSize = 20;
        this.cellSizeHalf = this.cellSize/2;
        this.transparentThreshold = 200;
        this.saturationPc = 70;
        this.lightnessPc  = 70;
        this.el     = null;
        this.dom    = null;
        this.sides = {
            left:   null,
            right:  null,
            top:    null,
            bottom: null
        };
        this.bounds = {
            left: null,
            right: null
        };
        this.scale = {
            x: 1,
            y: 1
        };
        this.x = this.y = 0;
        this.img = null;
        this.sides = {
            left: parseInt(
                window.innerWidth / 3
            ),
            right: parseInt(
                window.innerWidth - ( window.innerWidth / 3 )
            )
        };
    };

    Land.prototype.load = function () {
        var self = this;

        this.img = new Image();
        this.img.src = '/img/passmore-fg.png';

        return new Promise ( function (resolve, reject) {
            self.img.onload = function() {
                console.debug('Loaded Land.img');

                self.width = self.img.width + (2 * self.sides.left);
                self.height = self.img.height + (2 * self.sides.left);

                self.el = jquery(
                    '<canvas id="land"' +
                    'width="'+self.width+'" height="'+self.height+'" ' +
                    'style="' +
                        'width:'+self.width+'px;height:'+self.height+'px;'+
                    '"/>'
                );
                jquery( document.body ).append( self.el );
                self.dom = self.el.get(0);
                self.ctx = self.dom.getContext('2d');
                self.ctx.drawImage(
                    self.img,
                    self.sides.left,
                    0
                );
                self.ctx.rect(
                    self.sides.left,
                    0,
                    self.img.width,
                    self.img.height
                );
                self.ctx.stroke();

                // self.grid = new Grid({
                //     cellSize: self.cellSize,
                //     width: self.width,
                //     height: self.height
                // });

                self.bounds.left  = self.sides.left;
                self.bounds.right = (self.width + self.sides.left) * -1;

                self.x = (this.width/2) * -1;
                self.y = 0;
                self.render();
                resolve();
            };
        });
    };

    Land.prototype.moveBy = function (x, y) {
        this.scrolled = { x: false, y: false };

        if (!x && !y) return;

        x = x || 0;
        y = y || 0;

        this.scrolled = { x: true, y: true };

        var mx = this.scale.x * x * -1,
            my = this.scale.y * y * -1;
        this.x = parseInt( this.x + mx );
        this.y = parseInt( this.y + my );

        if (this.x < this.bounds.right ) { // window.innerWidth - this.img.width) {
            // this.x -= mx;
            this.x = this.bounds.right + mx;
            this.scrolled.x = false;
        }
        else if (this.x > this.bounds.left){ // 0) {
            this.x = this.bounds.left - mx;
            this.scrolled.x = false;
        }

        if (this.y < window.innerHeight - this.img.height) {
            this.y = window.innerHeight - this.img.height;
            this.scrolled.y = false;
        }
        else if (this.y > 0) {
            this.y = 0;
            this.scrolled.y = false;
        }

        this.render();
    };

    Land.prototype.render = function () {
        this.dom.style.transform="translate("+this.x+"px,"+this.y+"px)";
    };


    Land.prototype.getSquare = function (atX,atY, p2x,p2y) {
        var angleRad = Math.atan2(atY - p2y, atX - p2x);
        var x = atX + parseInt(
                this.cellSize * Math.cos( angleRad ) * -1
            ),
            y = atY + parseInt(
                this.cellSize * Math.sin( angleRad ) * -1
            );

        return [this.confine(x), this.confine(y)];
    };


    Land.prototype.build = function (atX,atY, p2x,p2y, rgb) {
        var buildX, buildY;

        if (p2x){
            var angleRad = Math.atan2(atY - p2y, atX - p2x);
            var square = this.getSquare(atX,atY, p2x,p2y);
            buildX = square[0];
            buildY = square[1];
        }

        else {
            buildX = atX;
            buildY = atY;
        }

        var x = Math.abs(this.x) + buildX;
        var y = Math.abs(this.y) + buildY;

        // if (this.isClear( x,y, this.cellSize, this.cellSize)){
        //     console.log("OK");
        // }

        this.ctx.fillStyle = rgb;
        this.ctx.fillRect( x, y, this.cellSize, this.cellSize );

        return true;
    };


    Land.prototype.mine = function (atX,atY, p2x,p2y) {
        var mineX, mineY;

        if (p2x){
            var angleRad = Math.atan2(atY - p2y, atX - p2x);
            var square = this.getSquare(atX,atY, p2x,p2y);
            mineX = square[0];
            mineY = square[1];
        }

        else {
            mineX = atX;
            mineY = atY;
        }

        var x = Math.abs(this.x) + mineX; //  - this.cellSizeHalf;
        var y = Math.abs(this.y) + mineY; // - this.cellSizeHalf;

        var imgd = this.ctx.getImageData( x, y, this.cellSize, this.cellSize );
        var imgd8 = new Uint8Array( imgd.data.buffer );
        var r=-1, g=-1, b=-1;
        for (var i=0; i<imgd8.length; i+=4){
            if (imgd8[i+3] <= this.transparentThreshold) {
                continue;
            }
            r += imgd8[i];
            g += imgd8[i+1];
            b += imgd8[i+2];
        }
        if (r>-1){
            r /= imgd8.length/4;
            g /= imgd8.length/4;
            b /= imgd8.length/4;
        }

        this.ctx.clearRect(
            x, y, this.cellSize, this.cellSize
        );

        return r===-1? null : [r,g,b];

        // this.ctx.globalCompositeOperation = 'destination-out';
        // this.ctx.beginPath();
        // this.ctx.arc(
        //     Math.abs(this.x) + x - this.cellSizeHalf,
        //     Math.abs(this.y) + y - this.cellSizeHalf,
        //     this.cellSize,
        //     0, Math.PI*2, false
        // );
        // this.ctx.closePath();
        // this.ctx.fill();
    };

    Land.prototype.getClearMatrix = function (x,y, w,h){
        x = (this.x * -1) + x;
        y = (this.y * -1) + y;
        var rv = [ [false,false,false], [false,false,false], [false,false,false] ];
        var halfW = w/2;
        var halfH = h/2;
        var thirdW = w/3;
        var thirdH = h/3;
        var imgd = this.ctx.getImageData( x, y, w, h );
        console.log(x,y);
        var imgd8 = new Uint8Array( imgd.data.buffer );

        // Check only transparent pixels
        var px = 0;
        for (var i=3; i < imgd8.length; i+=4){
            if (imgd8[i] < 127){
                rv[ parseInt( (px % w) / thirdW ) ][ parseInt( (px / w) / thirdH ) ] = true;
            }
            px ++;
        }

        return rv;
    };

    Land.prototype.confine = function (p) {
        var rv = (parseInt( p / this.cellSize) * this.cellSize); // + this.cellSizeHalf;
        // console.log('Confine %d to %d', p, rv);
        return rv;
    };

    Land.prototype.isClear = function (x,y, w,h, debug){
        x = (this.x * -1) + x;
        y = (this.y * -1) + y;

        var imgd = this.ctx.getImageData( x, y, w, h );
        var imgd8 = new Uint8Array( imgd.data.buffer );
        var clear = 0;
        var shouldBeClear = imgd8.length/8;

        if (debug) {
            console.log(imgd8);
        }

        var px = 0;
        for (var i=3; i < imgd8.length; i+=4){
            if (imgd8[i] <= this.transparentThreshold){
                clear ++;
                if (clear === shouldBeClear) break;
            }
            px ++;
        }

        if (debug){
            this.debug = [x,y,w,h];
            console.log('Clear / Should Be = ', clear, shouldBeClear);
        }

        return clear >= shouldBeClear; // Clear if 50% clear
    };

    Land.prototype.night = function () {
        var alpha = (this.transparentThreshold/255) - 0.05;
        alert(alpha);
        this.ctx.save();
        this.ctx.globalCompositeOperation = "multiply";
        this.ctx.fillStyle = "rgba(0,0,0,"+( alpha )+")";
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.restore();
    };

    Land.prototype.light = function (x,y,lightSize) {

        this.ctx.save();

        lightSize = lightSize || 250;
        var radialGradient = this.ctx.createRadialGradient(
            x + lightSize / 2,
            y + lightSize / 2,
            0,
            x + lightSize / 2,
            y + lightSize / 2,
            lightSize / 2
        );
        radialGradient.addColorStop(0, "rgba(255, 165, 0, 0.7)");
        radialGradient.addColorStop(1, "transparent");
        this.ctx.globalCompositeOperation = "screen";
        this.ctx.fillStyle = radialGradient;
        this.ctx.fillRect(x, y, lightSize, lightSize);
        this.ctx.restore();
    };

    return Land;
});
