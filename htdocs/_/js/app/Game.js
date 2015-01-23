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
        console.group('Game.constructor enter ', arguments);
        var self = this;
        this.pageX      = null;
        this.pageY      = null;
        this.animationId = null;
        this.moveX      = 0;
        this.moveY      = 0;
        this.xMoveRate  = 2;
        this.yFallRate  = 2;
        this.yJumpRate  = 2;
        self.playing    = false;

        this.hud        = new args.Hud();
        this.land       = new args.Land();
        this.player     = new args.Player({
            land: this.land
        });

        // this.land.onReady( this, this.run );
        this.land.load()
        .then(
            function () {
                console.log('Loaded Land');
                self.run();
            }
        )
        .catch(
            function (e){
                console.error(e)
                throw(e);
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
                self.animationId = requestAnimationFrame(animationLoop);
                self.tick();
            }
        })();
    };

    Game.prototype.destroy = function () {
        this.removeInputListeners();
        window.cancelAnimationFrame( this.animationId );
    };

    Game.prototype.setInputListeners = function () {
        console.debug('Enter setInputListeners');
        var self = this;

        document.onmousedown = function handleMouseDown (e) {
            e = e || window.e;
            e.preventDefault() || e.stopPropagation();
            if (e.which===1 || e.button==1){
                self.player.startJump();
            }
            else {
                self.hud.addRgb(
                    self.player.startMining( self.pageX, self.pageY )
                );
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
        this.playing = false;
    }

    Game.prototype.tick = function (args) {
        this.player.setMove( this.pageX, this.pageY );
        this.player.collisionDetection_and_gravity();
        this.land.moveBy( this.player.moveX, this.player.moveY );
    };

    return Game;
});
