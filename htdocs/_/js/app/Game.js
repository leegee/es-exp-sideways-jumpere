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
        console.group('Game.constructor enter ', arguments);
        this.land = args.land;
        this.playing = false;
        this.pageX = 0;
        this.pageY = 0;
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
        // Via http://stackoverflow.com/questions/7790725/javascript-track-mouse-position
        document.onmousemove = handleMouseMove;
        function handleMouseMove (event) {
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
        }
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

        if (this.pageY <= this.land.sides.top){
            moveY = 1;
        }
        else if (this.pageY >= this.land.sides.bottom){
            moveY = -1;
        }
        else {
            moveY = 0;
        }

        this.land.moveBy( moveX, moveY );
        this.land.render();
    };

    return Game;
});
