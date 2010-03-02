/*
Script: ART.SolidWindow.js

License:
	MIT-style license.
*/

// Window Widget. Work in progress.

ART.Sheet.defineStyle('window.solid', {
	'content-overflow': 'hidden',
	'body-background-color': [hsb(0, 0, 95), hsb(0, 0, 80)],
	'body-reflection-color': [hsb(0, 0, 100, 1), hsb(0, 0, 0, 0)],
	'body-reflection-shape': 'rounded-rectangle'
});

ART.Sheet.defineStyle('window.solid.smoke', {
	'caption-font-color': hsb(120, 97, 83),
	'body-background-color': [hsb(0, 0, 0, 0.9), hsb(0, 0, 0, 0.8)],
	'body-reflection-color': [hsb(0, 0, 100, 0.05), hsb(0, 0, 100, 0.1)],
	'body-reflection-percent-size': 0.6,
	'content-color': hsb(120, 97, 83),
	'body-reflection-shape': 'funky-glass'
});


ART.Sheet.defineStyle('window.solid.smoke button.wincontrol', {
	'pill': true,
	'height': 14,
	'width': 14,
	'cursor': 'pointer',
	'background-color': hsb(0, 0, 100, 0),
	'reflection-color': hsb(0, 0, 100, 0),
	'shadow-color': hsb(0, 0, 100, 0),
	'border-color': hsb(0, 0, 100, 0),
	'glyph-color': hsb(120, 97, 83)
});

ART.Sheet.defineStyle('window.solid button.wincontrol', {
	'background-color': [hsb(0, 0, 80), hsb(0, 0, 70)],
	'reflection-color': [hsb(0, 0, 95), hsb(0, 0, 0, 0)],
	'shadow-color': hsb(0, 0, 100, 0.7),
	'border-color': hsb(0, 0, 60),
	'glyph-color': hsb(0, 0, 0, 0.6)
});

ART.Sheet.defineStyle('window.solid.smoke button.wincontrol:disabled', {
	'background-color': hsb(0, 0, 100, 0),
	'reflection-color': hsb(0, 0, 100, 0),
	'shadow-color': hsb(0, 0, 100, 0),
	'border-color': hsb(0, 0, 100, 0),
	'glyph-color': hsb(120, 97, 83)
});

ART.Sheet.defineStyle('window.solid.smoke button.wincontrol:active', {
	'background-color': hsb(0, 0, 100, 0),
	'reflection-color': hsb(0, 0, 100, 0),
	'shadow-color': hsb(0, 0, 100, 0),
	'border-color': hsb(0, 0, 100, 0),
	'glyph-color': hsb(0, 0, 100, 1)
});

ART.SolidWindow = new Class({
	
	Extends: ART.Window,
	
	name: 'window',

	options: {
		className: 'solid'
	},

	renderContent: function(style){
		var contentHeight = style.height - style.footerHeight - style.headerHeight - 2;
		var contentWidth = style.width -2;
		this.contentSize = {
			w: contentWidth, 
			h: contentHeight
		};
		if (style.contentVisibility == "hidden") {
			this.content.setStyle('display', 'none');
		} else {
			this.content.setStyles({
				'top': 1,
				'left': 0,
				'height': contentHeight < 0 ? 0 : contentHeight,
				'width': contentWidth < 0 ? 0 : contentWidth,
				'overflow': style.contentOverflow,
				'color': style.contentColor,
				'display': 'block'
			});
		}

		// border layer
		
		this.borderLayer.draw(style.width, style.height, style.cornerRadius + 1);
		this.fill(this.borderLayer, style.borderColor);

		// header layers

		this.header.setStyles({'width': style.width - 2, height: style.headerHeight - 2});
		
		this.headerBackgroundLayer.translate(1, 2);
		this.headerBackgroundLayer.draw(style.width - 2, style.height - 3, style.cornerRadius);
		this.fill(this.headerBackgroundLayer, style.bodyBackgroundColor);
		
		this.headerReflectionLayer.translate(1, 1);
		this.headerReflectionLayer.draw(style.width - 2, style.headerHeight - 2, style.cornerRadius);
		this.fill(this.headerReflectionLayer, style.bodyReflectionColor);

		//footer layers

		this.footer.setStyles({'width': style.width - 2, 'height': style.footerHeight});

	}

});

// ## I have no idea what this is

// ART.Paint.defineShapes({
// 	'funky-glass': function(size, radius){
// 		size = this.getXY(size);
// 		if (radius == null) radius = [5, 5];
// 		if (typeof radius == 'number') radius = [radius, radius];
// 		
// 		var tl = radius[0], tr = radius[1];
// 		
// 		this.moveBy({x: 0, y: tl});
// 		
// 		if (size.x < 0) this.moveBy({x: size.x, y: 0});
// 		if (size.y < 0) this.moveBy({x: 0, y: size.y});
// 		
// 		if (tl > 0) this.roundCapLeftBy({x: tl, y: -tl});
// 		this.lineBy({x: Math.abs(size.x) - (tr + tl), y: 0});
// 		
// 		if (tr > 0) this.roundCapRightBy({x: tr, y: tr});
// 		this.lineBy({x: 0, y: Math.abs(size.y * 0.5) - tr});
// 
// 		this.roundCapRightBy({x: - size.x, y: size.y - (size.y * 0.5)});
// 
// 
// 		this.lineBy({x: 0, y: - Math.abs(size.y * 0.5) + tl});
// 		
// 		this.moveBy({x: size.x, y: -tl + size.y});
// 	}
// });