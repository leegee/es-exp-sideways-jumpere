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
      resizeTo   = 1000
;

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

console.log('Open', inputImagePath);

gm( inputImagePath )
.resize( resizeTo )
.write( outputImagePath, function (err) {
    if (err) throw err;
    console.log('Wrote', outputImagePath);
    getPixels( outputImagePath, 'image/png', function (err, px) {
        if (err) throw err;
        fs.writeFileSync( outputImageJs, JSON.stringify( processPixels(px)) );
        console.log('Wrote', outputImageJs);
    });
});

