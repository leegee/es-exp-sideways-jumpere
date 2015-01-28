'use strict';

define(['jquery'], function (jquery) {

/*  An image on a canvas.
    The canvas is moved by CSS, the canvas is editable.
    Faster than repainting a large iamge eery frame.
*/
    var Grid = function (args) {
        console.debug('Grid.constructor enter ', arguments);
        var self    = this;
        this.cellSize   = args.cellSize;
        this.width      = args.width;
        this.height     = args.height;

        this.el = jquery(
            '<canvas id="grid"'
            +'width="'+this.width+'" height="'+this.height+'" '
            +'style="'
                +'width:'+this.width+'px;height:'+this.height+'px;'
            +'"/>'
        );
        jquery( document.body ).append( this.el );

        this.dom = this.el.get(0);
        this.ctx = this.dom.getContext('2d');

        this.ctx.lineWidth = '1';
        this.ctx.style = '#000000';
        for (var y=this.cellSize; y<this.height; y+=this.cellSize ){
            this.ctx.moveTo(0,y);
            this.ctx.lineTo(this.width,y);
            this.ctx.stroke();
        }

       for (var x=this.cellSize; x<this.width; x+=this.cellSize ){
            this.ctx.moveTo(x,0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
       }
    }

    return Grid;
});
