ART.Sheet.defineStyle('window.browser', {
	'header-height': 60,
	'header-overflow': 'visible'
});

ART.Sheet.defineCSS('window.browser history', {
	'top':30,
	'padding': '0 8px 0 10px'
});

ART.Sheet.defineCSS('window.browser history input', {
	'left': 66
});

ART.Sheet.defineCSS('window.browser history input.disabled', {
	'left': 66
});

ART.Browser = new Class({

	Extends: ART.Window,

	options: {
		className: 'browser',
		historyOptions: {
			className: 'browser',
			editable: false
		}
	},

	initialize: function(){
		this.requireToRender('browser:history');
		this.parent.apply(this, arguments);
	},

	build: function(){
		this.parent.apply(this, arguments);
		this.history = new ART.History(
			$extend(this.options.historyOptions, {
				parentWidget: this
			})
		);
		$(this.history).inject(this.header);
		var styles = ART.Sheet.lookupStyle(this.getSelector());
		this.header.setStyles({
			'overflow': styles.headerOverflow
		});
		this.readyToRender('browser:history');
		this.history.resize();
		this.addEvent('shade', function(dragging) {
			if (!dragging) this.history.resize();
		}.bind(this));
	},

	redraw: function(){
		this.parent.apply(this, arguments);
		if (this.history) this.history.render();
	},
	
	resize: function(){
		this.parent.apply(this, arguments);
		if (this.history) this.history.resize();
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