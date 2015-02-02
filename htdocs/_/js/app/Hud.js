'use strict';

define(['jquery', 'mustache'], function (jquery, Mustache) {

    var Hud = function (args) {
        console.debug('Hud.constructor enter ', arguments);
        var self = this;
        this.rgb = [];
        this.clr = null;
        this.mode = args.mode;
        this.numberOfColours = args.numberOfColours;
        this.keys = {
            build: null,
            dig: null
        };
        this.el = {
            clrs: [],
            inventory: null,
            hud: null,
            mode: null
        };
        this.inventory = {
        };

        jquery.get('_/templates/hud.html', function (template) {
            jquery( document.body ).append(
                Mustache.render(template, {})
            );
            self.el.inventory = jquery('#inventory');
            self.el.inventory.hide();
            self.el.hud = jquery('#hud');
            self.el.palette = jquery('#palette');
            var i = 0;
            for (var hue=0; hue<360; hue+=(360 / self.numberOfColours)){
                self.el.clrs[i] = jquery(
                    '<li id="clr'+(i)+'" style="color:hsl('
                    + parseInt(hue)
                    + ',80%,70%)">0</li>'
                );
                self.el.palette.append( self.el.clrs[i] );
                i++;
            }

            self.keys.dig = ++i;
            self.keys.build = ++i;
            self.el.palette.append(
                '<li id="dig">⟰</li>'  +
                '<li id="build">⟱</li>'
            );

            self.setMode( self.mode );
        });
    };

    Hud.prototype.getClr = function () {
        if (typeof this.clr === 'undefined'){
            return false;
        }
        var rv = this.el.clrs[ this.clr ].css('color');
        console.log('Hud.getClr for %d = %d',this.clr, rv);
        return rv;
    };

    Hud.prototype.setClr = function (index) {
        index --;
        if (index <= this.numberOfColours){
            console.log('Select clr index ', index, ' to ', this.clr);
            if (this.clr !== null){
                this.el.clrs[ this.clr ].removeClass('highlight');
            }
            this.clr = index;
            this.el.clrs[ this.clr ].addClass('highlight');
        }
    };

    Hud.prototype.decreaseClr = function () {
        var v = parseInt( this.el.clrs[ this.clr ].text() );
        if (v>0){
            this.el.clrs[ this.clr ].text( v-1 )
        }
    };

    Hud.prototype.addRgb = function (rgb) {
        if (rgb !== null && typeof rgb[0] !== 'undefined'){
            var hsl = this.rgbToHsl(rgb[0], rgb[1], rgb[2]);
            var hue = parseInt(this.numberOfColours * hsl[0] );
            var text = this.el.clrs[hue].text() || 0;
            this.el.clrs[hue].text(
                parseInt( text ) + 1
            );
        }
    };

    /**
     * Thanks to ...?
     * Converts an RGB color value to HSL. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes r, g, and b are contained in the set [0, 255] and
     * returns h, s, and l in the set [0, 1].
     *
     * @param   Number  r       The red color value
     * @param   Number  g       The green color value
     * @param   Number  b       The blue color value
     * @return  Array           The HSL representation
     */
    Hud.prototype.rgbToHsl = function  (r, g, b){
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max == min){
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max){
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h, s, l];
    }

    Hud.prototype.setMode = function (mode) {
        if (this.el.mode) {
            this.el.mode.removeClass('highlight');
        }
        this.el.mode = jquery('#'+mode);
        this.el.mode.addClass('highlight');
        console.debug(this.el.mode);
    };

    Hud.prototype.toggleInventory = function () {
        this.el.inventory.toggle();
        if (this.el.inventory.css('display') !== 'none'){
        }
    };

    return Hud;
});
