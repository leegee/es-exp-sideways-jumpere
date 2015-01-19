'use strict';

define(['jquery'], function (jquery) {

    var Land = function (args) {
        console.group('Land.constructor enter ', arguments);
        var self = this;
        this.ready = false;
        this._onReady = {
            func: null,
            ctx: null
        };
        this.sides = {
            left:   null,
            right:  null,
            top:    null,
            bottom: null
        };

        this.xScale = 1;
        this.yScale = 1;

        jquery(document.body).css({
            overflow: 'hidden'
        })

        this.img = new Image();

        this.img.onload = function() {
            console.debug('Loaded Game.img');
            self.offset = {
                x: 0, // parseInt( self.img.width / 2 ) * -1,
                y: 0 // parseInt( self.img.height / 2 ) * -1
            };
            self.x = 1;
            self.y = 1;

            self.el = jquery(
                '<canvas '
                +'width="'+self.img.width+'" height="'+self.img.height+'" '
                +'style="'
                +'width:'+self.img.width+'px;height:'+self.img.height+'px;'
                +'position:absolute;top:0;left:0;border:1px solid red; padding:0;margin:0"/>'
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
            self.ready = true;
            self.fireOnReady();
        };

        this.img.src = '/img/passmore.png';

        console.groupEnd();
    };

    Land.prototype.onReady = function ( ctx, func ) {
        this._onReady.func = func;
        this._onReady.ctx  = ctx;
    };

    Land.prototype.fireOnReady = function () {
        this._onReady.func.apply( this._onReady.ctx );
    };

    Land.prototype.moveBy = function (x, y) {
        if (!x && !y) return;
        var mx = this.xScale * x;
        var my = this.yScale * y;
        this.x = parseInt( this.x + mx );
        this.y = parseInt( this.y + my );

        if (this.x < this.img.width * -1) {
            this.x = this.img.width * -1;
        }
        else if (this.x > 0) {
            this.x = 0;
        }
        if (this.y < this.img.height * -1) {
            this.y = this.img.height * -1;
        }
        else if (this.y > 0) {
            this.y = 0;
        }
    };

    Land.prototype.render = function () {
        this.el.css({
            left: parseInt( this.x + this.offset.x ) + 'px',
            top:  parseInt( this.y + this.offset.y) + 'px'
        });
        console.debug('Rendered this.img at %d,%d', this.x, this.y);
    };

    return Land;
});
