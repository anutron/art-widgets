ART.Sheet.defineStyle('window.browser', {
	'header-height': 60,
	'header-overflow': 'visible'
});

ART.Sheet.defineStyle('history.browser', {
	'top':30,
	'padding': '0 8px 0 10px'
});

ART.Sheet.defineStyle('history input', {
	'left': 66
});

ART.Sheet.defineStyle('history input.disabled', {
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
	
	build: function(){
		this.parent.apply(this, arguments);
		this.history = new ART.History(this.options.historyOptions);
		this.history.setParent(this);
		$(this.history).inject(this.header);
		var styles = ART.Sheet.lookupStyle(this.getSelector());
		this.header.setStyles({
			'overflow': styles.headerOverflow
		});
		this.history.resize();
	},

	render: function(){
		this.parent.apply(this, arguments);
		if (this.history) this.history.render();
	},
	
	resize: function(){
		this.parent.apply(this, arguments);
		if (this.history) this.history.resize();
	},

	focus: function(){
		this.parent.apply(this, arguments);
		if (this.history) this.history.enable();
	},

	blur: function(){
		this.parent.apply(this, arguments);
		if (this.history) this.history.disable();
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