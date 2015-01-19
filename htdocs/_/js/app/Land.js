'use strict';

define(['jquery', 'box2d'], function (jquery, Box2d) {

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
        this.offset = {
                x: 0,
                y: 0
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
        this.img.src = '/img/passmore.png';

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
        }
        else if (this.x > 0) {
            this.x = 0;
            this.scrolled.x = false;
        }

        if (this.y < window.innerHeight - this.img.height) {
            this.y =- - my;
            this.scrolled.y = false;
        }
        else if (this.y > 0) {
            this.y = 0;
            this.scrolled.y = false;
        }
    };

    Land.prototype.render = function () {
        var x = parseInt( this.x + this.offset.x ) + 'px';
        var y = parseInt( this.y + this.offset.y) + 'px';
        this.el.css({
            left: x,
            top:  y
        });
        console.debug('Rendered Land.img at %d,%d of x %d', x, y, this.img.width*-1);
    };

    return Land;
});
