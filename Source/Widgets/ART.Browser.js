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
	'padding': '0 8px 0 10px',
	'position': 'absolute'
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

	_build: function(){
		this.parent.apply(this, arguments);
		this.history = new ART.History(this.options.historyOptions).setState('hidden', true).inject(this, this.header);
		this.history._firstHidden = true;
		document.id(this.history).setStyle('opacity', 0);
		var styles = ART.Sheet.lookup(this.toString());
		this.header.setStyles({
			'overflow': styles.headerOverflow
		});
		this.addEvents({
			shade: function() {
				this._dragging = true;
			}.bind(this),
			unshade: function(){
				this._dragging = false;
				this.history.resize();
			}
		});
	},

	_resizeHistory: function(){
		var delta = 0;
		['margin-left', 'margin-right', 'padding-left', 'padding-right'].each(function(dim) {
			delta += $(this.history).getStyle(dim).toInt();
		}, this);
		this.history.resize(this.currentWidth - delta);
	},

	resize: function(){
		this.parent.apply(this, arguments);
		if (this.history && !this._dragging) this._resizeHistory();
	},

	show: function() {
		var ret = this.parent.apply(this, arguments);
		if (this.history) this._resizeHistory();
		return ret;
	},

	draw: function(){
		this.parent.apply(this, arguments);
		if (this.history._firstHidden) {
			this.history._firstHidden = false;
			this._resizeHistory();
			document.id(this.history).setStyle('opacity', 1);
		}
	}

});

ART.WindowTools.implement({

	getHistory: function() {
		return this.getWindow().history;
	}

});