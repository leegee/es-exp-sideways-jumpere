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
        this.el     = null;
        this.dom    = null;
        this.sides = {
            left:   null,
            right:  null,
            top:    null,
            bottom: null
        };
        this.mineSquare = 20;
        this.mineSquareHalf = this.mineSquare / 2;
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

    Land.prototype.mine = function (x, y) {
        this.ctx.clearRect(
            Math.abs(this.x) + x - this.mineSquareHalf,
            Math.abs(this.y) + y - this.mineSquareHalf,
            this.mineSquare, this.mineSquare
        );

        // this.ctx.globalCompositeOperation = 'destination-out';
        // this.ctx.beginPath();
        // this.ctx.arc(
        //     Math.abs(this.x) + x - this.mineSquareHalf,
        //     Math.abs(this.y) + y - this.mineSquareHalf,
        //     this.mineSquare,
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
