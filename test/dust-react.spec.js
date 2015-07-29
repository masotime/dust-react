'use strict';
var dust = require('dustjs-linkedin'),
	dustReact = require('../index'),
	path = require('path'),
	fs = require('fs'),
	cheerio = require('cheerio'),
	expect = require('chai').expect;

describe('dust-react', function () {

	var template, fixturesPath;

	before(function (done) {
		fixturesPath = path.join(process.cwd(), 'test', 'fixtures');
		fs.readFile(path.join(fixturesPath, 'test.dust'), 'utf8', function(err, result) {
			template = result;
			done(err);
		});

		dustReact(dust, {
			relativePath: path.join('test', 'fixtures')
		});
	});

	it('should be loaded properly into dust', function (done) {

		var compiled = dust.compile(template, 'sample'),
			nameProps = {
				value: 'red',
				tooltip: 'green',
				label: 'Colour',
				id: 'color'
			};
		dust.loadSource(compiled);
		dust.render('sample', { nameProps: nameProps }, function (err, result) {
			var $;

			if (err) {
				done(err);
			} else {
				try {
					$ = cheerio.load(result);

					expect($('div.text').length).to.equal(1);
					expect($('div.text label[for="color"]').text()).to.equal(nameProps.label);
					expect($('div.text input').val()).to.equal(nameProps.value);
					expect($('div.text input').attr('id')).to.equal(nameProps.id);
					expect($('div.text div.tooltip').text()).to.equal(nameProps.tooltip);
					done();
				} catch (cheerioError) {
					done(cheerioError);
				}

			}
		});

	});

});

