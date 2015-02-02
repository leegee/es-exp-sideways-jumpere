define( [
    'jquery',
    'app/Game',
    'app/Land',
    'app/Player',
    'app/Hud',
    'app/Air',
    'app/Cursors'
],
function (
    jquery, Game, Land, Player, Hud, Air, Cursors
) {
    jquery(document).ready( function () {
        jquery('body').html('');
        jquery(document.body).css({
            overflow: 'hidden'
        })
        var game = new Game({
            Land:   Land,
            Player: Player,
            Hud:    Hud,
            Air:    Air,
            Cursors: Cursors
        });
    });
});




