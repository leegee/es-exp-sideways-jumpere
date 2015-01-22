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
        this.pageX      = null;
        this.pageY      = null;
        this.moveX      = 0;
        this.moveY      = 0;
        this.xMoveRate  = 2;
        this.yFallRate  = 2;
        this.yJumpRate  = 2;
        self.playing    = false;

        this.land       = new args.Land();
        this.player     = new args.Player({
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

        var frames = 0;
        setInterval( function (){
            console.log('%d fps', frames / 10);
            frames = 0;
        }, 10000);

        // Schedule rendering:
        (function animationLoop () {
            if (self.playing){
                frames ++;
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
                self.player.startJump();
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
        this.setMove();
        this.collisionDetection_and_gravity();
        this.land.moveBy( this.moveX, this.moveY );
    };

    Game.prototype.setMove = function () {
        // Mouse moves background
        if (this.pageX >= this.land.sides.right){
            this.moveX = this.xMoveRate;
        }
        else if (this.pageX <= this.land.sides.left){
            this.moveX = this.xMoveRate * -1;
        }
        else {
            this.moveX = 0;
        }

        if (this.player.jumpStartTime){
            // this.moveY = (100 - duration/10) / 5;
            this.moveY = -1 * this.yFallRate;
        }
    };

    Game.prototype.collisionDetection_and_gravity = function () {
        if (! this.player.jumpStartTime){
            var clrBelow = this.land.isClear(
                this.player.x - this.player.offset.x,
                this.player.y + this.player.offset.y,
                this.player.offset.y,
                this.yFallRate
            );
            if (clrBelow){
                this.moveY = this.yFallRate;
                if (! this.player.falling){
                    this.player.falling = true;
                }
            } else {
                this.moveY = 0;
                this.player.falling = 0;
            }
        }

        // Jumping
        else {
            var clrAbove = this.land.isClear(
                this.player.x - this.player.offset.x,
                this.player.y - this.player.offset.y,
                this.player.width,
                this.yJumpRate
            );
            if (clrAbove){
                this.moveY = this.yJumpRate * -1;
            } else {
                this.moveY = 0;
                this.player.stopJump();
            }
        }

        // Sideways
        if (this.moveX){
            var x = this.player.x + (this.player.offset.x * this.moveX);
            var y = this.player.y + (this.player.offset.y * this.moveY);;
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

    Game.prototype.startMining = function () {
        if (this.player.mining) return false;
        this.player.mining = true;

        var angleRad = Math.atan2(
            this.player.y - this.pageY,
            this.player.x - this.pageX
        );
        var mineX = this.player.x + parseInt(
            (this.land.mineSquare*-1) * Math.cos( angleRad )
        );
        var mineY = this.player.y + parseInt(
            (this.land.mineSquare*-1) * Math.sin( angleRad )
        );
        this.land.mine( mineX, mineY );
        // Allow more mining in a little while:
        var self = this;
        setTimeout( function () {
            self.player.mining = false;
        }, 300);
    };

    return Game;
});
