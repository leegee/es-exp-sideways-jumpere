'use strict';

define(['jquery'], function (jquery) {

    var Sprite = function (args) {
        console.debug('Sprite.constructor enter ', arguments);
        var self             = this;
        this.land           = args.land;
        this.jumpStartTime   = 0;
        this.falling         = false;
        this.x               = null;
        this.y               = null;
        this.width           = null;
        this.height          = null;
        this.img             = null;
        this.ctx             = null;
        this.offset = {
            x: null,
            y: null
        };
        this.dir = {
            x : 0,
            y : 0
        };
        this.moveby = {
            x : 2,
            y : 2
        };
        this.img        = new Image();
        this.img_src    = null;
    };

    Sprite.prototype.load = function () {
        console.log("Enter Sprite.load ", this);
        var self = this;

        return new Promise ( function (resolve, reject) {
            if (self.img_src === null){
                reject( new TypeError('No this.img_src defined'));
                return;
            }
            self.img.src = self.img_src;

            self.img.onload = function() {
                console.debug('Loaded Player.img');
                self.loaded();
                return resolve();
                // reject( new Error('er'))
            };
        });
    };

    Sprite.prototype.loaded = function () {
        this.width = this.img.width;
        this.height = this.img.height;
        this.offset = {
            x: this.width  / 2,
            y: this.height / 2
        };
        this.setEl();
        // this.render();
    };

    Sprite.prototype.setEl = function () {
        this.el = jquery(
            '<canvas id="player" '
            +'width="'+window.innerWidth+'" '
            +'height="'+window.innerWidth+'" '
            +'style="'
                +'width:'+window.innerWidth+'px;'
                +'height:'+window.innerWidth+'px;'
            +'"/>'
        );
        jquery( document.body ).append( this.el );
        this.ctx = this.el.get(0).getContext('2d');
    }

    Sprite.prototype.setMove = function (x, y){
        if (x >= this.land.sides.right){
            this.dir.x = 1;
        }
        else if (x <= this.land.sides.left){
            this.dir.x = -1;
        }
        else {
            this.dir.x = 0;
        }

        // if (this.jumpStartTime){
        //     // this.dir.y = (100 - duration/10) / 5;
        //     this.dir.y = -1;
        // }
    };

    Sprite.prototype.moveBy = function (x, y) {
        if (!x && !y) return;
        x = x || this.moving.x;
        y = y || this.moving.y;
        this.moving.x = x;
        this.moving.y = y;
        this.scrolled = {
            x: true,
            y: true
        };
        this.x = parseInt( this.x + x );
        this.y = parseInt( this.y + y );
    };

    Sprite.prototype.render = function () {
        this.ctx.drawImage(
            this.img,
            parseInt( this.x - this.offset.x ),
            parseInt( this.y - this.offset.y)
        );
    };

    Sprite.prototype.startJump = function () {
        if (this.jumpStartTime !== 0 || this.falling) {
            return;
        }
        var self = this;
        this.jumpStartTime = setTimeout(
            function () { self.stopJump() },
            777
        );
        this.falling = false;
        this.dir.y = -1;
    };

    Sprite.prototype.stopJump = function () {
        this.jumpStartTime = 0;
        this.dir.y = 0;
    };

    Sprite.prototype.collisionDetection_and_gravity = function () {
        if (! this.jumpStartTime){
            var clrBelow = this.land.isClear(
                this.x - this.offset.x,
                this.y + this.offset.y,
                this.width,
                this.moveby.y
            );
            if (clrBelow){
                this.dir.y = 1;
                if (! this.falling){
                    this.falling = true;
                }
            } else {
                this.dir.y = 0;
                this.falling = 0;
            }
        }

        // Jumping
        else {
            var clrAbove = this.land.isClear(
                this.x - this.offset.x,
                this.y - this.offset.y,
                this.width,
                this.moveby.y
            );
            if (clrAbove){
                this.dir.y = -1;
            } else {
                this.stopJump();
            }
        }

        // Sideways
        if (this.dir.x !== 0){
            var x = this.x + (this.offset.x  * this.dir.x);
            var y = this.y + (this.offset.y  * this.dir.y);
            var clrBeside = this.land.isClear(
                x, y,
                this.moveby.x,
                1
            );

            if (! clrBeside){
                this.dir.x = 0;
                this.dir.y -= 2;
            }
        }
    };

    return Sprite;
});
