/*
Script: ART.Button.Nav.js

License:
	MIT-style license.
*/

// Button Widget. Work in progress.

(function(){

var nav = {
	'width': 27, 
	'height': 19,
	// 'glyph': ART.Glyphs.triangleLeft,
	'glyph-stroke': 0,
	'glyph-fill': true,
	'glyph-height': 9,
	'glyph-width': 8,
	'glyph-top': 5,
	'glyph-left': 10,
	
	'corner-radius-top-left': 4,
	'corner-radius-top-right': 0,
	'corner-radius-bottom-right': 0,
	'corner-radius-bottom-left': 4
};
//TODO: how can I mixin styles?
ART.Sheet.defineStyle('button.navLeft', nav);
ART.Sheet.defineStyle('button.navUp', $merge(nav, {
	// 'glyph': ART.Glyphs.triangleUp,
	'glyph-height': 8,
	'glyph-width': 9
}));
ART.Sheet.defineStyle('button.navDown', $merge(nav, {
	// 'glyph': ART.Glyphs.triangleDown,
	'glyph-height': 8,
	'glyph-width': 9
}));
ART.Sheet.defineStyle('button.navRight', $merge(nav, {
	// 'glyph-left': 1,
	// 'glyph': ART.Glyphs.triangleRight,
	'corner-radius-top-left': 0,
	'corner-radius-top-right': 4,
	'corner-radius-bottom-right': 4,
	'corner-radius-bottom-left': 0
}));


//TODO: this doesn't cascade from button:active
ART.Sheet.defineStyle('button.navLeft:active', {
	'fill-color': {0: hsb(0, 0, 70), 1: hsb(0, 0, 30, 0)},
	'border-color': hsb(0, 0, 0, 0.8)
});
ART.Sheet.defineStyle('button.navRight:active', {
	'fill-color': {0: hsb(0, 0, 70), 1: hsb(0, 0, 30, 0)},
	'border-color': hsb(0, 0, 0, 0.8)
});

// ART.Button.Nav = {}; //I dont believe this class is needed at all.
// 
// ['left', 'right', 'up', 'down'].each(function(dir) {
// 
// 	var upper = dir.capitalize();
// 	
// 	ART.Button.Nav[upper] = new Class({
// 
// 		Extends: ART.Button,
// 
// 		options: {
// 			direction: dir,
// 			className: 'nav' + upper
// 		}// ,
// 		// 
// 		// 		makeGlyph: function(){
// 		// 			var style = ART.Sheet.lookupStyle(this.getSelector());
// 		// 			this.paint.start({x: style.glyphLeft, y: style.glyphTop});
// 		// 			this.paint.shape(style.glyph, {x: style.glyphWidth, y: style.glyphHeight}, this.options.direction);
// 		// 			if (style.glyphStroke) this.paint.end({'stroke': true, 'stroke-width': style.glyphStroke, 'stroke-color': style.glyphColor});
// 		// 			else if (style.glyphFill) this.paint.end({fill: true, fillColor: style.glyphColor});
// 		// 			else this.paint.end();
// 		// 		}
// 
// 	});
// 
// });

// ART.Button.Nav = new Class({
// 	Extends: ART.Button,
// 
// 	options: {
// 		// direction: dir,
// 		className: 'nav' + upper
// 	}
// });

})();