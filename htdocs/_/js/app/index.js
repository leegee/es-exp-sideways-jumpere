define( [
    'modernizer', 'jquery', 'app/Land', 'app/Game'
],
function (
    _, jquery, Land, Game
) {
    jquery(document).ready( function () {
        jquery('body').html('');
        var land = new Land();
        var game = new Game({
            land: land
        });
        land.onReady( game, game.run );
    });
});




