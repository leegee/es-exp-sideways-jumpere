

define(function (require) {
	var jQuery = require("jquery");
	describe('Example: a very simple test', function(){
		it('shows a primitive is defined as an object', function (done) {
			var x = {};
			x.should.be.type('object');
			done();
		});
	});
});


