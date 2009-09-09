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
		$(this.history).inject(this.header);
		this.history.resize();
		var styles = ART.Sheet.lookupStyle(this.getSelector());
		this.header.setStyles({
			'overflow': styles.headerOverflow
		});
	},
	
	render: function(){
		this.parent.apply(this, arguments);
		if (this.history) this.history.render();
	},
	
	resize: function(){
		this.parent.apply(this, arguments);
		if (this.history) this.history.resize();
	}

});