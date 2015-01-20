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

                self.ctx = self.el.get(0).getContext('2d');
                self.ctx.drawImage( self.img, 0, 0 );
                self.imageData = self.ctx.createImageData(
                    self.img.width,
                    self.img.height
                );

                self.blankSpace = self.ctx.createImageData(1,1);
                self.blankSpace.data[0] = 1;
                self.blankSpace.data[1] = 2;
                self.blankSpace.data[2] = 255;
                self.blankSpace.data[3] = 255;
                // data = [255,255,255,255];

                self.sides.left = parseInt(
                    window.innerWidth / 3
                );
                self.sides.right = parseInt(
                    window.innerWidth - ( window.innerWidth / 3 )
                );
                self.sides.top = parseInt(
                    window.innerHeight / 3
                );
                self.sides.bottom = parseInt(
                    window.innerHeight - ( window.innerHeight / 3 )
                );
                self.render();
                resolve();
                // reject( new Error('er'))
            };
        });
    };

    Land.prototype.moveBy = function (x, y) {
        if (!x && !y) return;

        x = x || 0;
        y = y || 0;
        this.scrolled = {
            x: true,
            y: true
        };

        var mx = this.scale.x * x,
            my = this.scale.y * y;
        this.x = parseInt( this.x + mx );
        this.y = parseInt( this.y + my );

        if (this.x < window.innerWidth - this.img.width) {
            this.x -= mx;
            this.scrolled.x = false;
            console.debug('Not moving X > width ',mx);
        }
        else if (this.x > 0) {
            this.x = 0;
            this.scrolled.x = false;
            console.debug('Not moving X > 0 ',mx);
        }

        if (this.y < window.innerHeight - this.img.height) {
            this.y = window.innerHeight - this.img.height;
            this.scrolled.y = false;
        }
        else if (this.y > 0) {
            this.y = 0;
            this.scrolled.y = false;
        }
    };

    Land.prototype.render = function () {
        var x = parseInt( this.x ) + 'px';
        var y = parseInt( this.y ) + 'px';
        this.el.css({
            left: x,
            top:  y
        });
    };

    Land.prototype.mine = function (x, y) {
        // this.ctx.putImageData( this.blankSpace,
        //     Math.abs(this.x) + x,
        //     Math.abs(this.y) + y
        // );

        // this.ctx.clearRect(
        //     Math.abs(this.x) + x - this.mineSquareHalf,
        //     Math.abs(this.y) + y - this.mineSquareHalf,
        //     this.mineSquare, this.mineSquare
        // );

        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.arc(
            Math.abs(this.x) + x - this.mineSquareHalf,
            Math.abs(this.y) + y - this.mineSquareHalf,
            this.mineSquare,
            0, Math.PI*2, false
        );
        this.ctx.closePath();
        this.ctx.fill();
    };

    return Land;
});
