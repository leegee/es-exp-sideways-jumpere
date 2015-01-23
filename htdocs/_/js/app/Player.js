'use strict';

define(['jquery','app/Sprite'], function (jquery,Sprite) {

    var Player = function (args) {
        console.debug('Player.constructor enter ', arguments);
        Sprite.call(this, args);
        this.mining  = false;
        this.img_src = '/img/player.png';
    };

    Player.prototype             = Object.create( Sprite.prototype );
    Player.prototype.constructor = Player;

    Player.prototype.load = function () {
        var self = this;
        return new Promise ( function (resolve, reject) {
            self.setEl();
            self.loaded();
            return resolve();
        });
    };

    Player.prototype.loaded = function () {
        this.x = parseInt( (window.innerWidth/2) - (this.width/2) );
        this.y = parseInt( (window.innerHeight/2) - (this.height/2) );
        this.width = this.land.cellSize;
        this.height = this.land.cellSize;
        this.offset.x = this.width/2;
        this.offset.y = this.height/2;
        this.render();
    };

    Player.prototype.startMining = function (dirX, dirY) {
        if (this.mining) return false;

        this.mining = true;

        // this.land.mine(this.x, this.y);

        var rgb = this.land.mine(this.x, this.y, dirX, dirY);

        var self = this;
        setTimeout( function () {
            self.mining = false;
        }, 300);

        return rgb;
    };

    Player.prototype.render = function () {
        this.ctx.fillStyle = 'rgb(125,0,0)';
        this.ctx.fillRect(
            parseInt( this.x - this.offset.x ),
            parseInt( this.y - this.offset.y),
            this.width,
            this.height
        );
    };

    return Player;
});
