'use strict';

define(['jquery','app/Sprite'], function (jquery,Sprite) {

    var Player = function (args) {
        console.debug('Player.constructor enter ', arguments);
        Sprite.call(this, args);
        this.mining  = false;
        this.building  = false;
        this.numberOfColours = 7;
        this.img_src = '/img/player.png';
    };

    Player.prototype             = Object.create( Sprite.prototype );
    Player.prototype.constructor = Player;

    Player.prototype.load = function () {
        var self = this;
        self.mode = 'dig';
        return new Promise ( function (resolve, reject) {
            self.setEl();
            self.loaded();
            return resolve();
        });
    };

    Player.prototype.loaded = function () {
        this.x = parseInt( (window.innerWidth/2) - (this.width/2) );
        this.y = parseInt( (window.innerHeight/2) - (this.height/2) );
        this.width = this.land.cellSize/2;
        this.height = this.land.cellSize;
        this.offset.x = this.width/2;
        this.offset.y = this.height/2;
        this.render();
    };

    Player.prototype.startBuilding = function (dirX, dirY, clr) {
        if (this.building) return false;
        this.building = true;
        this.land.build(this.x, this.y, dirX, dirY, clr);
        var self = this;
        setTimeout( function () {
            self.building = false;
        }, 300);
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

    Player.prototype.toggleMode = function (mode) {
        if (this.mode==='dig'){
            this.mode = 'build';
        } else {
            this.mode = 'dig';
        }
    };

    Player.prototype.setMode = function (mode) {
        switch (mode){
            case 'dig':
                this.mode = 'dig';
                break;
            case 'build':
                this.mode = 'build';
                break;
        }
    };

    Player.prototype.setMove = function (dirX, dirY){
        // Set / change direction
        if (dirX >= this.land.sides.right){
            this.dir.x = 1;
        }
        else if (dirX <= this.land.sides.left){
            this.dir.x = -1;
        }

        // Continue to the next grid
        else {
            this.requestStop = true;
        }

        if (this.requestStop){
            var x = this.x + this.dir.x * this.offset.x;
            if (x === this.land.confine(x)){
                this.dir.x = 0;
            }
        }

        console.log('dir x = ', this.dir.x, this.requestStop);

        // if (this.jumpStartTime){
        //     // this.dir.y = (100 - duration/10) / 5;
        //     this.dir.y = -1;
        // }
    };

    return Player;
});
