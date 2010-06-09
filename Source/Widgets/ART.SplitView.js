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
	'display': 'block',
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
(function(){
	
var splitter = {
	
	Extends: ART.Widget,
	
	Implements: [Options, Events, Chain],
	
	options: {
		resizable: true, 
		foldable: true,
		hideSplitterOnFullFold: false
	},
	
	name: 'splitview',
	
	initialize: function(options){
		this.parent(options);
		this._orientations = {
			'left': this.options.orientation == "horizontal" ? "left" : "top",
			'right': this.options.orientation == "horizontal" ? "right" : "bottom",
			'bottom': 'bottom',
			'top': 'top',
			'dimension': this.options.orientation == "horizontal" ? "width" : "height"
		};
		if (this.options.orientation == "vertical") this.addClass('vertical');
		this._build();
	},

	_build: function(){
		document.id(this.canvas).dispose();
		var sheet = this.setSheet();

		this.element.addClass('art-splitview').setStyles({
			'position': 'relative',
			'width': sheet.width,
			'height': sheet.height,
			'display': sheet.display
		});
		var styles = this.options.orientation == "horizontal" ? 
		             {'float': 'left', 'overflow-x': 'auto'} : 
		             {'overflow-y': 'auto'};
		var o = this._orientations;
		this[o.left] = new Element('div', {
			'class': 'art-splitview-' + o.left,
			styles: {
				'background-color': sheet[o.left + 'BackgroundColor']
			}
		}).inject(this.element).setStyles(styles);
		this.splitter = new Element('div', {
			'class': 'art-splitview-splitter',
			styles: {
				'background-color': sheet.splitterBackgroundColor
			}
		}).inject(this.element).setStyles(styles)
			.setStyle(o.dimension, 
				        sheet['splitter' + o.dimension.capitalize()]);
		this[o.right] = new Element('div', {
			'class': 'art-splitview-' + o.right,
			styles: {
				'background-color': sheet[o.right + 'BackgroundColor']
			}
		}).inject(this.element).setStyles(styles);
		
		this.fx = new Fx();
		this.touch = new Touch(this.splitter);
		var self = this;
		var fix = self.options.fixed;
		var Fix = fix.capitalize();
		
		if (this.options.resizable || this.options.foldable){
			this.touch.addEvent('start', function(){
				self.startFixSize = self[fix + o.dimension.capitalize()];
			});
		}

		if (this.options.resizable) {
			this.touch.addEvent('move', function(){
				this.moveSplitter.apply(this, arguments);
			}.bind(this));
		}
		if (this.options.foldable){
			this.touch.addEvent('cancel', function(){
				if (self[fix + 'Size'] == 0){
					self['fold' + Fix](self.previousSize);
				} else {
					self.previousSize = self.startFixSize;
					self['fold' + Fix](0);
				}
			});
		}
		
		this.deferDraw();
	},

	moveSplitter: function(dx, dy){
		var cs = this.currentSheet;
		var o = this._orientations;
		var targetSize = this.startFixSize + (this.options.orientation == "horizontal" ? dx : -dy);
		if (targetSize < 0) targetSize = 0;
		if (targetSize > cs[o.dimension] - cs['splitter' + o.dimension.capitalize()]) {
			targetSize = cs[o.dimension] - cs['splitter' + o.dimension.capitalize()];
		}
		var fix = {
			'top': 'left',
			'bottom': 'right'
		}[this.options.fixed] || this.options.fixed;
		this._resizeSide(fix, targetSize);
	},

	draw: function(newSheet){
		var cs = this.currentSheet;
		var o = this._orientations;
		var sheet = this.parent(newSheet);
		
		var sizeChanged = (sheet.width != undefined && sheet.height != undefined);

		if (sizeChanged) {
			this.currentHeight = cs.height;
			this.currentWidth = cs.width;
			this.element.setStyles({
				'width': cs.width,
				'height': cs.height
			});
		}
		
		if (sheet.display) this.element.setStyle('display', cs.display);
		
		var splitterStr = "splitter" + o.dimension.capitalize();
		if (sheet[splitterStr] != undefined) {
			this.splitter.setStyle(o.dimension, cs[splitterStr]);
			this.splitter.setStyle('background-color', cs.splitterBackgroundColor);
		}
		if (this.options.resizable) this.splitter.setStyle('cursor', cs.splitterCursor);
		
		if (sheet[o.left + 'BackgroundColor']) {
			this[o.left].setStyles({
				'background-color': cs[o.left + 'BackgroundColor']
			});
		}
		if (sheet[o.right + 'BackgroundColor']) {
			this[o.right].setStyles({
				'background-color': cs[o.right + 'BackgroundColor']
			});
		}

		if (sizeChanged) {
			var otherDimension = o.dimension == "width" ? "height" : "width";
			$$(this[o.left], this[o.right],
				 this.splitter).setStyle(otherDimension, cs[otherDimension]);
		
			var side = this.options.fixed;

			var dim = o[side] + o.dimension.capitalize();
			if (this[dim] == undefined) this[dim] = cs['fixed' + o.dimension.capitalize()];
			this._resizeSide(side, cs[o.dimension] - this[dim] - cs[splitterStr]);
		}
		
		return this;
	},
	
	resize: function(w, h){
		if (this.isDestroyed()) return;
		return this.draw({'height': h, 'width': w});
	},
	
	_resizeSide: function(side, width){
		var o = this._orientations;
		side = {
			'top': 'left',
			'bottom': 'right'
		}[side] || side;
		var otherSide = side == 'left' ? 'right' : 'left';
		var cs = this.currentSheet;
		var splitterStr = "splitter" + o.dimension.capitalize();
		width = width.limit(0, cs[o.dimension] - cs[splitterStr]);
		this[o[side]].setStyle(o.dimension, width);

		var sideWidth = o[side] + o.dimension.capitalize();
		var otherSideWidth = o[otherSide] + o.dimension.capitalize();
		
		this[sideWidth] = width;
		this[otherSideWidth] = cs[o.dimension] - cs[splitterStr] - width;
		this[o[otherSide]].setStyle(o.dimension, this[otherSideWidth]);
	},
	

	fold: function(side, to, hideSplitter) {
		side = {
			'top': 'left',
			'bottom': 'right'
		}[side] || side;
		var cs = this.currentSheet;
		hideSplitter = $pick(hideSplitter, this.options.hideSplitterOnFullFold);
		var self = this;
		var other = side == 'left' ? 'right' : 'left';
		this.fx.set = function(now){
			self.resizeSide(side, now);
		};
		var splitterStr = "splitter" + o.dimension.capitalize();
		
		var sideWidth = o[side] + o.dimension.capitalize();
		
		if (to > 0 && this[sideWidth] && this.splitterHidden) {
			self.splitter.setStyle('width', cs[splitterStr]);
			self[other].setStyle('width', self[other + 'Width'] - cs[splitterStr]);
			this.splitterHidden = false;
		}
		this.fx.start(this[sideWidth], to).chain(function(){
			if (hideSplitter) {
				[o.left, o.right].each(function(side) {
					var other = {
						'top':'bottom',
						'left':'right',
						'bottom':'top',
						'right':'left'
					}[side];
					var sideWidth = o[side] + o.dimension.capitalize();
					var otherWidth = o[other] + o.dimension.capitalize();
					if (self[sideWidth] == 0) {
						self.splitter.setStyle(o.dimension, 0);
						self[other].setStyle(o.dimension, self[otherWidth] + cs[splitterStr]);
						self[otherWidth] = self[otherWidth] + cs[splitterStr];
					}
				});
				this.splitterHidden = true;
			}
			this.callChain();
		}.bind(this));
		return this;
	},

	_setSideContent: function(side, content) {
		document.id(this[this._orientations[side] || side]).empty().adopt(content);
	}


};

ART.SplitView = new Class(
	$merge(splitter, {
		options: {
			orientation: 'horizontal',
			fixed: 'left'
		},
		setLeftContent: function(){
			this._setSideContent('left', arguments);
			return this;
		},

		setRightContent: function(){
			this._setSideContent('right', arguments);
			return this;
		},
		
		resizeLeft: function(width) {
			this._resizeSide('left', width);
		},

		resizeRight: function(width){
			this._resizeSide('right', width);
		}

	})
);

ART.Sheet.define('splitview.art.vertical', {
	'fixed-height': 200,
	'splitter-height': 3,
	//IE doesn't support east-west resize cursor; just use east
	'splitter-cursor': Browser.Engine.trident ? 's-resize' : 'ns-resize',
	'bottom-background-color': '#d6dde5',
	'top-background-color': '#fff'
});

ART.Sheet.define('splitview.art.vertical:disabled', {
	'bottom-background-color': '#e8e8e8'
});


ART.SplitView.Vertical = new Class(
	$merge(splitter, {
		options: {
			orientation: 'vertical',
			fixed: 'bottom'
		},
		setTopContent: function(){
			this._setSideContent('top', arguments);
			return this;
		},
		setBottomContent: function(){
			this._setSideContent('bottom', arguments);
			return this;
		},
		
		resizeTop: function(height) {
			this._resizeSide('top', height);
		},

		resizeBottom: function(height) {
			this._resizeSide('bottom', height);
		}
		
	})
);

})();