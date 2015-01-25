'use strict';

define(['jquery', 'mustache'], function (jquery, Mustache) {

    var Hud = function (args) {
        console.debug('Hud.constructor enter ', arguments);
        var self = this;
        this.rgb = [];
        this.clr = null;
        this.numberOfColours = args.numberOfColours;
        this.el = {
            clrs: [],
            hud: null,
            mode: null
        };

        jquery.get('_/templates/hud.html', function (template) {
            self.el.hud = Mustache.render(template, {});;
            jquery( document.body ).append( self.el.hud );
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
        });
    };

    Hud.prototype.setClr = function (index) {
        index --;
        if (index <= this.numberOfColours){
            if (this.clr !== null){
                this.el.clrs[ this.clr ].removeClass('highlight');
            }
            this.clr = index;
            this.el.clrs[ this.clr ].addClass('highlight');
            console.log('Select clr index ', this.clr);
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

    return Hud;
});
