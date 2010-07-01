/*
---
name: ART.Window
description: Base Window Class
requires: [ART.Button, ART.Popup, Core/Fx.Morph, ART/Moderna, ART/Moderna.Bold, ART.Glyphs]
provides: ART.Window
...
*/


/*
	default window styles
*/

ART.Sheet.define('window.art', {
	'display': 'block',
	'height': 300,
	'width': 400,
	
	'max-height': 800,
	'max-width': 1000,
	
	'min-height': 110,
	'min-width': 300,
	
	'top': 100,
	'left': 100,
	
	'caption-font-family': 'Moderna',
	'caption-font-variant': 'normal',
	'caption-font-size': 13,
	
	'button-spacing': 20,
	'header-padding-top': 4,
	
	'content-overflow': 'auto',
	
	'corner-radius': 4,
	'header-height': 24,
	'footer-height': 17,
	
	'caption-font-color': hsb(0, 0, 30),
	'header-background-color': [hsb(0, 0, 95), hsb(0, 0, 80)],
	'footer-background-color': [hsb(0, 0, 95), hsb(0, 0, 90)],
	'header-reflection-color': [hsb(0, 0, 100, 1), hsb(0, 0, 0, 0)],
	'footer-reflection-color': [hsb(0, 0, 100, 1), hsb(0, 0, 0, 0)],
	'border-color': hsb(0, 0, 0, 0.2),
	'content-border-top-color': hsb(0, 0, 60),
	'content-border-bottom-color': hsb(0, 0, 70),
	'content-background-color': hsb(0, 0, 100),
	'content-color': hsb(0, 0, 0)

});

ART.Sheet.define('window.art:focused', {
	'caption-font-color': hsb(0, 0, 10),
	'header-background-color': [hsb(0, 0, 80), hsb(0, 0, 60)],
	'footer-background-color': [hsb(0, 0, 80), hsb(0, 0, 70)],
	'border-color': hsb(0, 0, 0, 0.4),
	'content-border-top-color': hsb(0, 0, 30),
	'content-border-bottom-color': hsb(0, 0, 50),
	'content-background-color': hsb(0, 0, 100)
});

ART.Sheet.define('window.art footer-text', {
	'float': 'left',
	'margin': '3px 14px 0px 4px'
}, 'css');

ART.Sheet.define('window.art button.art.wincontrol', {
	'padding': [1,1,1,1],
	'pill': true,
	'height': 14,
	'width': 14,
	'cornerRadius': 7,
	'cursor': 'pointer',
	'background-color': [hsb(0, 0, 100, 0.6), hsb(0, 0, 100, 0.6)],
	'reflection-color': [hsb(0, 0, 100), hsb(0, 0, 0, 0)],
	'shadow-color': hsb(0, 0, 100, 0.2),
	'border-color': hsb(0, 0, 45, 0.5),
	'glyph-color': hsb(0, 0, 0, 0.4),
	'display': 'inline-block'
});


ART.Sheet.define('window.art:dragging button.art.wincontrol', {
	'display': 'none'
});

ART.Sheet.define('window.art:focused button.art.wincontrol', {
	'background-color': [hsb(0, 0, 75), hsb(0, 0, 55)],
	'reflection-color': [hsb(0, 0, 95), hsb(0, 0, 0, 0)],
	'shadow-color': hsb(0, 0, 100, 0.4),
	'border-color': hsb(0, 0, 45),
	'glyph-color': hsb(0, 0, 0, 0.6),
	'display': 'inline-block'
});

ART.Sheet.define('window.art button.art.wincontrol:active', {
	'background-color': hsb(0, 0, 65),
	'reflection-color': [hsb(0, 0, 65), hsb(0, 0, 0, 0)],
	'border-color': hsb(0, 0, 45),
	'glyph-color': hsb(0, 0, 100)
});

ART.Sheet.define('window.art button.art.close', {
	'glyph': ART.Glyphs.smallCross,
	
	'glyph-height': 4,
	'glyph-width': 4,
	'glyph-top': 1,
	'glyph-left': 1
});

ART.Sheet.define('window.art button.help', {
	'glyph': ART.Glyphs.help,
	
	'glyph-height': 4,
	'glyph-width': 4,
	'glyph-top': 3,
	'glyph-left': 4
});

