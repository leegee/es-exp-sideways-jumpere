'use strict';

define(['jquery'], function (jquery) {

    var Player = function (args) {
        console.debug('Player.constructor enter ', arguments);
        var self = this;
        this.world = args.world;
        this.jumpStartTime = 0;
        this.falling = false;
        this.scale = {
            x: 1,
            y: 1
        };
        this.offset = {
            x: null,
            y: null
        };
        this.x = this.y = null;
        this.img = null;
        this.ctx = null;
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
        var mx = this.scale.x * x;
        var my = this.scale.y * y;
        this.x = parseInt( this.x + mx );
        this.y = parseInt( this.y + my );

        // if (this.x < this.img.width * -1) {
        //     this.x = this.img.width * -1;
        //     this.scrolled.x = false;
        // }
        // else if (this.x > 0) {
        //     this.x = 0;
        //     this.scrolled.x = false;
        // }
        // if (this.y < this.img.height * -1) {
        //     this.y = this.img.height * -1;
        //     this.scrolled.y = false;
        // }
        // else if (this.y > 0) {
        //     this.y = 0;
        //     this.scrolled.y = false;
        // }
    };

    Player.prototype.render = function () {
        this.ctx.drawImage( this.img,
            parseInt( this.x - this.offset.x ),
            parseInt( this.y - this.offset.y)
        );
    };

    return Player;
});
