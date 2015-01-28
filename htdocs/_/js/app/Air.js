'use strict';

define( function () {

    var Air = function (args) {
        console.debug('Air.constructor enter ', arguments);
        var self    = this;
        this.transparentThreshold = args.transparentThreshold;
        this.width  = args.width;
        this.height = args.height;

        this.el = document.createElement('canvas');
        this.el.setAttribute('id', 'air');
        this.el.setAttribute('width', this.width);
        this.el.setAttribute('height', this.height);
        document.body.appendChild( this.el );
        this.ctx = this.el.getContext('2d');
    };

    Air.prototype.night = function (alpha) {
        console.log("transparentThreshold/alpha: ",alpha);
        this.ctx.save();
        this.ctx.globalCompositeOperation = "multiply";
        this.ctx.fillStyle = "rgba(0,0,0,"+( alpha )+")";
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.restore();
    };

    Air.prototype.light = function (x,y,lightRad) {
        this.ctx.save();
        lightRad = lightRad || 100;
        console.log("Light: ", x,y, lightRad);
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
