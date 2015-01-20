'use strict';

define(['jquery'], function (jquery) {
    window.requestAnimFrame = (function(){
        return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              window.oRequestAnimationFrame      ||
              window.msRequestAnimationFrame     ||
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();

    var Game = function (args) {
        console.debug('Game.constructor enter ', arguments);
        args.gravity = args.gravity || 10;

        this.init(args);
    };

    Game.prototype.init = function (args) {
        console.group('Game.init enter ', arguments);
        var self = this;
        this.pageX = null;
        this.pageY = null;
        self.playing = false;

        this.land   = new args.Land();
        this.player = new args.Player({
            world: this.world
        });

        // this.land.onReady( this, this.run );
        this.land.load().then(
            function () {
                console.log('Loaded Land');
                self.run();
            }
        )
        .then(
            this.player.load().then(
                function () {
                    self.playing = true;
                    console.log('Loaded player');
                }
            )
        );

        console.groupEnd();
    };

    Game.prototype.run = function (args) {
        console.debug('Game.run');
        var self = this;
        this.setInputListeners();
        self.playing = true;

        // Schedule rendering:
        (function animGame () {
            if (self.playing){
                requestAnimFrame(animGame);
                self.tick();
            }
        })();
    };

    Game.prototype.destroy = function () {
        this.removeInputListeners();
    };

    Game.prototype.setInputListeners = function () {
        console.debug('Enter setInputListeners');
        var self = this;

        document.onmousedown = function handleMouseDown (e) {
            e = e || window.e;
            e.preventDefault() || e.stopPropagation();
            if (e.which===1 || e.button==1){
                self.startJump();
            } else {
                self.startMining();
            }
            return false;
        };

        document.oncontextmenu = function handleContextMenu (e) {
            e = e || window.e;
            e.preventDefault() || e.stopPropagation();
            return false;
        };

        // Pre cursor keys from moving the page:
        document.onkeypress = function handleKeyPress (e) {
            e = e || window.e;
            e.preventDefault() || e.stopPropagation();
            return false;
        };

        // Via http://stackoverflow.com/questions/7790725/javascript-track-mouse-position
        document.onmousemove = function handleMouseMove (e) {
            var dot, eDoc, doc, body, pageX, pageY;
            e = e || window.e; // IE-ism
            e.preventDefault() || e.stopPropagation();

            // If pageX/Y aren't available and clientX/Y are,
            // calculate pageX/Y - logic taken from jQuery.
            // (This is to support old IE)
            if (e.pageX == null && e.clientX != null) {
                eDoc = (e.target && e.target.ownerDocument) || document;
                doc = eDoc.documentElement;
                body = eDoc.body;

                e.pageX = e.clientX +
                  (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                  (doc && doc.clientLeft || body && body.clientLeft || 0);
                e.pageY = e.clientY +
                  (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
                  (doc && doc.clientTop  || body && body.clientTop  || 0 );
            }

            // Use e.pageX / e.pageY here
            self.pageX = e.pageX;
            self.pageY = e.pageY;

            return false;
        };
    };

    Game.prototype.removeInputListeners = function () {
        document.onmousemove   = null;
        document.onkeypress    = null;
        document.onmousedown   = null;
        document.onContextMenu = null;
    }

    Game.prototype.tick = function (args) {
        this.render();
    };

    Game.prototype.render = function (args) {
        this.moveX = 0;
        this.moveY = 0;

        // Mouse moves background
        if (this.pageX){
            if (this.pageX >= this.land.sides.right){
                this.moveX = -1;
                console.debug('Mouse moves x -1');
            }
            else if (this.pageX <= this.land.sides.left){
                this.moveX = 1;
                console.debug('Mouse moves x 1 as %d <= %d', this.pageX, this.land.sides.left);
            }
        }

        // Y movement is only by gravity/jump
        // if (this.pageY <= this.land.sides.top){
        //     moveY = 1;
        // } else if (this.pageY >= this.land.sides.bottom){
        //     moveY = -1;
        // } else {
        //     moveY = 0;
        // }

        this.collisionDetection_and_gravity();

        this.land.moveBy( this.moveX, this.moveY );
        this.land.render();

        if (! this.land.scrolled.x){
            // console.log('no scroll x')
        }
        if (! this.land.scrolled.y){
            // console.log('no scroll y')
        }

        this.player.render();
    };

    Game.prototype.collisionDetection_and_gravity = function () {
        // Falling?
        var imgd = this.land.ctx.getImageData(
            (parseInt( this.land.el.css('left') ) * -1) + this.player.x - this.player.offset.x,
            (parseInt( this.land.el.css('top' ) ) * -1) + this.player.y + this.player.offset.y,
            this.player.img.width,
            this.player.scale.y
        );

        var x=0, clearUnder=0, clearUnderLeft=0, clearUnderRight=0;
        for (var i=0; i < imgd.data.length; i += 4){
            var r = imgd.data[i],
                g = imgd.data[i+1],
                b = imgd.data[i+2],
                a = imgd.data[i+3];
            if (a < 127){
                clearUnder++;
                if (x < this.player.offset.x){
                    clearUnderLeft ++;
                } else {
                    clearUnderRight ++;
                }
            }
            x ++;
            if (x > this.player.width){
                x = 0;
            }
        }

        // Fall if  the pixels below player are 'clear'
        if (clearUnder >= imgd.data.length/4){
            this.moveY -= 4;
            this.player.falling = true;
        }
        else {
            this.moveY = 0;
            this.player.falling = false;
        }

        // Fall left/right if only half ground beneath
        if (clearUnder >= imgd.data.length/8
         && clearUnderLeft !== clearUnderRight
        ){
            if (clearUnderLeft && clearUnderLeft > clearUnderRight){
                this.moveX += 1;
                this.moveY -= 1;
                console.debug('fall moves x 1');
            }
            else if (clearUnderRight && clearUnderRight > clearUnderLeft){
                this.moveX -= 1;
                this.moveY -= 1;
                console.debug('fall moves x -1');
            }
        }

        // Pre moving left/right into things
        else if (this.moveX !== 0){
            var xOffset = this.player.offset.x;
            if (this.moveX > 0){
                xOffset *= -1;
            }
            var imgd = this.land.ctx.getImageData(
                (parseInt( this.land.el.css('left') ) * -1) + this.player.x + xOffset,
                (parseInt( this.land.el.css('top' ) ) * -1) + this.player.y - this.player.offset.y,
                this.player.scale.x,
                this.player.img.height
            );

            var clear = 0;
            for (var i=0; i < imgd.data.length; i += 4){
                var r = imgd.data[i],
                    g = imgd.data[i+1],
                    b = imgd.data[i+2],
                    a = imgd.data[i+3];
                if (a < 127){
                    clear++;
                }
            }
            // 50% clear
            if ( clear < imgd.data.length/8) {
                this.moveX = 0;
                console.debug('do not move x as clear = %d / %d', clear, imgd.data.length/8);
            }
            else {
                console.log('OK to moveX ', this.moveX);
            }
        }

        if (this.player.jumpStartTime){
            var duration = new Date().getTime() - this.player.jumpStartTime;
            if (duration > 2000){
                this.player.jumpStartTime = 0;
            }
            else {
                var velocity = 100 - duration/10;
                if (velocity < 0){
                    velocity = 0;
                }
                this.moveY = velocity/10;
                console.log(velocity);
            }
        }
    };

    Game.prototype.startJump = function () {
        if (this.player.jumpStartTime || this.player.falling) {
            return;
        }
        this.player.jumpStartTime = new Date().getTime();
    };

    Game.prototype.startMining = function () {
        if (this.player.mining) return false;
        this.player.mining = true;

        var mineX = 0;
        if (this.pageX >= this.player.x + this.player.offset.x){
            mineX = this.player.x + this.player.offset.x;
        }
        else if (this.pageX <= this.player.x - this.player.offset.x){
            mineX = this.player.x - this.player.offset.x;
        }

        var mineY = 0;
        if (this.pageY >= this.player.y + this.player.offset.y){
            mineY = this.player.y + this.player.offset.y;
        }
        else if (this.pageY <= this.player.y - this.player.offset.y){
            mineY = this.player.y - this.player.offset.y;
        }

        this.land.mine( mineX, mineY );

        // Allow more mining in a little while:
        var self = this;
        setTimeout( function () {
            self.player.mining = false;
        }, 300);
    };

    return Game;
});
