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
            window.cancelAnimationFrame  = window[vendors[x]+'CancelAnimationFrame']
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
        this.playing    = false;
        this.air        = null;

        this.land       = new args.Land();
        this.player     = new args.Player({
            land: this.land
        });
        this.hud        = new args.Hud({
            numberOfColours: this.player.numberOfColours,
            mode:            this.player.mode
        });

        // this.land.onReady( this, this.run );
        this.land.load()
        .then(
            function () {
                console.log('Loaded Land');
                self.cursors = new args.Cursors({
                    cellSize: self.land.cellSize,
                    width:  self.land.width,
                    height: self.land.height,
                    player: {
                        widthHalf: self.player.width / 2,
                        heightHalf: self.player.height / 2
                    }
                });
                self.air = new args.Air({
                    width:  self.land.width,
                    height: self.land.height,
                    getLightPosition: function () { return self.player.getXY(); }
                })
                self.run();
            }
        )
        .catch(
            function (e){
                console.error(e);
                throw(e);
            }
        )
        .then(
            this.player.load()
            .then(
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
        this.air.destroy();
        window.cancelAnimationFrame( this.animationId );
    };

    Game.prototype.setInputListeners = function () {
        console.debug('Enter setInputListeners');
        var self = this;

        document.onmousedown = function handleMouseDown (e) {
            e = e || window.e;
            e.preventDefault() || e.stopPropagation();
            // if (e.which===1 || e.button==1){
            //     self.player.startJump();
            // }
            // else {
                if (self.player.mode === 'dig'){
                    console.log('mine: curosr ', self.cursors.x, self.cursors.y );
                    console.log('mine: page   ', self.pageX, self.pageY );
                    self.hud.addRgb(
                        self.player.startMining(
                        //    self.pageX, self.pageY
                            self.cursors.x, self.cursors.y
                        )
                    );
                }
                else {
                    var done = self.player.startBuilding( self.pageX, self.pageY, self.hud.getClr() );
                    if (done){
                        self.hud.decreaseClr();
                    }
                }
            // }
            return false;
        };

        document.oncontextmenu = function handleContextMenu (e) {
            e = e || window.e;
            e.preventDefault() || e.stopPropagation();
            return false;
        };

        document.onkeypress = function handleKeyPress (e) {
            e = e || window.e;
            e.preventDefault() || e.stopPropagation();
            var clrKey = e.charCode - 48;

            // e
            if (e.charCode === 101){
                self.hud.toggleInventory();
            }
            // w    119
            else if (e.charCode === 119){
                self.player.startJump();
            }
            // a    97
            else if (e.charCode === 97){
                self.player.setMove( -1, 0 );
            }
            // s    115, d 100
            else if (e.charCode === 115 || e.charCode === 100){
                self.player.setMove( 1, 0 );
            }
            // x    120, z 122
            else if (e.charCode === 120 || e.charCode === 122){
            }

            else if (clrKey === self.hud.keys.dig ){
                console.debug('dig');
                self.player.setMode('dig');
                self.hud.setMode( self.player.mode );
            }

            else if (clrKey === self.hud.keys.build ){
                console.debug('build');
                self.player.setMode('build');
                self.hud.setMode( self.player.mode );
            }

            else if (e.charCode === 32 ){
                self.player.toggleMode();
                self.hud.setMode( self.player.mode );
            }
            else if (clrKey > 0 && clrKey <= self.player.numberOfColours){
                console.debug('colour key ', clrKey);
                self.hud.setClr( clrKey );
            }

            else if (e.charCode==167){ // §
                self.player.debug = ! self.player.debug;
            }
            else {
                console.log('key=%d, clrKey=%d',e.charCode, clrKey);
            }
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

            if (Math.abs(self.pageX - self.player.x) < (self.land.cellSize*2) + self.player.offset.x
             && Math.abs(self.pageY - self.player.y) < (self.land.cellSize*3) + self.player.offset.y
            ){
                self.cursors.render(
                    self.land.getSquare(
                        self.pageX, self.pageY,
                        self.player.x, self.player.y
                    )
                );
            } else {
                self.cursors.hide();
            }

            return false;
        };
    };

    Game.prototype.removeInputListeners = function () {
        document.onmousemove   = null;
        document.onkeypress    = null;
        document.onmousedown   = null;
        document.onContextMenu = null;
        this.playing = false;
    };

    Game.prototype.tick = function (args) {
        // this.player.setMove( this.pageX, this.pageY );
        this.player.tick();
        this.land.moveBy(
            this.player.moveby.x * this.player.dir.x,
            this.player.moveby.y * this.player.dir.y
        );
    };


    return Game;
});
