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

ART.Sheet.defineStyle('window', {
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

	'caption-font-color': hsb(0, 0, 10),
	'header-background-color': [hsb(0, 0, 80), hsb(0, 0, 60)],
	'footer-background-color': [hsb(0, 0, 80), hsb(0, 0, 70)],
	'header-reflection-color': [hsb(0, 0, 100, 1), hsb(0, 0, 0, 0)],
	'footer-reflection-color': [hsb(0, 0, 100, 1), hsb(0, 0, 0, 0)],
	'border-color': hsb(0, 0, 0, 0.4),
	'content-border-top-color': hsb(0, 0, 30),
	'content-border-bottom-color': hsb(0, 0, 50),
	'content-background-color': hsb(0, 0, 100)

});

ART.Sheet.defineStyle('window:disabled', {
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

ART.Sheet.defineCSS('window footer-text', {
	'float': 'left',
	'margin': '3px 14px 0px 4px'
});

ART.Sheet.defineStyle('window button.wincontrol', {
	'padding': [1,1,1,1],
	'pill': true,
	'height': 14,
	'width': 14,
	cornerRadius: 7,
	'cursor': 'pointer',
	'background-color': [hsb(0, 0, 75), hsb(0, 0, 55)],
	'reflection-color': [hsb(0, 0, 95), hsb(0, 0, 0, 0)],
	'shadow-color': hsb(0, 0, 100, 0.4),
	'border-color': hsb(0, 0, 45),
	'glyph-color': hsb(0, 0, 0, 0.6)
});

ART.Sheet.defineStyle('window button.wincontrol:disabled', {
	'background-color': [hsb(0, 0, 100, 0.6), hsb(0, 0, 100, 0.6)],
	'reflection-color': [hsb(0, 0, 100), hsb(0, 0, 0, 0)],
	'shadow-color': hsb(0, 0, 100, 0.2),
	'border-color': hsb(0, 0, 45, 0.5),
	'glyph-color': hsb(0, 0, 0, 0.4)
});

ART.Sheet.defineStyle('window button.wincontrol:active', {
	'background-color': hsb(0, 0, 65),
	'reflection-color': [hsb(0, 0, 65), hsb(0, 0, 0, 0)],
	'border-color': hsb(0, 0, 45),
	'glyph-color': hsb(0, 0, 100)
});

ART.Sheet.defineStyle('window button.close', {
	'glyph': ART.Glyphs.smallCross,
	
	'glyph-height': 4,
	'glyph-width': 4,
	'glyph-top': 1,
	'glyph-left': 1
});

ART.Sheet.defineStyle('window button.help', {
	'glyph': ART.Glyphs.help,
	
	'glyph-height': 4,
	'glyph-width': 4,
	'glyph-top': 3,
	'glyph-left': 4
});

ART.Sheet.defineStyle('window button.minimize', {
	'glyph': ART.Glyphs.smallMinus,

	'glyph-height': 6,
	'glyph-width': 6,
	'glyph-top': 1,
	'glyph-left': 1
});

ART.Sheet.defineStyle('window button.maximize', {
	'glyph': ART.Glyphs.smallPlus,

	'glyph-height': 6,
	'glyph-width': 6,
	'glyph-top': 1,
	'glyph-left': 1
});

ART.Sheet.defineStyle('window:dragging', {
	'content-display': 'none',
	'background-color': hsb(0, 0, 0, 0.1)
});

ART.Window = new Class({
	
	Extends: ART.Popup,
	
	name: 'window',
	
	options: { 
		
		caption: null,
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
		buttonSide: Browser.Platform.win ? 'right' : 'left'
	},

	initialize: function(options){
		this.requireToRender('window:navButtons', 'window:paint');
		this.parent(options);
		if (this.options.resizable) this.makeResizeable();
	},

	build: function(){
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
		
		var style = ART.Sheet.lookupStyle(this.getSelector());
		// create various ART shapes to draw the window
		this.paint = new ART;
		this.borderLayer = new ART.Rectangle;
		this.resizeLayer = new ART.Shape(ART.Glyphs.resize);
		this.resizeLayer.fill(hsb(0, 0, 0, 0.4));
		
		this.textLayer = new ART.Font(style.captionFontFamily, style.captionFontVariant);
		this.makeHeaderText(this.options.caption, style.captionFontSize, true);
		this.backgroundLayer = new ART.Rectangle;
		this.footerReflectionLayer = new ART.Rectangle;
		this.footerBackgroundLayer = new ART.Rectangle;
		this.headerReflectionLayer = new ART.Rectangle;
		this.headerBackgroundLayer = new ART.Rectangle;
		this.contentBorderTopLayer = new ART.Rectangle;
		this.contentBorderBottomLayer = new ART.Rectangle;
		
		this.paint.push(
			this.borderLayer,
			this.backgroundLayer,
			this.headerReflectionLayer,
			this.footerReflectionLayer,
			this.headerBackgroundLayer,
			this.footerBackgroundLayer,
			this.contentBorderTopLayer,
			this.contentBorderBottomLayer,
			this.resizeLayer,
			this.textLayer
		);

		$(this.paint).setStyles(absolute).inject(this.element);
		this.readyToRender('window:paint');
		
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
		this.readyToRender('window:navButtons');
		this.contents.adopt(this.header, this.content, this.footer);
	},
	
	fill: function(layer, style){
		layer.fill.apply(layer, $splat(style));
	},

	//create ART.Button instances for close, maximize, minimize, and help
	makeButtons: function() {
		this.buttons = {};
		var style = ART.Sheet.lookupStyle(this.getSelector());
		var actions = {
			close: this.hide.bind(this),
			maximize: this.maximize.bind(this),
			minimize: this.minimize.bind(this)
		};
		if (this.options.help) actions.help = this.options.help.bind(this);
		var baseLeft = 6;
		['close', 'minimize', 'maximize', 'help'].each(function(button){
			if (this.options[button]) {
				this.buttons[button] = new ART.Button({
					className: button + ' wincontrol',
					parentWidget: this,
					tabIndex: -1
				});
				$(this.buttons[button]).setStyles({
					'position': 'absolute',
					'top': style.headerPaddingTop
				}).setStyle(this.options.buttonSide, baseLeft).inject(this.header);
				
				baseLeft = baseLeft + style.buttonSpacing;
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
		this.fireEvent(operation, [w, h]);
	},

	//create resize handle and make the window instance resizable.
	makeResizeable: function(){
		this.resizeHandle = new Element('div', {'class': 'art-window-resize-handle'});
		this.resizeHandle.setStyles({
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
			this.displayForDrag(true);
		}.bind(this));

		var dragging;
		this.touchResize.addEvent('move', function(dx, dy){
			this.fireEvent('resize:move', [dx, dy]);
			this.resize(this.startWidth + dx, this.startHeight + dy);
		}.bind(this));
		
		this.touchResize.addEvent('end', function(){
			this.displayForDrag(false);
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
		if (this.options.autosize) this.autosize();
		return this;
	},
	
	//resizes the window to match the contents of the window
	autosize: function(){
		if (!this.boundAutoSize) this.boundAutoSize = this.autosize.bind(this);
		if (this.hidden) {
			this.addEvent('display', this.boundAutoSize);
		} else {
			this.removeEvent('display', this.boundAutoSize);
			var style = ART.Sheet.lookupStyle(this.getSelector());
			this.content.setStyles({
				'float': 'left',
				'width': 'auto'
			});
			var h = this.content.getScrollSize().y + style.headerHeight + style.footerHeight + 2;
			var w = this.content.getScrollSize().x;
			if (h > style.maxHeight) h = style.maxHeight;
			if (w > style.maxWidth) w = style.maxWidth;
			this.setOptions({
				height: h,
				width: w
			});
			this.redraw({
				width: w, 
				height: h
			});
		}
	},
	
	//sets the caption for the window
	setCaption: function(text){
		this.makeHeaderText(text, ART.Sheet.lookupStyle(this.getSelector()).captionFontSize);
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
		var style = ART.Sheet.lookupStyle(this.getSelector());
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
	redraw: function(override){
		this.parent.apply(this, arguments);
		var style = ART.Sheet.lookupStyle(this.getSelector());
		// compute the height and width for the instance
		var h = style.height, w = style.width;
		
		delete style.height;
		delete style.width;

		$mixin(style, override);
		if (style.height == null) style.height = this.currentHeight || this.options.height || h;
		if (style.width == null) style.width = this.currentWidth || this.options.width || w;

		var ranges = this.getSizeRange(override);
		style.height = style.height.limit(ranges.minHeight, ranges.maxHeight);
		style.width = style.width.limit(ranges.minWidth, ranges.maxWidth);
		
		this.currentHeight = style.height;
		this.currentWidth = style.width;

		var padding = 0;
		//resize the SVG/VML object to the proper size
		this.paint.resize(style.width + padding, style.height + padding);
		//resize the content
		this.contents.setStyles({
			'height': style.height,
			'width': style.width,
			'display': style.contentDisplay || 'block'
		});
		//render the content, header, and resize
		this.renderContent(style);
		this.renderHeaderText(style);
		this.renderResize(style);
		$(this.paint).setStyles({top: -1, left: -1});
		if (this.shim) this.shim.position();
		this.fireEvent('resize', [this.contentSize.x, this.contentSize.y]);
	},
	
	//renders the content area
	//pulls values from the ART.Sheet for window
	renderContent: function(style){
		var contentHeight = style.height - style.footerHeight - style.headerHeight - 2;
		var contentWidth = style.width -2;
		this.contentSize = {
			x: contentWidth, 
			y: contentHeight
		};
		if (style.contentDisplay == "none") {
			this.content.setStyle('display', 'none');
		} else {
			this.content.setStyles({
				'top': 1,
				'left': 0,
				'height': contentHeight < 0 ? 0 : contentHeight,
				'width': contentWidth < 0 ? 0 : contentWidth,
				'background-color': style.contentBackgroundColor,
				'color': style.contentColor,
				'overflow': style.contentOverflow,
				'display': 'block'
			});
		}
		
		// border layer
		
		this.borderLayer.draw(style.width, style.height, style.cornerRadius + 1);
		this.fill(this.borderLayer, style.borderColor);

		this.header.setStyles({'width': style.width - 2, height: style.headerHeight - 2});
		this.footer.setStyles({'width': style.width - 2, 'height': style.footerHeight});
		
		// header layers
		if (style.contentDisplay == 'none') {
			this.backgroundLayer.translate(1, 1);
			this.backgroundLayer.draw(style.width - 2, style.height - 2, style.cornerRadius);
			this.fill(this.backgroundLayer, style.backgroundColor);
			this.headerReflectionLayer.hide();
			this.headerBackgroundLayer.hide();
			this.contentBorderTopLayer.hide();
			this.contentBorderBottomLayer.hide();
			this.footerReflectionLayer.hide();
			this.footerBackgroundLayer.hide();
			this.resizeLayer.hide();
		} else {
			if (this.options.resizable) this.resizeLayer.show();
			else this.resizeLayer.hide();
			this.headerReflectionLayer.show().translate(1, 1);
			this.headerReflectionLayer.draw(style.width - 2, style.headerHeight - 2, [style.cornerRadius, style.cornerRadius, 0, 0]);
			this.fill(this.headerReflectionLayer, style.headerReflectionColor);

			this.headerBackgroundLayer.show().translate(1, 2);
			this.headerBackgroundLayer.draw(style.width - 2, style.headerHeight - 3, [style.cornerRadius, style.cornerRadius, 0, 0]);
			this.fill(this.headerBackgroundLayer, style.headerBackgroundColor);
		
			// first content separator border
			this.contentBorderTopLayer.show().translate(1, style.headerHeight - 1);
			this.contentBorderTopLayer.draw(style.width - 2, 1);
			this.fill(this.contentBorderTopLayer, style.contentBorderTopColor);
		
			// second content separator border
			this.contentBorderBottomLayer.show().translate(1, style.height - style.footerHeight - 2);
			this.contentBorderBottomLayer.draw(style.width - 2, 1);
			this.fill(this.contentBorderBottomLayer, style.contentBorderBottomColor);
		
			//footer layers
			this.footerReflectionLayer.show().translate(1, style.height - style.footerHeight - 1);
			this.footerReflectionLayer.draw(style.width - 2, style.footerHeight, [0, 0, style.cornerRadius, style.cornerRadius]);
			this.fill(this.footerReflectionLayer, style.footerReflectionColor);
			
			this.footerBackgroundLayer.show().translate(1, style.height - style.footerHeight);
			this.footerBackgroundLayer.draw(style.width - 2, style.footerHeight - 1, [0, 0, style.cornerRadius, style.cornerRadius]);
			this.fill(this.footerBackgroundLayer, style.footerBackgroundColor);
			
			
			
			this.footerText.setStyles(ART.Sheet.lookupCSS(this.getSelector() + ' footer-text'));
		}
	},
	
	//renders the resize handle
	renderResize: function(style){
		if (!this.options.resizable) return;
		this.resizeLayer.translate(style.width - 15, style.height - 15);
	},
	
	//renders the header text layer
	renderHeaderText: function(style){
		if (style.contentDisplay == 'none'){
			this.textLayer.hide();
		} else {
			this.textLayer.show();
			var spare = (style.width - this.fontBounds.right) / 2;
			this.textLayer.translate(spare, style.headerPaddingTop + 3);
			this.fill(this.textLayer, style.captionFontColor);
		}
	},
	
	//creates the header text layer
	makeHeaderText: function(text, fontSize, nrd){
		if (text && fontSize) this.textLayer.draw(text, fontSize);
		this.fontBounds = this.textLayer.measure();
		if (!nrd) this.render();
	}

});

//adds getWindow and getWindowElement to the windowTools mixin for classes
ART.WindowTools = new Class({

	getWindow: function(){
		return this.getWindowElement().retrieve('art-window');
	},

	getWindowElement: function(){
		return $(this).hasClass('art-window') ? $(this) : $(this).getParent('.art-window');
	}

});

/* 
TODO
 * header can overlap buttons
 * drag options, resize options; touch doesn't have the same features...
*/