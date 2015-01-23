'use strict';

define(['jquery'], function (jquery) {

/*  An image on a canvas.
    The canvas is moved by CSS, the canvas is editable.
    Faster than repainting a large iamge eery frame.
*/
    var Land = function (args) {
        console.debug('Land.constructor enter ', arguments);
        var self    = this;
        this.ready  = false;
        this.cellSize = 26;
        this.cellSizeHalf = this.cellSize/2;
        this.transparentThreshold = 127;
        this.el     = null;
        this.dom    = null;
        this.sides = {
            left:   null,
            right:  null,
            top:    null,
            bottom: null
        };
        this.scale = {
            x: 1,
            y: 1
        };
        this.x = this.y = 0;
        this.img = null;
    };

    Land.prototype.load = function () {
        var self = this;

        this.img = new Image();
        this.img.src = '/img/passmore-fg.png';

        return new Promise ( function (resolve, reject) {
            self.img.onload = function() {
                console.debug('Loaded Land.img');
                self.el = jquery(
                    '<canvas id="land"'
                    +'width="'+self.img.width+'" height="'+self.img.height+'" '
                    +'style="'
                        +'width:'+self.img.width+'px;height:'+self.img.height+'px;'
                    +'"/>'
                );
                jquery( document.body ).append( self.el );
                self.dom = self.el.get(0);
                self.ctx = self.dom.getContext('2d');
                self.ctx.drawImage( self.img, 0, 0 );

                self.sides.left = parseInt(
                    window.innerWidth / 3
                );
                self.sides.right = parseInt(
                    window.innerWidth - ( window.innerWidth / 3 )
                );

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

        if (this.x < window.innerWidth - this.img.width) {
            this.x -= mx;
            this.scrolled.x = false;
        }
        else if (this.x > 0) {
            this.x = 0;
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

        this.dom.style.transform="translate("+this.x+"px,"+this.y+"px)";
    };

    Land.prototype.mine = function (atX,atY, p2x,p2y) {
        var mineX, mineY;

        if (p2x){
            var angleRad = Math.atan2(atY - p2y, atX - p2x);
            mineX = atX + parseInt(
                this.cellSize * Math.cos( angleRad ) * -1
            );
            mineY = atY + parseInt(
                this.cellSize * Math.sin( angleRad ) * -1
            );
        }

        else {
            mineX = atX;
            mineY = atY;
        }

        mineX = this.confine(mineX);
        mineY = this.confine(mineY);

        var x = Math.abs(this.x) + mineX; //  - this.cellSizeHalf;
        var y = Math.abs(this.y) + mineY; // - this.cellSizeHalf;

        var imgd = this.ctx.getImageData( x, y, this.cellSize, this.cellSize );
        var imgd8 = new Uint8Array( imgd.data.buffer );
        var r=-1, g=-1, b=-1;
        for (var i=0; i<imgd8.length; i+=4){
            if (imgd8[i+3] < this.transparentThreshold) continue;
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
    }

    Land.prototype.confine = function (p) {
        var rv = (parseInt( p / this.cellSize) * this.cellSize); // + this.cellSizeHalf;
        // console.log('Confine %d to %d', p, rv);
        return rv;
    };

    Land.prototype.isClear = function (x,y, w,h){
        x = (this.x * -1) + x;
        y = (this.y * -1) + y;
        var imgd = this.ctx.getImageData( x, y, w, h );
        var imgd8 = new Uint8Array( imgd.data.buffer );
        var clear = 0;
        var shouldBeClear = imgd8.length/8;

        // Check only transparent pixels
        var px = 0;
        for (var i=3; i < imgd8.length; i+=4){
            if (imgd8[i] < 127){
                clear ++;
                if (clear === shouldBeClear) break;
            }
            px ++;
        }

        return clear === shouldBeClear; // Clear if 50% clear
    }

    return Land;
});
