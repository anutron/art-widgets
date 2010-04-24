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
	'top':30,
	'padding': '0 8px 0 10px'
}, 'css');

ART.Sheet.define('window.art.browser history.art button.art', {
	'shadow-color': hsb(0, 0, 100, 0.4)
});

ART.Sheet.define('window.art.browser history.art input', {
	'left': 58
}, 'css');

ART.Sheet.define('window.art.browser history.art input.disabled', {
	'left': 58
}, 'css');

ART.Sheet.define('window.art.browser:dragging history.art', {
	'display': 'none'
}, 'css');

ART.Sheet.define('window.art.browser history.art', {
	'display': 'block'
}, 'css');

ART.Browser = new Class({

	Extends: ART.Window,

	options: {
		className: 'art browser',
		historyOptions: {
			className: 'art browser',
			editable: false
		}
	},

	initialize: function(){
		this.requireToRender('browser:history');
		this.parent.apply(this, arguments);
	},

	build: function(){
		this.parent.apply(this, arguments);
		this.history = new ART.History(this.options.historyOptions).register(this);
		$(this.history).inject(this.header);
		var styles = ART.Sheet.lookupStyle(this.getSelector());
		this.header.setStyles({
			'overflow': styles.headerOverflow
		});
		this.readyToRender('browser:history');
		this.history.resize();
		this.addEvent('shade', function(dragging) {
			this._dragging = dragging;
			if (!dragging) this.history.resize();
		}.bind(this));
	},

	redraw: function(){
		this.parent.apply(this, arguments);
		if (this.history && !this._dragging) this.history.render();
	},
	
	resize: function(){
		this.parent.apply(this, arguments);
		if (this.history && !this._dragging) this.history.resize();
	},

	show: function() {
		this.parent.apply(this, arguments);
		if (this.history) this.history.resize();
	}


});

ART.WindowTools.implement({

	getHistory: function() {
		return this.getWindow().history;
	}

});