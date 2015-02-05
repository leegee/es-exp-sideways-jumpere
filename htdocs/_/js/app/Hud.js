'use strict';

define(['jquery', 'mustache'], function (jquery, Mustache) {

    var Hud = function (args) {
        console.debug('Hud.constructor enter ', arguments);
        var self = this;
        this.rgb = [];
        this.clr = null;
        this.mode = args.mode;
        this.setExternalMode = args.setMode;
        this.numberOfColours = args.numberOfColours;
        this.keys = {};
        this.el = {
            clrs: [],
            inventory: null,
            hud: null,
            mode: null
        };
        this.inventory = {
            clrs: [],
            visible: false
        };

        jquery.get('_/templates/hud.html', function (template) {
            jquery( document.body ).append(
                Mustache.render(template, {})
            );
            self.el.inventory = jquery('#inventory');
            self.el.inventory.el = jquery('#inventory_clrs');
            self.el.inventory.hide();
            self.el.hud = jquery('#hud');
            self.el.palette = jquery('#palette');
            var i = 0;
            for (var hue=0; hue<360; hue+=(360 / self.numberOfColours)){
                self.el.clrs[i] = jquery(
                    '<li data-index="'+i+'" class="clr clr'+(i)+'" style="background-color:hsl('
                    + parseInt(hue)
                    + ',80%,70%)">0</li>'
                );
                self.el.palette.append( self.el.clrs[i] );
                i++;
            }

            self.setMode( 'dig' );
        });
    };

    // Get colour from inventory if available
    // Return CSS colour or null if none available
    Hud.prototype.getClr = function () {
        if (this.clr === null){
            return false;
        }
        var val = parseInt( this.el.clrs[ this.clr ].text() );
        if (val == 0){
            console.debug('Nothing for ', this.clr);
            return null;
        } else {
            var rv = this.el.clrs[ this.clr ].css('background-color');
            console.log('Hud.getClr for %d = %d',this.clr, rv);
        }
        return rv;
    };

    Hud.prototype.setClr = function (index) {
        console.log('setClr ', index);
        if (index <= this.numberOfColours){
            if (this.clr !== null){
                this.el.clrs[ this.clr ].removeClass('highlight');
            }
            console.log('Select clr index to ', index);
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
        console.log('setMode ', mode);
        this.setExternalMode(mode);
        if (this.el.mode) {
            this.el.mode.removeClass('highlight');
        }
        this.el.mode = jquery('#'+mode);
        this.el.mode.addClass('highlight');
        console.debug(this.el.mode);
    };

    Hud.prototype.toggleInventory = function () {
        this.el.inventory.toggle();
        if (this.el.inventory.css('display') === 'none'){
            this.el.inventory.el.html('');
            this.inventory.visible = false;
            return;
        }

        this.inventory.visible = true;
        var self = this;

        // Colours for building:
        var coloursOnScreen = 0;
        for (var i=0; i<this.el.clrs.length; i++){
            if (parseInt(this.el.clrs[i].text()) > 0){
                coloursOnScreen ++;
                var clr = this.el.clrs[i].clone();
                this.el.inventory.el.append(clr);
                clr.click(function (e){
                    self.setClr( e.target.dataset.index );
                    self.setMode('build');
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                })
            }
        }

        if (coloursOnScreen==0){
            this.el.inventory.el.append(
                '<p>You need to mine some colours before you can build!'
            );
            return;
        }

        // Digging:
        jquery('#spade').click( function (e){
            self.setMode('dig');
        });

    };

    return Hud;
});
