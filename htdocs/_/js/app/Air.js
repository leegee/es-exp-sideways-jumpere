'use strict';

define( function () {

    var Air = function (args) {
        console.debug('Air.constructor enter ', arguments);
        var self    = this;

        this.dayLength = args.dayLength || (60 * 1000);
        this.width     = args.width;
        this.height    = args.height;
        this.lightRad  = args.lightRad || 200;

        if (typeof args.getLightPosition !== 'function'){
            throw new Error('args.getLightPosition should be a closure returning an array x,y coordinates at which to set the light');
        }
        this.getLightPosition = args.getLightPosition;

        this.initialDay = null;

        this.el = document.createElement('canvas');
        this.el.setAttribute('id', 'air');
        this.el.setAttribute('width', this.width);
        this.el.setAttribute('height', this.height);
        document.body.appendChild( this.el );
        this.ctx = this.el.getContext('2d');

        this.dayNumber = 1;
        this.timer = {
            night: setInterval(
                function () {
                    self.setNight();
                },
                this.dayLength * 2
            )
        };
        setTimeout(
            function (){
                self.timer.day = setInterval(
                    function () {
                        self.setDay();
                    },
                    self.dayLength * 2
                )
            },
            this.dayLength
        );
    };

    Air.prototype.destroy = function () {
        clearInterval( this.timers.day );
        clearInterval( this.timers.night );
        this.timers.day   = null;
        this.timers.night = null;
    }

    Air.prototype.setDay = function () {
        var self  = this;
        var alpha = 1;
        var id = setInterval(
            function (){
                self.night( alpha );
                self.light();
                alpha -= 0.05;
                if (alpha <= 0){
                    clearInterval(id);
                    self.dayNumber ++;
                }
            },
            500
        );
    };

    Air.prototype.setNight = function () {
        var self  = this;
        var alpha = 0;
        var id = setInterval(
            function (){
                self.night( alpha );
                self.light();
                alpha += 0.05;
                if (alpha > 1){
                    clearInterval(id);
                }
            },
            500
        );
    };

    Air.prototype.night = function (alpha) {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.globalCompositeOperation = "multiply";
        this.ctx.fillStyle = "rgba(0,0,0,"+( alpha )+")";
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.restore();
    };

    Air.prototype.light = function (x,y,lightRad) {
        if (typeof x === 'undefined'){
            var xy = this.getLightPosition();
            x = xy[0];
            y = xy[1];
        }
        lightRad = lightRad || this.lightRad;

        this.ctx.save();
        var radialGradient = this.ctx.createRadialGradient(
            x,y,
            0,
            x,y,
            lightRad
        );
        radialGradient.addColorStop(0,    "rgba(255, 255, 255, 0.99)");
        radialGradient.addColorStop(0.25, "rgba(255, 255, 255, 0.55)");
        radialGradient.addColorStop(0.5,  "rgba(255, 255, 255, 0.75)");
        radialGradient.addColorStop(1,   "transparent");
        this.ctx.globalCompositeOperation = "destination-out";
        this.ctx.fillStyle = radialGradient;
        this.ctx.fillRect(x-lightRad, y-lightRad, lightRad*2, lightRad*2);
        this.ctx.restore();
    };

    return Air;
});
