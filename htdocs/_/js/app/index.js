define( [
    'jquery',
    'app/Game',
    'app/Land',
    'app/Player',
    'app/Hud',
    'app/Air'
],
function (
    jquery, Game, Land, Player, Hud, Air
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
            Air:    Air
        });
    });
});




