// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }

    // Allows tests to use this file, too
    var baseUrl = window.require_base_url || "_/js/";

    require.config({
        baseUrl: baseUrl, // Relative to the caller
        paths: {
            jquery: [
                '//ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min',
                'vendor/bower_components/jquery/dist/jquery.min'
            ],
            modernizer : 'vendor/modernizr-2.8.0.min',
            mustache: 'vendor/mustache'

        },
        shim: {
        }
    });

}());
