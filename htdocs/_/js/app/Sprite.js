'use strict';

define(['jquery'], function (jquery) {

    var Sprite = function (args) {
        width:      0,
        height:     0,
        frame:      0,
        loaded:         false,
        loadedImgs: 0,              // Count how many images are loaded
        alive:      false,          // set to true by start, turns false if all images are displayed and loop is set to false
        timer:      null,
        imgs:       {
            '01' : [],
            '10' : [],
            '00' : [],
            '-10': [],
            '0-1': []
        },

        ctx:            null,
        ctxX:       null,           // pos in canvas
        ctxY:       null,           // pos in canvas
        dirX:       0,              // direction
        dirY:       0,

        this.initialize();
    };

    Sprite.prototype.options = {
        baseDir         : null,           // Dir of animation images, each numbered
        totalImgs       : null,           // The total number of images in baseDir
        ext             : null,           // The extension of the images
        frameRate       : 40,             // For callback (cf explosions)
        width           : null,
        height          : null,
        dirX            : 0,              // Direction for sprite selection
        dirY            : 0,              // Direction, for sprite selection
        lopp            : true,           // Should animation loop?
        centre          : false   // Centre image on x/y
        startOnLoad     : true,
        startDelayMs    : 1000,
        onLoaded        : function () {         // Fired when all images are loaded
            if (this.options.startOnLoad) this.start.delay(
                this.options.startDelayMs,
                this
            )
        };
    };

    /* Accepts options hash and canvas context */
    Sprite.prototype.initialize = function ( options, ctx ) {
        var self = this;
        this.ctx = ctx;
        this.setOptions(options);
        if (this.options.x) this.x = this.options.x;
        if (this.options.y) this.y = this.options.y;
        if (this.options.dirX) this.dirX = this.options.dirX;
        if (this.options.dirY) this.dirY = this.options.dirY;
        if (this.options.width) this.width = this.options.width;
        if (this.options.height) this.height = this.options.height;
        if (!this.options.totalImgs) this.options.totalImgs = 1;
        if (this.options.totalImgs==1) this.options.loop = true;

        // Load each directions
        ['-10', '10', '00', '0-1', '01'].each( function(xy){
            // Load animation frames
            for (var i=1; i <= this.options.totalImgs; i++){
                var img = new Image();
                img.src = this.options.baseDir + '/'
                    +xy+'/'
                    +i+'.'+this.options.ext;
                img.addEvent('load', function(){
                    self.width = img.width;
                    self.height = img.height;
                    self.loadedImgs++;
                    // *4 to reflect direction graphics
                    if (self.loadedImgs == self.options.totalImgs*4){
                        self.loaded = true;
                        self.fireEvent('loaded');
                    }
                });
                this.imgs[xy].push( img );
            }
        }, this);
    };

    /* */
    Sprite.prototype.start = function ( useTimer ) {
        this.alive = true;
        useTimer = useTimer || this.useTimer || false;
        this.frame = 0;
        if (this.timer) clearInterval( this.timer );
        this.render();
        if (useTimer) this.timer = this.render.periodical( this.options.frameRate, this );
        return this;
    };

    /* Clears the timer, if set */
    Sprite.prototype.destroy = function () {
        if (this.timer) clearInterval( this.timer );
    };

    /* Render the sprite on canvas context this.ctx,
       at this.ctxX, this.ctxY,
       optinally accepting arguments to set that position. */
    Sprite.prototype.render = function (ctxX, ctxY) {
        if (!this.loaded) return;
        if (ctxX) this.ctxX = ctxX;
        if (ctxY) this.ctxY = ctxY;

        var xy = this.dirX+''+this.dirY;
        if (! this.imgs[xy] || ! this.imgs[xy][this.frame] ){
            throw( 'No '+xy+' img for frame '+this.frame );
        }

        if (this.options.centre){
            this.ctx.drawImage(
                this.imgs[xy][ this.frame ],
                this.ctxX,
                this.ctxY
            );
        }
        else {
            this.ctx.drawImage(
                this.imgs[xy][ this.frame ],
                this.ctxX + (this.width/2),
                this.ctxY + (this.width/2)
            );
        }

        // Next animation frame
        if (++this.frame == this.imgs[xy].length){
            // Loop the animation
            if (this.options.loop) this.frame = 0
            // The end of the loop may signal death
            else {
                this.alive = false;
                if (this.timer) clearInterval( this.timer );
                this.fireEvent('complete');
            }
        }
    };

});


