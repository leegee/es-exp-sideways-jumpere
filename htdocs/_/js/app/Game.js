'use strict';

define(['jquery'], function (jquery) {
    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

    // requestAnimationFrame polyfill by Erik Möller
    // fixes from Paul Irish and Tino Zijdel

    (function() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                       || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                  timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
    }());

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
        (function animationLoop () {
            if (self.playing){
                requestAnimationFrame(animationLoop);
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
            }
            else if (this.pageX <= this.land.sides.left){
                this.moveX = 1;
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

        // if (! this.land.scrolled.x){
        //     // console.log('no scroll x')
        // }
        // if (! this.land.scrolled.y){
        //     // console.log('no scroll y')
        // }

        this.player.render();
    };

    Game.prototype.collisionDetection_and_gravity = function () {
        // Need to fall?
        var imgd = this.land.ctx.getImageData(
            (parseInt( this.land.el.css('left') ) * -1) + this.player.x - this.player.offset.x,
            (parseInt( this.land.el.css('top' ) ) * -1) + this.player.y + this.player.offset.y,
            this.player.img.width,
            1
        );
        var imgd8 = new Uint8Array( imgd.data.buffer );
        var x=0, clearUnder=0, clearUnderLeft=0, clearUnderRight=0;
        // Check transparent pixels
        for (var i=3; i < imgd8.length; i+=4){
            if (imgd8[i] < 127){
                clearUnder++;
                if (x < this.player.offset.x){
                    clearUnderLeft ++;
                } else {
                    clearUnderRight ++;
                }
            }
            x = x > this.player.width? 0 : x+1;
        }

        // Fall if  the pixels below player are 'clear'
        if (clearUnder >= imgd.data.length/4
            || (
                clearUnderLeft || clearUnderLeft
                && clearUnderLeft !== clearUnderRight
            )
        ){
            if (! this.player.fallStartTime){
                this.player.fallStartTime = new Date().getTime();
            }
            var duration = new Date().getTime() - this.player.fallStartTime;
            // Increase velocity
            this.moveY = -1 * (1 + (parseInt(duration/200)*2));
        }

        else {
            this.moveY = 0;
            this.player.fallStartTime = 0;
        }

        // Fall left/right if only half ground beneath
        if (clearUnderLeft || clearUnderLeft
            && clearUnderLeft !== clearUnderRight
        ){
            if (clearUnderLeft > clearUnderRight){
                this.moveX += 1;
            }
            else {
                this.moveX -= 1;
            }
        }

        // Prevent moving left/right into things
        if (this.moveX !== 0){
            var xOffset = this.player.offset.x;
            if (this.moveX > 0){
                xOffset *= -1;
            }
            var imgd = this.land.ctx.getImageData(
                (parseInt( this.land.el.css('left') ) * -1) + this.player.x + xOffset,
                (parseInt( this.land.el.css('top' ) ) * -1) + this.player.y - this.player.offset.y,
                Math.abs(this.moveX),
                this.player.img.height
            );
            var imgd8 = new Uint8Array( imgd.data.buffer );
            var clear = 0;
            // Check transparent pixels
            for (var i=3; i < imgd.data.length; i += 4){
                if (imgd8[i] < 127){
                    clear++;
                    // 50% clear?
                    if (clear < imgd.data.length/8) {
                        this.moveX = 0;
                        break;
                    }
                }
            }
        }

        if (this.player.jumpStartTime){
            var duration = new Date().getTime() - this.player.jumpStartTime;
            if (duration > 700){
                this.player.jumpStartTime = 0;
            }
            else {
                // decrease velocity
                this.moveY = (100 - duration/10) / 5;
            }
        }
    };

    Game.prototype.startJump = function () {
        if (this.player.jumpStartTime !== 0 || this.player.fallStartTime !== 0) {
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
