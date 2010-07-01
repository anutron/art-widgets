/*
---
name: ART.SplitView
description: A simple horizonal double-pane split view.
requires: [ART.Widget, ART.Sheet, Core/Element.Event, Core/Element.Style, Touch/Touch, Core/Fx.Tween, More/Fx.Elements]
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
				'background-color': sheet.splitterBackgroundColor,
				'height': sheet['splitter' + o.dimension.capitalize()]
			}
		}).inject(this.element).setStyles(styles).setStyle('overflow','hidden')
			.setStyle(o.dimension, sheet['splitter' + o.dimension.capitalize()]);
		if (this.options.splitterContent) this.setSplitterContent(this.options.splitterContent);
		this[o.right] = new Element('div', {
			'class': 'art-splitview-' + o.right,
			styles: {
				'background-color': sheet[o.right + 'BackgroundColor']
			}
		}).inject(this.element).setStyles(styles);
		
		this.fx = new Fx.Elements([this[o.left], this.splitter, this[o.right]]);
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

	setSplitterContent: function(content){
		if (document.id(content) || $type(content) == "array") this.splitter.adopt(content);
		else if ($type(content) == "string") this.splitter.set('html', content);
		return this;
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
			var otherDimension = o.dimension == 'width' ? 'height' : 'width';
			$$(this[o.left], this[o.right],
				 this.splitter).setStyle(otherDimension, cs[otherDimension]);
		
			var side = this.options.fixed;
			var other = this._getOtherSide(side);
			var cap = o.dimension.capitalize();
			var dim = o[side] + cap;
			this._resizeSide(side, this[dim] != null ? this[dim] : cs['fixed' + cap]);
		}
		
		return this;
	},
	
	resize: function(w, h){
		if (this.isDestroyed()) return;
		return this.draw({'height': h, 'width': w});
	},
	
	_resizeSide: function(side, width){
		var o = this._orientations;
		var otherSide = this._getOtherSide(side);
		var sizes = this._getWidthsForSizing(side, width);

		this[o[side]].setStyle(o.dimension, sizes.sideWidth);
		this[sizes.side + o.dimension.capitalize()] = sizes.sideWidth;
		
		this[o[otherSide]].setStyle(o.dimension, sizes.otherSideWidth);
		this[sizes.otherSide + o.dimension.capitalize()] = sizes.otherSideWidth;
		this.fireEvent('resizeSide', [side, sizes.sideWidth]);
	},
	
	_getWidthsForSizing: function(side, width) {
		var o = this._orientations;
		var otherSide = this._getOtherSide(side);
		var sideWidth = o[side] + o.dimension.capitalize();
		var otherSideWidth = o[otherSide] + o.dimension.capitalize();
		var cs = this.currentSheet;
		var splitterSize = this.splitterHidden ? 0 : cs["splitter" + o.dimension.capitalize()];
		width = width.limit(0, cs[o.dimension] - splitterSize);
		return {
			side: side,
			otherSide: otherSide,
			splitterWidth: splitterSize,
			sideWidth: width,
			otherSideWidth: cs[o.dimension] - splitterSize - width
		};
	},
	
	_getOtherSide: function(side) {
		return {
			'top':'bottom',
			'left':'right',
			'bottom':'top',
			'right':'left'
		}[side];
	},

	fold: function(side, to, hideSplitter, immediate) {
		var self = this;
		var cs = this.currentSheet;
		var o = this._orientations;
		var dimCap = o.dimension.capitalize();
		var other = this._getOtherSide(side);
		var splitterStr = "splitter" + dimCap;

		var sideWidth = o[side] + dimCap;
		var otherSideWidth = o[other] + dimCap;
		this._previous[side] = this[sideWidth];
		this.splitterHidden = to > 0 ? false : $pick(hideSplitter, this.options.hideSplitterOnFullFold);
		
		var fxTo = {
			'0': {},
			'1': {},
			'2': {}
		};
		var size = this._getWidthsForSizing(side, to);
		fxTo[side == o.left ? '0' : '2'][o.dimension] = size.sideWidth;
		fxTo['1'][o.dimension] = size.splitterWidth;
		fxTo[side == o.left ? '2' : '0'][o.dimension] = size.otherSideWidth;
		var finish = function(){
			this.fireEvent('fold', [side, to, this.splitterhidden]);
			this[sideWidth] = size.sideWidth;
			this[otherSideWidth] = size.otherSideWidth;
			this.callChain();
		}.bind(this);
		if (immediate) {
			this.fx.set(fxTo);
			finish();
		} else {
			this.fx.start(fxTo).chain(finish);
		}
		
		return this;
	},

	toggle: function(side, hideSplitter) {
		var getWidthStr = function(side) {
			return {
				'left': 'leftWidth',
				'right': 'rightWidth',
				'top':'topHeight',
				'bottom':'bottomHeight'
			}[side];
		};
		var toggle = getWidthStr(side);
		var other = this._getOtherSide(side);;
		var current = this[toggle];
		var previous = this._previous[side];
		if (window.paused) debugger;
		if (previous == null) previous = this[other];
		var to = current == 0 ? previous : 0;
		this.fold(side, to, hideSplitter);
		return this;
	},
	
	_previous: {},

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
	'fixed-height': 100,
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