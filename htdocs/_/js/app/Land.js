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

        var mx = this.scale.x * x,
            my = this.scale.y * y;
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

    return Land;
});
