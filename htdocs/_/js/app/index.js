define( [
    'modernizer', 'jquery',
    'app/Game',
    'app/Land',
    'app/Player',
    'app/Hud'
],
function (
    _, jquery, Game, Land, Player, Hud
) {
    jquery(document).ready( function () {
        jquery('body').html('');
        jquery(document.body).css({
            overflow: 'hidden'
        })
        var game = new Game({
            Land:   Land,
            Player: Player,
            Hud:    Hud
        });
    });
});