ART.Sheet.define('window.art button.art.minimize', {
	'glyph': ART.Glyphs.smallMinus,

	'glyph-height': 6,
	'glyph-width': 6,
	'glyph-top': 1,
	'glyph-left': 1
});

ART.Sheet.define('window.art button.art.maximize', {
	'glyph': ART.Glyphs.smallPlus,

	'glyph-height': 6,
	'glyph-width': 6,
	'glyph-top': 1,
	'glyph-left': 1
});

ART.Sheet.define('window.art:dragging', {
	'content-display': 'none',
	'background-color': hsb(0, 0, 0, Browser.Engine.trident ? 1 : 0.1)
});

ART.Window = new Class({
	
	Extends: ART.Popup,
	
	name: 'window',
	
	options: { 
		
		caption: '',
		autosize: false,
		
		min: {/* height: null, width: null */},
		max: {/* height: null, width: null */},
		close: true,
		help: false, // help is a function: eg: function(){ console.log('help!'); },
		minimize: true,
		maximize: true,
		resizable: true,
		draggable: true,
		shadow: Browser.Engine.webkit,
		cascaded: true,
		buttonSide: Browser.Platform.mac ? 'left' : 'right'
	},

	initialize: function(options){
		this.setState('hidden', true);
		this.parent(options);
		this.element.addClass('art-window');
		document.id(this).store('art-window', this);
		if (this.options.resizable) this.makeResizeable();
	},

	_build: function(){
		this.parent();
		var self = this;
		var relative = {
			position: 'relative', 
			top: 0, 
			left: 0
		};
		var absolute = {
			position: 'absolute', 
			top: 0, 
			left: 0
		};
		
		var sheet = this.setSheet();
		// create various ART shapes to draw the window
		this.borderLayer = new ART.Rectangle;

		this.textLayer = new ART.Font;
		if (this.options.caption) this.makeHeaderText(this.options.caption, sheet.captionFontSize, true);
		this.backgroundLayer = new ART.Rectangle;
		this.footerReflectionLayer = new ART.Rectangle;
		this.footerBackgroundLayer = new ART.Rectangle;
		this.headerReflectionLayer = new ART.Rectangle;
		this.headerBackgroundLayer = new ART.Rectangle;
		this.contentBorderTopLayer = new ART.Rectangle;
		this.contentBorderBottomLayer = new ART.Rectangle;
		
		this.canvas.grab(
			this.borderLayer,
			this.backgroundLayer,
			this.headerReflectionLayer,
			this.footerReflectionLayer,
			this.headerBackgroundLayer,
			this.footerBackgroundLayer,
			this.contentBorderTopLayer,
			this.contentBorderBottomLayer,
			this.textLayer
		);

		document.id(this.canvas).setStyles(absolute).inject(this.element);
		
		// create containers for the header, content, and footer
		this.contents = new Element('div').inject(this.element);
		
		this.header = new Element('div', {
			'class': 'art-window-header',
			styles: $merge(relative, {
				top: 1,
				left: 1,
				overflow: 'hidden',
				zIndex: 1
			})
		});
		this.content = new Element('div', {
			'class': 'art-window-content',
			styles: $merge(relative, {
				overflow: 'auto',
				position: 'relative'
			})
		});
		this.footer = new Element('div', {
			'class': 'art-window-footer',
			styles: $merge(relative, {
				top: 1,
				left: 1,
				overflow: 'hidden',
				clear: 'both'
			})
		});
		this.footerText = new Element('div', {
			'class': 'footer-text'
		}).inject(this.footer);
		this.makeButtons();
		this.contents.adopt(this.header, this.content, this.footer);
	},
	
	fill: function(layer, style){
		layer.fill.apply(layer, $splat(style));
	},

	//create ART.Button instances for close, maximize, minimize, and help
	makeButtons: function() {
		var cs = this.currentSheet;
		this.buttons = {};
		var style = this.setSheet();
		var actions = {
			close: this.hide.bind(this),
			maximize: this.maximize.bind(this),
			minimize: this.minimize.bind(this)
		};
		if (this.options.help) actions.help = this.options.help.bind(this);
		var baseLeft = 6;
		['close', 'minimize', 'maximize', 'help'].each(function(button){
			if (this.options[button]) {
				var windowButton = this.buttons[button] = new ART.Button({
					className: button + ' wincontrol art',
					tabIndex: -1
				}).inject(this, this.header);
				
				$(windowButton).addEvent('mousedown', function(event){
					event.stopPropagation();
				});
				
				document.id(this.buttons[button]).setStyles({
					'position': 'absolute',
					'top': cs.headerPaddingTop
				}).setStyle(this.options.buttonSide, baseLeft);
				
				baseLeft = baseLeft + cs.buttonSpacing;
				this.buttons[button].addEvent('press', actions[button]);
			}
		}, this);
	},

	maximize: function(){
		this.minMax('maximize');
	},

	minimize: function(){
		this.minMax('minimize');
	},

	//minimize/maximize a window; call minimize/maximize methods instead
	minMax: function(operation){
		if ($type(this.options[operation]) == "function") {
			this.options[operation].call(this);
		} else {
			this.enable();
			var style = this.getSizeRange();
			var prefix = operation == 'maximize' ? 'max' : 'min';
			var w = style[prefix + 'Width'], h = style[prefix + 'Height'];
			var beforeStr = 'before'+ operation.capitalize();
			if (this[beforeStr]) {
				w = this[beforeStr].width;
				h = this[beforeStr].height;
				this[beforeStr] = null;
			} else {
				this[beforeStr] = this.getSize();
			}
			this.resize(w, h);
		}
		this.fireEvent(operation, [w, h]).fireEvent('unshade');
	},

	//create resize handle and make the window instance resizable.
	makeResizeable: function(){
		this.resizeHandle = new Element('div', {'class': 'art-window-resize-handle'});
		this.resizeHandle.setStyles({
			cursor: 'se-resize',
			position: 'absolute',
			height: 17,
			width: 17,
			right: 0,
			bottom: 0
		});
		this.resizeHandle.inject(this.footer);
		
		this.touchResize = new Touch(this.resizeHandle);
		
		this.touchResize.addEvent('start', function(){
			this.startHeight = this.contents.offsetHeight;
			this.startWidth = this.contents.offsetWidth;
			this.fireEvent('resize:start');
		}.bind(this));

		var dragging;
		this.touchResize.addEvent('move', function(dx, dy){
			this._displayForDrag(true);
			this.fireEvent('resize:move', [dx, dy]);
			this.resize(this.startWidth + dx, this.startHeight + dy);
		}.bind(this));
		
		this.touchResize.addEvent('end', function(){
			this._displayForDrag(false);
			this.fireEvent('resize:end');
		}.bind(this));
	},

	makeDraggable: function(){
		this.parent(this.header);
	},

	//sets the content area of the window to the given element, elements, or html string
	setContent: function(content){
		if (document.id(content) || $type(content) == "array") this.content.adopt(content);
		else if ($type(content) == "string") this.content.set('html', content);
		if (this.options.autosize && !this.getState('hidden')) this.autosize();
		return this;
	},
	
	show: function(){
		var ret = this.parent.apply(this, arguments);
		if (this.options.autosize) this.autosize();
		return ret;
	},
	
	//resizes the window to match the contents of the window
	autosize: function(){
		if (this.isDestroyed()) return;
		var cs = this.currentSheet;
		if (!this.boundAutoSize) {
			this.boundAutoSize = function(){
				this.autosize();
			}.bind(this);
		}
		if (this.getState('hidden')) {
			this.addEvent('display', this.boundAutoSize);
		} else {
			this.removeEvent('display', this.boundAutoSize);
			var style = ART.Sheet.lookup(this.toString());
			this.content.setStyles({
				'float': 'left',
				'width': 'auto'
			});
			this.content.measure(function(){
				var h = this.content.getScrollSize().y + cs.headerHeight + cs.footerHeight + 2;
				var w = this.content.getScrollSize().x + 20;
				if (h > cs.maxHeight) h = cs.maxHeight;
				if (w > cs.maxWidth) w = cs.maxWidth;
				this.setOptions({
					height: h,
					width: w
				});
				this.content.setStyles({
					'float': 'none',
					'width': 'auto',
					'margin-right': 2
				});
				this.draw({
					width: w, 
					height: h
				});
			}.bind(this));
		}
		this.position();
	},
	
	//sets the caption for the window
	setCaption: function(text){
		this.makeHeaderText(text);
		return this;
	},

	//sets the footer text for the window
	setFooter: function(text) {
		this.footerText.set('html', text);
	},

	makeIframeShim: function(){
		return this.parent(this.contents);
	},

	// returns the current size of the instance
	getSize: function(){
		return {
			width: this.currentWidth,
			height: this.currentHeight
		};
	},

	//gets the min/max potential sizes for the instance
	getSizeRange: function(override){
		var style = this.getSheet();
		var ret = {};
		['min', 'max'].each(function(extreme){
			['width', 'height'].each(function(axis){
				var str = extreme + axis.capitalize();
				var opt = this.options[extreme][axis];
				if ((override && !$defined(override[extreme + axis.capitalize()]) && $defined(opt)) || (!override && $defined(opt))) 
					ret[str] = opt;
				else
					ret[str] = style[str];
			}, this);
		}, this);
		return ret;
	},

	//redraws the instance
	draw: function(newSheet){
		if (this.getState('destroyed')) return;
		var cs = this.currentSheet;
		var style = this.parent(newSheet);
		if (cs.display == "none") {
			document.id(this).setStyle('display', 'none');
			return;
		} else if (style.display) {
			document.id(this).setStyle(cs.display);
		}
		if (style.height == undefined || style.width == undefined) {
			style.height = this.currentHeight || cs.height;
			style.width = this.currentWidth || cs.width;
		}
		var sizeChanged = style.width != this.currentWidth || style.height != this.currentHeight;
		if (sizeChanged) {
			// compute the height and width for the instance
			var ranges = this.getSizeRange();
			if (style.height != null && style.width != null) {
				cs.height = style.height.limit(ranges.minHeight, ranges.maxHeight);
				cs.width = style.width.limit(ranges.minWidth, ranges.maxWidth);

				this.currentHeight = cs.height;
				this.currentWidth = cs.width;
				var padding = 0;
				//resize the SVG/VML object to the proper size
				this.canvas.resize(cs.width + padding, cs.height + padding);
				//resize the content
				this.contents.setStyles({
					'height': cs.height,
					'width': cs.width
				});
				this.setOptions({
					styles: {
						width: cs.width,
						height: cs.height
					}
				});
			}
		}

		//render the content, header, and resize
		this.renderContent(style);
		this.renderHeaderText(style);
		this.renderResize();
		document.id(this.canvas).setStyles({top: -1, left: -1});
		if (this.shim) this.shim.position();
		if (sizeChanged) this.fireEvent('resize', [this.contentSize.x, this.contentSize.y]);
	},
	
	contentSize: {},
	
	//renders the content area
	//pulls values from the ART.Sheet for window
	renderContent: function(diffSheet){
		var cs = this.currentSheet;
		var sizeChanged = diffSheet.width != undefined || diffSheet.height != undefined;
		if (sizeChanged) {
			var y = cs.height - cs.footerHeight - cs.headerHeight - 2;
			this.contentSize.y = y >=0 ? y : 0;
			this.contentSize.x = cs.width > 1 ? cs.width - 2 : 0;
		}
		if (cs.contentDisplay == "none") {
			this.contents.setStyle('display', 'none');
		} else {
			this.contents.setStyle('display', 'block');
			this.content.setStyles({
				'top': 1,
				'left': 0,
				'height': this.contentSize.y,
				'width': this.contentSize.x,
				'background-color': cs.contentBackgroundColor,
				'color': cs.contentColor,
				'overflow': cs.contentOverflow,
				'display': 'block'
			});
		}
		
		// border layer
		
		this.borderLayer.draw(cs.width, cs.height, cs.cornerRadius + 1);
		this.fill(this.borderLayer, cs.borderColor);

		if (sizeChanged) {
			this.header.setStyles({'width': cs.width - 2, height: cs.headerHeight - 2});
			this.footer.setStyles({'width': cs.width - 2, 'height': cs.footerHeight});
		}
		
		// header layers
		if (cs.contentDisplay == 'none') {
			this.backgroundLayer.translate(1, 1);
			this.backgroundLayer.draw(cs.width - 2, cs.height - 2, cs.cornerRadius);
			this.fill(this.backgroundLayer, cs.backgroundColor);
			this.headerReflectionLayer.hide();
			this.headerBackgroundLayer.hide();
			this.contentBorderTopLayer.hide();
			this.contentBorderBottomLayer.hide();
			this.footerReflectionLayer.hide();
			this.footerBackgroundLayer.hide();
			if (this.resizeLayer) this.resizeLayer.hide();
		} else {
			if (this.resizeLayer) this.resizeLayer.show();
			this.headerReflectionLayer.show().translate(1, 1);
			this.headerReflectionLayer.draw(cs.width - 2, cs.headerHeight - 2, [cs.cornerRadius, cs.cornerRadius, 0, 0]);
			this.fill(this.headerReflectionLayer, cs.headerReflectionColor);

			this.headerBackgroundLayer.show().translate(1, 2);
			this.headerBackgroundLayer.draw(cs.width - 2, cs.headerHeight - 3, [cs.cornerRadius, cs.cornerRadius, 0, 0]);
			this.fill(this.headerBackgroundLayer, cs.headerBackgroundColor);
		
			// first content separator border
			this.contentBorderTopLayer.show().translate(1, cs.headerHeight - 1);
			this.contentBorderTopLayer.draw(cs.width - 2, 1);
			this.fill(this.contentBorderTopLayer, cs.contentBorderTopColor);
		
			// second content separator border
			this.contentBorderBottomLayer.show().translate(1, cs.height - cs.footerHeight - 2);
			this.contentBorderBottomLayer.draw(cs.width - 2, 1);
			this.fill(this.contentBorderBottomLayer, cs.contentBorderBottomColor);
		
			//footer layers
			this.footerReflectionLayer.show().translate(1, cs.height - cs.footerHeight - 1);
			this.footerReflectionLayer.draw(cs.width - 2, cs.footerHeight, [0, 0, cs.cornerRadius, cs.cornerRadius]);
			this.fill(this.footerReflectionLayer, cs.footerReflectionColor);
			
			this.footerBackgroundLayer.show().translate(1, cs.height - cs.footerHeight);
			this.footerBackgroundLayer.draw(cs.width - 2, cs.footerHeight - 1, [0, 0, cs.cornerRadius, cs.cornerRadius]);
			this.fill(this.footerBackgroundLayer, cs.footerBackgroundColor);
			
			this.footerText.setStyles(ART.Sheet.lookup(this.toString() + ' footer-text'), 'css');
		}
	},
	
	//renders the resize handle
	renderResize: function(style){
		if (!this.options.resizable) return;
		if (!this.resizeLayer) {
			this.resizeLayer = new ART.Shape(ART.Glyphs.resize);
			this.resizeLayer.fill(hsb(0, 0, 0, 0.4));
			this.canvas.grab(this.resizeLayer);
		}
		this.resizeLayer.translate(this.currentSheet.width - 15, this.currentSheet.height - 15);
	},
	
	//renders the header text layer
	renderHeaderText: function(style){
		if (!this.textLayer || !this.textBox) return;
		var cs = this.currentSheet;
		if (cs.contentDisplay == 'none'){
			this.textLayer.hide();
		} else {
			this.textLayer.show();
			var spare = (cs.width - this.textBox.width) / 2;
			this.textLayer.translate(spare, cs.headerPaddingTop + 3);
			this.fill(this.textLayer, cs.captionFontColor);
		}
	},
	
	//creates the header text layer
	makeHeaderText: function(text, nrd){
		var cs = this.currentSheet;
		if (!text) {
			this.textLayer.hide();
			this.textBox = {
				width: 0,
				height: 0
			};
		} else {
			this.textLayer.show();
			this.textLayer.draw(cs.captionFontFamily, cs.captionFontVariant, text, cs.captionFontSize);
			this.textBox = this.textLayer.measure();
		}
		if (!nrd) this.deferDraw();
	}

});

//adds getWindow and getWindowElement to the windowTools mixin for classes
ART.WindowTools = new Class({

	getWindow: function(){
		var win = this.getWindowElement();
		if (!win) return null;
		return win.get('widget');
	},

	getWindowElement: function(){
		return document.id(this).hasClass('art-window') ? document.id(this) : document.id(this).getParent('.art-window');
	}

});

/* 
TODO
 * header can overlap buttons
 * drag options, resize options; touch doesn't have the same features...
*/