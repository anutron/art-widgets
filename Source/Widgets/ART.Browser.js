/*
---
name: ART.Browser
description: A window with navigation controls.
requires: [ART.Window, ART.History]
provides: ART.Browser
...
*/

ART.Sheet.define('window.art.browser', {
	'header-height': 60,
	'header-overflow': 'visible'
});

ART.Sheet.define('window.art.browser history.art', {
	'padding': [0, 8, 0, 10]
});

ART.Sheet.define('window.art.browser:hidden history.art', {
	'padding': [0, 8, 0, 10],
	'display':'none'
}, 'css');

ART.Sheet.define('window.art.browser history.art', {
	'top':30,
	'position': 'absolute'
}, 'css');

ART.Sheet.define('window.art.browser history.art button.art', {
	'shadow-color': hsb(0, 0, 100, 0.4)
});

ART.Sheet.define('window.art.browser:dragging history.art', {
	'display': 'none'
}, 'css');

ART.Sheet.define('window.art.browser history.art', {
	'display': 'block'
}, 'css');


ART.Sheet.define('window.art.browser history.art divot', {
	'color': hsb(0, 0, 66)
});
ART.Sheet.define('window.art.browser:focused history.art divot', {
	'color': hsb(0, 0, 33)
});

ART.Browser = new Class({

	Extends: ART.Window,

	options: {
		className: 'art browser',
		historyOptions: {
			editable: false
		}
	},

	_build: function(){
		this.parent.apply(this, arguments);
		var styles = this.getSheet();
		this.history = new ART.History(
			$merge(this.options.historyOptions, {
				styles: {
					width: styles.width
				}
			})
		).inject(this, this.header);
		this.header.setStyles({
			'overflow': styles.headerOverflow
		});
		
		var sizerTimer;
		var sizer = function(){
			//have to delay here because this.currentWidth isn't defined
			//until after draw, which is also delayed
			$clear(sizerTimer);
			sizerTimer = (function(){
				this.history.resize(this.currentWidth);
			}).delay(1, this);
		}.bind(this);
		this.addEvents({
			shade: function() {
				this._dragging = true;
			},
			unshade: function(){
				this._dragging = false;
				sizer();
			},
			focus: function(){
				this.history.enable();
			},
			blur: function(){
				this.history.disable();
			},
			minimize: sizer,
			maximize: sizer,
			resize: sizer,
			show: sizer
		});
	}

});

ART.WindowTools.implement({

	getHistory: function() {
		return this.getWindow().history;
	}

});