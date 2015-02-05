'use strict';

define( function () {

    var Cursors = function (args) {
        console.debug('Air.constructor enter ', arguments);
        var self    = this;
        this.cellSize = args.cellSize;
        this.width  = args.width;
        this.height = args.height;
        this.player = args.player;
        this.x      = 0;
        this.y      = 0;

        this.el = document.createElement('canvas');
        this.el.setAttribute('id', 'cursors');
        this.el.setAttribute('width', this.width);
        this.el.setAttribute('height', this.height);
        document.body.appendChild( this.el );
        this.ctx = this.el.getContext('2d');
    };

    Cursors.prototype.hide = function () {
        if (! this.showing) return;
        this.ctx.save();
        this.ctx.globalCompositeOperation = "source-over";
        this.ctx.clearRect( this.x-1, this.y-1, this.cellSize+2, this.cellSize+2  );
        this.ctx.restore();
    };

    Cursors.prototype.render = function (square) {
        var x = square[0],
            y = square[1];
        if (x === this.x && y === this.y){
            return;
        }
        this.hide();
        this.showing = true;
        this.ctx.save();
        this.ctx.globalCompositeOperation = "source-over";
        this.x = x;
        this.y = y;
        this.ctx.fillStyle = 'rgba(50,255,50,0.4)';//#32cd32
        this.ctx.fillRect( this.x, this.y, this.cellSize, this.cellSize );
        this.ctx.restore();
    };

    return Cursors;
});
