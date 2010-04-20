/*
---
name: ART.SplitView
description: A simple horizonal double-pane split view.
requires: [ART.Widget, ART.Sheet, Core/Element.Event, Core/Element.Style, Touch/Touch, Core/Fx.Tween]
provides: ART.SplitView
...
*/

ART.Sheet.defineStyle('splitview', {
	'width': 600,
	'height': 400,
	'fixed-width': 200,
	'max-fixed-width': 400,
	'min-fixed-width': null,
	'splitter-width': 3,
	//IE doesn't support east-west resize cursor; just use east
	'splitter-cursor': Browser.Engine.trident ? 'e-resize' : 'ew-resize',
	
	'splitter-background-color': hsb(0, 0, 50),
	'left-background-color': '#d6dde5',
	
	'right-background-color': '#fff'
});

ART.Sheet.defineStyle('splitview:disabled', {
	'splitter-background-color': hsb(0, 0, 70),
	'left-background-color': '#e8e8e8'
});

ART.SplitView = new Class({
	
	Extends: ART.Widget,
	
	Implements: [Options, Events, Chain],
	
	options: {
		fixed: 'left', 
		resizable: true, 
		foldable: true,
		hideSplitterOnFullFold: false
	},
	
	name: 'splitview',
	
	initialize: function(options){
		this.requireToRender('splitview:panes');
		this.parent(options);
		this.build();
	},

	build: function(){
		var style = ART.Sheet.lookupStyle(this.getSelector());

		this.element.addClass('art-splitview').setStyles({'position': 'relative'});
		var styles = {'float': 'left', 'overflow-x': 'auto'};
		this.left = new Element('div', {'class': 'art-splitview-left'}).inject(this.element).setStyles(styles);
		this.splitter = new Element('div', {'class': 'art-splitview-splitter'}).inject(this.element).setStyles(styles);
		this.right = new Element('div', {'class': 'art-splitview-right'}).inject(this.element).setStyles(styles);
		
		this.fx = new Fx();
		this.touch = new Touch(this.splitter);
		var self = this;
		var fix = self.options.fixed;
		var Fix = fix.capitalize();
		
		if (this.options.resizable || this.options.foldable){
			this.touch.addEvent('start', function(){
				self.startFixWidth = self[fix + 'Width'];
			});
		}

		if (this.options.resizable) this.touch.addEvent('move', this.moveSplitter.bind(this));

		if (this.options.foldable){
			this.touch.addEvent('cancel', function(){
				if (self[fix + 'Width'] == 0){
					self['fold' + Fix](self.previousSize);
				} else {
					self.previousSize = self.startFixWidth;
					self['fold' + Fix](0);
				}
			});
		}
		
		this.readyToRender('splitview:panes');
		this.render();
		this['resize' + this.options.fixed.capitalize()](style.fixedWidth);
	},

	moveSplitter: function(dx){
		var targetWidth = this.startFixWidth + dx;
		if (targetWidth < 0) targetWidth = 0;
		else if (targetWidth > this.currentWidth - this.splitterWidth) targetWidth = this.currentWidth - this.splitterWidth;
		var fix = this.options.fixed.capitalize();
		this['resize' + fix](targetWidth);
	},

	redraw: function(override){
		var style = ART.Sheet.lookupStyle(this.getSelector());

		this.currentHeight = $pick(this.currentHeight, style.height);
		this.currentWidth = $pick(this.currentWidth, style.width);
		this.splitterWidth = style.splitterWidth;
		
		
		// height / width management
		
		delete style.height;
		delete style.width;
		
		$mixin(style, override);
		if (style.height == null) style.height = this.currentHeight;
		if (style.width == null) style.width = this.currentWidth;
		
		this.currentHeight = style.height;
		this.currentWidth = style.width;
		
		// render
		
		this.element.setStyles({'width': this.currentWidth, 'height': this.currentHeight});
		
		this.splitter.setStyles({'width': style.splitterWidth, 'background-color': style.splitterBackgroundColor});
		if (this.options.resizable) this.splitter.setStyle('cursor', style.splitterCursor);
		this.left.setStyles({'background-color': style.leftBackgroundColor});
		this.right.setStyles({'background-color': style.rightBackgroundColor});
		
		$$(this.left, this.right, this.splitter).setStyle('height', this.currentHeight);
		
		var side = this.options.fixed;
		
		if (side == 'left'){
			this.resizeRight(this.currentWidth - this.leftWidth - style.splitterWidth);
		} else if (side == 'right'){
			this.resizeLeft(this.currentWidth - this.rightWidth - style.splitterWidth);
		}
		
		return this;
	},
	
	resize: function(w, h){
		return this.render({'height': h, 'width': w});
	},
	
	resizeLeft: function(width){
		width = width.limit(0, this.currentWidth - this.splitterWidth);
		this.left.setStyle('width', width);
		this.leftWidth = width;
		this.rightWidth = this.currentWidth - this.splitterWidth - width;
		this.right.setStyle('width', this.rightWidth);
	},
	
	resizeRight: function(width){
		width = width.limit(0, this.currentWidth - this.splitterWidth);
		this.right.setStyle('width', width);
		this.rightWidth = width;
		this.leftWidth = this.currentWidth - this.splitterWidth - width;
		this.left.setStyle('width', this.leftWidth);
	},
	
	fold: function(side, to, hideSplitter) {
		hideSplitter = $pick(hideSplitter, this.options.hideSplitterOnFullFold);
		var self = this;
		var other = side == 'left' ? 'right' : 'left';
		this.fx.set = function(now){
			self['resize' + side.capitalize()](now);
		};
		if (to > 0 && this[side + 'Width'] && this.splitterHidden) {
			var style = ART.Sheet.lookupStyle(self.getSelector());
			self.splitter.setStyle('width', style.splitterWidth);
			self[other].setStyle('width', self[other + 'Width'] - style.splitterWidth);
			this.splitterHidden = false;
		}
		this.fx.start(this[side + 'Width'], to).chain(function(){
			if (hideSplitter) {
				['left', 'right'].each(function(side) {
					var other = side == 'left' ? 'right' : 'left';
					if (self[side + 'Width'] == 0) {
						var style = ART.Sheet.lookupStyle(self.getSelector());
						self.splitter.setStyle('width', 0);
						self[other].setStyle('width', self[other + 'Width'] + style.splitterWidth);
						self[other + 'Width'] = self[other + 'Width'] + style.splitterWidth;
					}
				});
				this.splitterHidden = true;
			}
			this.callChain();
		}.bind(this));
		return this;
	},

	setLeftContent: function(){
		$(this.left).adopt(arguments);
		return this;
	},
	
	setRightContent: function(){
		$(this.right).adopt(arguments);
		return this;
	}

});
