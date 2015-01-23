'use strict';

define(['jquery','app/Sprite'], function (jquery,Sprite) {

    var Player = function (args) {
        console.debug('Player.constructor enter ', arguments);
        Sprite.call(this, args);
        this.mining  = false;
        this.img_src = '/img/player.png';
    };

    Player.prototype             = Object.create( Sprite.prototype );
    Player.prototype.constructor = Sprite;

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
