/*global define:false, require:false, TEST_RUNNER:false */

define(function (require) {
	var jQuery = require("jquery");
	var fixture = '';

	describe('Example of AJAX: a fixture HTML file', function () {

		// Before every test in this suite:
		beforeEach( function (done) {
			this.timeout(1000);
			jQuery.ajax(  'examples/fixture.html', {
				success: function( content ){
					// Place the fixture into the DOM
					jQuery( TEST_RUNNER.html_fixture_selector ).html( jQuery.parseHTML( content ) );
					fixture = content;
				},
				error: function    (e) { throw new Error(e); },
				complete: function ()  { done(); }
			});
		});

		afterEach( function (done) {
			jQuery( TEST_RUNNER.html_fixture_selector ).html('');
			done();
		});

		it('should have been loaded by beforeEach', function (done) {
			var x = {};
			x.should.be.type('object');
			done();
		});
	});

});


