/*
---
name: ART.Input
description: Base Input Class
requires: [ART.Sheet, ART.Input, ART.Glyphs]
provides: ART.Button
...
*/

(function(){

ART.Sheet.define('search.art', $merge(ART.Sheet.lookup('input.art'), {
	'padding': [2, 12, 2, 22],
	'pill': true,
	'glyph': ART.Glyphs.search,
	'glyph-color': 'hsb(0, 0, 0, 0.7)',
	'glyph-top': 5,
	'glyph-left': 6
}));

ART.Sheet.define('search.art:focused', {
	'border-color': ['hsb(205, 80, 100)', 'hsb(205, 100, 95)']
});

var Search = ART.Search = new Class({
	
	Extends: ART.Input,
	
	name: 'search',
	
	options: {
		placeholder: 'search…'
	}
	
});

})();