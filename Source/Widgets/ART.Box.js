/*
---
name: ART.Box
description: Base Box for other widgets to inherit from
requires: [ART.Sheet, ART.Widget, ART/ART.Rectangle]
provides: ART.Box
...
*/

(function(){
	
var Box = ART.Box = new Class({
	
	Extends: ART.Widget,
	
	name: 'box',
	
	options: {},
	
	initialize: function(options){
		this.parent(options);
		
		this.shadowLayer = new ART.Rectangle;
		this.borderLayer = new ART.Rectangle;
		this.reflectionLayer = new ART.Rectangle;
		this.backgroundLayer = new ART.Rectangle;
		this.canvas.grab(this.shadowLayer, this.borderLayer, this.reflectionLayer, this.backgroundLayer);
	},
	
	draw: function(newSheet){
		var sheet = this.parent(newSheet), cs = this.currentSheet;
		
		var boxChanged = !!(sheet.width || sheet.height || sheet.padding || sheet.borderRadius || sheet.pill);
		
		if (boxChanged){
			this.resize(cs.width, cs.height + 1);
			
			if (!cs.pill){
				var brt = cs.borderRadius[0], brr = cs.borderRadius[1];
				var brb = cs.borderRadius[2], brl = cs.borderRadius[3];
			}

			var pill = ((cs.width < cs.height) ? cs.width : cs.height) / 2;
			this.shadowLayer.draw(cs.width, cs.height, cs.pill ? pill : cs.borderRadius).translate(0, 1);
			this.borderLayer.draw(cs.width, cs.height, cs.pill ? pill : cs.borderRadius);
			this.reflectionLayer.draw(cs.width - 2, cs.height - 2, cs.pill ? pill - 1 : [brt - 1, brr - 1, brb - 1, brl - 1]).translate(1, 1);
			this.backgroundLayer.draw(cs.width - 2, cs.height - 3, cs.pill ? pill - 1 : [brt - 1, brr - 1, brb - 1, brl - 1]).translate(1, 2);
		}
		
		
		if (sheet.shadowColor) this.shadowLayer.fill.apply(this.shadowLayer, $splat(cs.shadowColor));
		if (sheet.borderColor) this.borderLayer.fill.apply(this.borderLayer, $splat(cs.borderColor));
		if (sheet.reflectionColor) this.reflectionLayer.fill.apply(this.reflectionLayer, $splat(cs.reflectionColor));
		if (sheet.backgroundColor) this.backgroundLayer.fill.apply(this.backgroundLayer, $splat(cs.backgroundColor));
		
		this.boxChanged = boxChanged;
		
		return sheet;
	}
	
});
	
})();
