/*
---
name: ART.SplitView
description: A simple horizonal double-pane split view.
requires: [ART.Widget, ART.Sheet, Core/Element.Event, Core/Element.Style, Touch/Touch, Core/Fx.Tween]
provides: ART.SplitView
...
*/

ART.Sheet.define('splitview.art', {
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

ART.Sheet.define('splitview.art:disabled', {
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
		this.parent(options);
		this._build();
	},

	_build: function(){
		document.id(this.canvas).dispose();
		var sheet = this.setSheet();

		this.element.addClass('art-splitview').setStyles({
			'position': 'relative',
			'width': sheet.width,
			'height': sheet.height
		});
		var styles = {'float': 'left', 'overflow-x': 'auto'};
		
		this.left = new Element('div', {
			'class': 'art-splitview-left',
			styles: {
				'background-color': sheet.leftBackgroundColor
			}
		}).inject(this.element).setStyles(styles);
		this.splitter = new Element('div', {
			'class': 'art-splitview-splitter',
			styles: {
				'width': sheet.splitterWidth,
				'background-color': sheet.splitterBackgroundColor
			}
		}).inject(this.element).setStyles(styles);
		this.right = new Element('div', {
			'class': 'art-splitview-right',
			styles: {
				'background-color': sheet.rightBackgroundColor
			}
		}).inject(this.element).setStyles(styles);
		
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

		if (this.options.resizable) {
			this.touch.addEvent('move', function(){
				this.moveSplitter.apply(this, arguments);
			}.bind(this));
		}
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
		
		this.deferDraw();
	},

	moveSplitter: function(dx){
		var cs = this.currentSheet;
		var targetWidth = this.startFixWidth + dx;
		if (targetWidth < 0) targetWidth = 0;
		else if (targetWidth > cs.width - cs.splitterWidth) targetWidth = cs.width - cs.splitterWidth;
		var fix = this.options.fixed.capitalize();
		this['resize' + fix](targetWidth);
	},

	draw: function(newSheet){
		var cs = this.currentSheet;
		var sheet = this.parent(newSheet);
		
		var sizeChanged = (sheet.width != undefined && sheet.height != undefined);

		if (sizeChanged) {
			this.currentHeight = cs.height;
			this.currentWidth = cs.width;
		
			// render
		
			this.element.setStyles({
				'width': cs.width,
				'height': cs.height
			});
		}
		
		if (true || sheet.splitterWidth != undefined) {
			cs.splitterWidth = cs.splitterWidth;
			this.splitter.setStyles({
				'width': cs.splitterWidth,
				'background-color': cs.splitterBackgroundColor
			});
		}
		if (this.options.resizable) this.splitter.setStyle('cursor', cs.splitterCursor);
		if (true || sheet.leftBackgroundColor)
			this.left.setStyles({'background-color': cs.leftBackgroundColor});
		if (true || sheet.rightBackgroundColor)
			this.right.setStyles({'background-color': cs.rightBackgroundColor});
		
		if (sizeChanged) {
			$$(this.left, this.right, this.splitter).setStyle('height', cs.height);
		
			var side = this.options.fixed;
		
			if (side == 'left'){
				if (this.leftWidth == undefined) this.leftWidth = cs.fixedWidth;
				this.resizeRight(cs.width - this.leftWidth - cs.splitterWidth);
			} else if (side == 'right'){
				if (this.leftRight == undefined) this.leftRight = cs.fixedWidth;
				this.resizeLeft(cs.width - this.rightWidth - cs.splitterWidth);
			}
		}
		
		return this;
	},
	
	resize: function(w, h){
		return this.draw({'height': h, 'width': w});
	},
	
	resizeLeft: function(width){
		var cs = this.currentSheet;
		width = width.limit(0, cs.width - cs.splitterWidth);
		this.left.setStyle('width', width);
		this.leftWidth = width;
		this.rightWidth = cs.width - cs.splitterWidth - width;
		this.right.setStyle('width', this.rightWidth);
	},
	
	resizeRight: function(width){
		var cs = this.currentSheet;
		width = width.limit(0, cs.width - cs.splitterWidth);
		this.right.setStyle('width', width);
		this.rightWidth = width;
		this.leftWidth = cs.width - cs.splitterWidth - width;
		this.left.setStyle('width', this.leftWidth);
	},
	
	fold: function(side, to, hideSplitter) {
		var cs = this.currentSheet;
		hideSplitter = $pick(hideSplitter, this.options.hideSplitterOnFullFold);
		var self = this;
		var other = side == 'left' ? 'right' : 'left';
		this.fx.set = function(now){
			self['resize' + side.capitalize()](now);
		};
		if (to > 0 && this[side + 'Width'] && this.splitterHidden) {
			self.splitter.setStyle('width', cs.splitterWidth);
			self[other].setStyle('width', self[other + 'Width'] - cs.splitterWidth);
			this.splitterHidden = false;
		}
		this.fx.start(this[side + 'Width'], to).chain(function(){
			if (hideSplitter) {
				['left', 'right'].each(function(side) {
					var other = side == 'left' ? 'right' : 'left';
					if (self[side + 'Width'] == 0) {
						self.splitter.setStyle('width', 0);
						self[other].setStyle('width', self[other + 'Width'] + cs.splitterWidth);
						self[other + 'Width'] = self[other + 'Width'] + cs.splitterWidth;
					}
				});
				this.splitterHidden = true;
			}
			this.callChain();
		}.bind(this));
		return this;
	},

	setLeftContent: function(){
		document.id(this.left).empty().adopt(arguments);
		return this;
	},
	
	setRightContent: function(){
		document.id(this.right).empty().adopt(arguments);
		return this;
	}

});
