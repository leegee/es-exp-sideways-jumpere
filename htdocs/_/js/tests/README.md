Mocha Tests: Read Me First
==========================
This directory contains mocha tests that can be run through
`grunt`, or run in a browser through the `runner.html`.

`grunt test` will start a `connect` web server on `127.0.0.1:81818`,
lint the tests with `jshint`, then run the tests.

`grunt watch` will do the same every time a watched file is
changed — see `Gruntfile.js` to alter the watched files.

Adding Tests
------------
Add test path to the `TEST_SPECS` variable in `runner.html` —
example tests can be found in `examples/`.

FAQ
----
* Detect Phantom JS client: `navigator.userAgent.indexOf('PhantomJS')`
* Test not running? Add it to `runner.html`
