'use strict';

define(['jquery'], function (jquery) {

    var Sprite = function (args) {
        console.debug('Sprite.constructor enter ', arguments);
        var self             = this;
        this.land            = args.land;
        this.jumpStartTime   = 0;
        this.requestStop     = false;
        this.falling         = false;
        this.x               = null;
        this.y               = null;
        this.width           = null;
        this.height          = null;
        this.img             = null;
        this.ctx             = null;
        this.clr = {
            above: null,
            below: null,
            beside: null
        }
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

    Sprite.prototype.getXY = function () {
        return [this.x, this.y];
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

    Sprite.prototype.setMove = function (x, y){}
    Sprite.prototype.setMoveByMouse = function (x,y) {}

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
            function () {
                self.stopJump()
            },
            777
        );
        this.falling = false;
        this.dir.y = -1;
    };

    Sprite.prototype.stopJump = function () {
        this.jumpStartTime = 0;
        this.dir.y = 0;
    };

    Sprite.prototype.tick = function () {
        if (this.requestStop){
            var x = this.x + this.dir.x * this.offset.x;
            if (Math.abs( x - this.land.confine(x)) <= this.moveby.x){
                this.dir.x = 0;
                this.requestStop = false;
            }
        }

        if (! this.jumpStartTime){
            this.checkMoveBelow();
        }

        // Jumping
        else {
            this.checkMoveAbove();
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
                if (!this.falling) {
                    this.dir.y = this.moveby.y * -1;
                    if (this.checkMoveAbove()){
                        this.dir.y = this.moveby.y * -1;
                    } else {
                        this.dir.y = 0;
                    }
                }
            }
        }
        // console.log('Leave with ', this.dir.y, this.falling);
    };

    Sprite.prototype.checkMoveAbove = function () {
        this.clr.above = this.land.isClear(
            this.x - this.offset.x,
            this.y - this.offset.y,
            this.width,
            this.moveby.y
        );
        if (this.clr.above){
            this.dir.y = this.moveby.y * -1;
        } else {
            this.stopJump();
        }
    }

    Sprite.prototype.checkMoveBelow = function () {
        this.clr.below = this.land.isClear(
            this.x - this.offset.x,
            this.y + this.offset.y,
            this.width,
            this.moveby.y,
            this.debug
        );
        if (this.clr.below){
            // console.log('fall');
            this.dir.y = 1;
            this.falling = true;
        } else {
            if (this.debug){
                // console.log('land below');
                this.land.ctx.fillStyle = '#FFFF00';
                this.land.ctx.fillRect(
                    this.land.debug[0],
                    this.land.debug[1],
                    this.land.debug[2],
                    this.land.debug[3]
                );
            }

            this.dir.y = 0;
            this.falling = 0;
        }

        this.debug = false;
    }

    return Sprite;
});
