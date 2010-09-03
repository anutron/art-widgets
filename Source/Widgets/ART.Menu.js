/*
---
name: ART.Menu
description: Menu PseudoClass
requires: [ART.Sheet, ART.Widget, ART/ART.Rectangle, ART.Keyboard, More/Element.Measure]
provides: ART.Menu
...
*/

ART.Sheet.define('menu.art', {
	'width': 150,
	'min-width': 150,
	'border-color': 'hsb(0, 0, 0, 0.3)',
	'background-color': 'hsb(0, 0, 100, 0.98)',
	'selection-color': 'red',
	
	'border-radius': [5, 5, 5, 5],
	
	'font-family': 'Arial',
	'font-variant': 'normal',
	'font-size': 12,
	'font-color': 'hsb(0, 0, 5)',
	
	'padding': [5, 0, 5, 0],
	'item-padding': [2, 10, 2, 10]
});

(function(){
	
var Menu = ART.Menu = new Class({
	
	Extends: ART.Widget,
	
	name: 'menu',
	
	options: {
		// keyboardOptions: {},
		offset: {
			x: 0,
			y: 0
		},
		autosize: true
	},
	
	initialize: function(options, menu, handlers){
		this.parent(options);
		
		this.borderLayer = new ART.Rectangle;
		this.backgroundLayer = new ART.Rectangle;
		this.canvas.grab(this.borderLayer, this.backgroundLayer);
		if (document.id(menu).get('tag') == 'select') {
			this._selectMenu = menu.setStyle('display','none');
			menu = this.convertSelectToList(menu);
		}
		this.menu = menu.setStyles({
			position: 'absolute',
			top: 0,
			left: 0
		});
		if (this.options.autosize) this.menu.setStyle('white-space', 'nowrap');
		
		this.element.grab(this.menu);
		
		this.element.setStyles({'position': 'absolute', top: 0, left: 0});
		
		this._handlers = $$(handlers);
		this.attach();
		this.hide();
	},

	convertSelectToList: function(select){
		menu = new Element('ul', {'class':select.get('class')});
		select.getElements('option').each(function(option){
			new Element('li', {
				'class': option.get('class')
			}).adopt(
				new Element('a', {
					text: option.get('text') || option.get('value'),
					events: {
						mouseup: function(){
							option.selected = true;
						}
					}
				})
			).inject(menu);
		});
		return menu;
	},

	_selectedIndex: -1,

	attach: function(_detach) {
		var self = this;
		if (!this._elementEvents) {
			this._handlerEvents = {
				'mousedown': function(e){
					e.stopPropagation().preventDefault();
					self.show(e.page.x, e.page.y);
				}
			};
			this._elementEvents = {
				blur: this.hide.bind(this)
			};
			this._listEvents = {

				mouseup: function(e){
					self.fireEvent('press', this);
					self.hide();
					e.stopPropagation().preventDefault();
				},

				mousedown: function(e){
					e.stopPropagation().preventDefault();
				},

				mouseenter: function(){
					self._selectLink(this);
				},

				mouseleave: function(){
					self.removeClass('selected');
				}

			};
			
			var keySend = function(e){
				Keyboard.stop(e.preventDefault());
				var link = self.links[self._selectedIndex];
				if (link) link.fireEvent('mouseup', e);
			};
			
			this._keyboardKeys = {
				'keyup:esc': function(e){
					Keyboard.stop(e.preventDefault());
					self.hide();
				},

				'keydown:down': function(e){
					Keyboard.stop(e.preventDefault());
					self._selectLink(self.links[self._selectedIndex + 1]);
				},

				'keydown:up': function(e){
					Keyboard.stop(e.preventDefault());
					self._selectLink(self.links[self._selectedIndex - 1]);
				},

				'keyup:space': keySend,

				'keyup:enter': keySend

			};
			new ART.Keyboard(this, this.options.keyboardOptions);
			
		}
		
		var method = _detach ? 'removeEvents' : 'addEvents';
		this._handlers[method](this._handlerEvents);
		this.element[method](this._elementEvents);
		
		this.links = this.menu.getElements('a')[method](this._listEvents);

		this[ _detach ? 'detachKeys' : 'attachKeys'](this._keyboardKeys);
		
		return this;
	},
	
	detach: function(){
		return this.attach(true);
	},

	_selectLink: function(link){
		if (!link) return;
		this.links.removeClass('selected');
		link.addClass('selected');
		this._selectedIndex = this.links.indexOf(link);
	},

	blur: function(){
		if (this.parent()){
			this.hide();
			return true;
		}
		return false;
	},

	inject: function(wi, el, wh){
		this.parent(wi, el, wh);
		clearTimeout(this.drawTimer);
		return this;
	},
	
	draw: function(newSheet){
		var sheet = this.parent(newSheet),
		    cs = this.currentSheet;
		var boxChanged = !!(sheet.width || sheet.padding || sheet.borderRadius);
		if (boxChanged || this.options.autosize){
			if (this.options.autosize) cs.width = this.menu.measure(function(){ return this.menu.offsetWidth; }.bind(this));
			if (cs.width < cs.minWidth) cs.width = cs.minWidth;
			this.menu.setStyle('width', cs.width - 2);
			
			var height = this.menu.offsetHeight;
			this.resize(cs.width, height);
			
			var brt = cs.borderRadius[0], brr = cs.borderRadius[1];
			var brb = cs.borderRadius[2], brl = cs.borderRadius[3];

			this.borderLayer.draw(cs.width, height, cs.borderRadius);
			this.backgroundLayer.draw(cs.width - 2, height - 2, [brt - 1, brr - 1, brb - 1, brl - 1]).translate(1, 1);
		}
		
		if (sheet.borderColor) this.borderLayer.fill.apply(this.borderLayer, $splat(cs.borderColor));
		if (sheet.backgroundColor) this.backgroundLayer.fill.apply(this.backgroundLayer, $splat(cs.backgroundColor));
		return sheet;
	},

	position: function(x, y){
		var top, left;
		if (this.options.top != null && this.options.left != null) {
			top = $lambda(this.options.top)();
			left = $lambda(this.options.left)();
		} else {
			relativeTo = this.element.getOffsetParent();
			var relpos = relativeTo.getPosition();
			//position the menu next to the cursor so that the menu is to the right and below it
			left = x - relpos.x;
			top =  y - relpos.y;
			//now do a bunch of math to figure out if the menu is out of view
			var wSize = window.getSize();
			var mSize = this.element.getSize();
			var bottomRight = {
				x: x + mSize.x,
				y: y + mSize.y
			};
			if (bottomRight.x > wSize.x) left = left - mSize.x - 5;
			if (bottomRight.y > wSize.y) top = top - mSize.y - 5;
		}
		this.element.setStyles({left: left + this.options.offset.x, top: top + this.options.offset.y});
	},

	show: function(x, y){
		this.element.setStyle('display', 'block');
		this.position(x, y);
		this.enable();
		this.element.focus();
		return this;
	},
	
	hide: function(){
		this.element.setStyle('display', 'none');
		this.links.removeClass('selected');
		this.disable();
		return this;
	}
	
});
	
})();
