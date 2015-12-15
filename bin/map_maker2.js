'use strict';

const fs         = require('fs'),
      path       = require('path'),
      gm         = require('gm').subClass({imageMagick: true}),
      getPixels  = require("get-pixels"),

      inputImagePath  = path.normalize( __dirname + '/../htdocs/img/passmore-fg.png'),
      outputImagePath = path.normalize( __dirname + '/../htdocs/img/passmore-fg.small.png'),
      outputImageJs   = path.normalize( __dirname + '/../htdocs/img/passmore-fg.small.js'),
      BLACK      = 256,
      WHITE      = 257,
      ResizeTo   = 1000
;

var   Scale      = null

const processPixels = function (px) {
        var rvXy = [];

        for (var x=0; x < px.shape[0]; x++) {
            rvXy[x] = [];
            for (var y=0; y < px.shape[1]; y++) {
                var r = px.get(x,y,0),
                    g = px.get(x,y,1),
                    b = px.get(x,y,2);
                // Ignoring alpha

                // Grey and white codes
                if (r === g && r === b){
                    if (r < 127){
                        rvXy[x][y] = BLACK;
                    } else {
                        rvXy[x][y] = WHITE;
                    }
                }

                // https://en.wikipedia.org/wiki/Hue#Computing_hue_from_RGB
                else if ((r >= g) && (g >= b)) {
                    rvXy[x][y] = parseInt( 60 * (      (g-b) / (r-b) ) );
                }
                 else if ((g > r) && (r >= b)) {
                    rvXy[x][y] = parseInt( 60 * (2 - ( (r-b) / (g-b) )) );
                }
                else if ((g >= b) && (g > r)) {
                    rvXy[x][y] = parseInt( 60 * (2 + ( (b-r) / (g-r) )) );
                }
                else if ((b > g) && (b > r)) {
                    rvXy[x][y] = parseInt( 60 * (4 - ( (g-r) / (b-r) )) );
                }
                else if ((b > r) && (b >= g)) {
                    rvXy[x][y] = parseInt( 60 * (4 + ( (r-g) / (b-g) )) );
                }
                else { // if ((r >= b) && (r > g)) {
                    rvXy[x][y] = parseInt( 60*(6 - (b-g)/(r-g)) );
                }
            }
        }

        return rvXy;
    }
;


// var writeStream = fs.createWriteStream( outputImagePath );

const setScale = function (img){
    return new Promise( function (resolve, reject) {
        gm( inputImagePath ).size(function(err, size){
            Scale = size.width >= size.height? size.width / ResizeTo : size.height / ResizeTo;
            console.log("Size, scale: ", size, Scale );
            resolve();
        });
    });
};

const resize = function (img) {
    return new Promise( function (resolve, reject) {
        gm( inputImagePath ).resize( ResizeTo ).write( outputImagePath, function (err) {
            if (err) throw err;
            console.log('Wrote', outputImagePath);
            resolve();
        });
    });
};

const process = function (img) {
    return new Promise( function (resolve, reject) {
        getPixels( outputImagePath, 'image/png', function (err, px) {
            if (err) throw err;
            var map = processPixels(px);
            fs.writeFileSync( outputImageJs, JSON.stringify( {
                map: map,
                scale: Scale,
                note: "Divide "+inputImagePath+" by scale, "+Scale
            } ));
            console.log('Wrote', outputImageJs);
            resolve();
        });
    });
};


console.log('Input', inputImagePath);
var img = gm( inputImagePath );
setScale(img).then( function (){
    resize(img);
}).then( function (){
    process(img);
});
