'use strict';

define(['jquery'], function (jquery) {

    var Player = function (args) {
        console.debug('Player.constructor enter ', arguments);
        var self             = this;
        this.land           = args.land;
        this.jumpStartTime   = 0;
        this.falling         = false;
        this.mining          = false;
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

        this.moveX      = 0;
        this.moveY      = 0;
        this.xMoveRate  = 2;
        this.yFallRate  = 2;
        this.yJumpRate  = 2;
    };

    Player.prototype.load = function () {
        var self = this;
        this.img = new Image();
        this.img.src = '/img/player.png';

        return new Promise ( function (resolve, reject) {
            self.img.onload = function() {
                console.debug('Loaded Player.img');
                self.x = parseInt( (window.innerWidth/2) - (self.img.width/2) );
                self.y = parseInt( (window.innerHeight/2) - (self.img.height/2) );
                self.width = self.img.width;
                self.height = self.img.height;
                self.offset = {
                    x: self.img.width  / 2,
                    y: self.img.height / 2
                };

                self.el = jquery(
                    '<canvas id="player" '
                    +'width="'+window.innerWidth+'" '
                    +'height="'+window.innerWidth+'" '
                    +'style="'
                        +'width:'+window.innerWidth+'px;'
                        +'height:'+window.innerWidth+'px;'
                    +'"/>'
                );
                jquery( document.body ).append( self.el );
                self.ctx = self.el.get(0).getContext('2d');
                self.render();
                resolve();
                // reject( new Error('er'))
            };
        });
    };

    Player.prototype.setMove = function (x, y){
        if (x >= this.land.sides.right){
            this.moveX = this.xMoveRate;
        }
        else if (x <= this.land.sides.left){
            this.moveX = this.xMoveRate * -1;
        }
        else {
            this.moveX = 0;
        }

        if (this.jumpStartTime){
            // this.moveY = (100 - duration/10) / 5;
            this.moveY = -1 * this.yFallRate;
        }
    };

    Player.prototype.moveBy = function (x, y) {
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

    Player.prototype.render = function () {
        this.ctx.drawImage( this.img,
            parseInt( this.x - this.offset.x ),
            parseInt( this.y - this.offset.y)
        );
    };

    Player.prototype.startJump = function () {
        if (this.jumpStartTime !== 0 || this.falling) {
            return;
        }
        var self = this;
        this.jumpStartTime = setTimeout(
            function () { self.stopJump() },
            777
        );
        this.falling = false;
    };

    Player.prototype.stopJump = function () {
        this.jumpStartTime = 0;
    };

    Player.prototype.collisionDetection_and_gravity = function () {
        if (! this.jumpStartTime){
            var clrBelow = this.land.isClear(
                this.x - this.offset.x,
                this.y + this.offset.y,
                this.offset.y,
                this.yFallRate
            );
            if (clrBelow){
                this.moveY = this.yFallRate;
                if (! this.falling){
                    this.falling = true;
                }
            } else {
                this.moveY = 0;
                this.falling = 0;
            }
        }

        // Jumping
        else {
            var clrAbove = this.land.isClear(
                this.x - this.offset.x,
                this.y - this.offset.y,
                this.width,
                this.yJumpRate
            );
            if (clrAbove){
                this.moveY = this.yJumpRate * -1;
            } else {
                this.moveY = 0;
                this.stopJump();
            }
        }

        // Sideways
        if (this.moveX){
            var x = this.x + (this.offset.x * this.moveX);
            var y = this.y + (this.offset.y * this.moveY);;
            var clrBeside = this.land.isClear(
                x, y,
                this.xMoveRate * this.moveX,
                4
            );
            if (clrBeside){
                this.moveX = this.xMoveRate * this.moveX;
            } else {
                this.moveX = 0;
            }
        }
    };

    Player.prototype.startMining = function (x, y) {
        if (this.mining) return false;
        this.mining = true;
        var rgb = this.land.mine( this.x, this.y, x, y );
        // Allow more mining in a little while:
        var self = this;
        setTimeout( function () {
            self.mining = false;
        }, 300);
        return rgb;
    };

    return Player;
});
