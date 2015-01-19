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
        this.init(args);
    };

    Game.prototype.init = function (args) {
        console.group('Game.init enter ', arguments);
        var self = this;
        this.pageX = 0;
        this.pageY = 0;
        self.playing = false;

        this.land   = new args.Land();
        this.player = new args.Player();

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

        // Prevent cursor keys from moving the page:
        document.onkeypress = function handleKeyPress (event) {
            return false;
        };

        // Via http://stackoverflow.com/questions/7790725/javascript-track-mouse-position
        document.onmousemove = function handleMouseMove (event) {
            var dot, eventDoc, doc, body, pageX, pageY;

            event = event || window.event; // IE-ism

            // If pageX/Y aren't available and clientX/Y are,
            // calculate pageX/Y - logic taken from jQuery.
            // (This is to support old IE)
            if (event.pageX == null && event.clientX != null) {
                eventDoc = (event.target && event.target.ownerDocument) || document;
                doc = eventDoc.documentElement;
                body = eventDoc.body;

                event.pageX = event.clientX +
                  (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                  (doc && doc.clientLeft || body && body.clientLeft || 0);
                event.pageY = event.clientY +
                  (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
                  (doc && doc.clientTop  || body && body.clientTop  || 0 );
            }

            // Use event.pageX / event.pageY here
            self.pageX = event.pageX;
            self.pageY = event.pageY;
        };
    };

    Game.prototype.removeInputListeners = function () {
        document.onmousemove = null;
    }

    Game.prototype.tick = function (args) {
        this.render();
    };

    Game.prototype.render = function (args) {
        var moveX, moveY;

        if (this.pageX >= this.land.sides.right){
            moveX = -1;
        }
        else if (this.pageX <= this.land.sides.left){
            moveX = 1;
        }
        else {
            moveX = 0;
        }

        // Y movement is only by gravity
        // if (this.pageY <= this.land.sides.top){
        //     moveY = 1;
        // } else if (this.pageY >= this.land.sides.bottom){
        //     moveY = -1;
        // } else {
        //     moveY = 0;
        // }

        this.land.moveBy( moveX, moveY );
        this.land.render();

        if (! this.land.scrolled.x){
            // console.log('no scroll x')
        }
        if (! this.land.scrolled.y){
            // console.log('no scroll y')
        }

        this.applyGravity();
        this.collisionDetection();

        this.player.render();
    };

    Game.prototype.applyGravity = function () {
    };

    Game.prototype.collisionDetection = function () {
    };

    return Game;
});
