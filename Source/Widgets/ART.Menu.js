/*
---
name: ART.Menu
description: Menu PseudoClass
requires: [ART.Sheet, ART.Widget, ART/ART.Rectangle, ART.Keyboard]
provides: ART.Menu
...
*/

ART.Sheet.define('menu.art', {
	'width': 150,
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
		left: null,
		top: null
	},
	
	initialize: function(options, menu, handlers){
		this.parent(options);
		
		this.borderLayer = new ART.Rectangle;
		this.backgroundLayer = new ART.Rectangle;
		this.canvas.grab(this.borderLayer, this.backgroundLayer);
		
		this.menu = menu.setStyles({
			position: 'absolute',
			top: 0,
			left: 0
		});
		
		this.element.grab(this.menu);
		
		this.element.setStyles({'position': 'absolute', top: 0, left: 0});
		
		var self = this;
		
		this.element.addEvent('blur', function(){
			self.hide();
		});
		
		this.handlers = $$(handlers);
		
		var selectedIndex = -1, link;
		
		if (this.handlers.length) this.handlers.addEvents({
				
			'mousedown': function(e){
				e.stopPropagation().preventDefault();
				var left = $lambda(self.options.left)(), top = $lambda(self.options.top)();
				self.show((left != null) ? left : e.client.x, (top != null) ? top : e.client.y);
				selectedIndex = -1;
			}

		});

		var selectLink = function(link){
			if (!link) return;
			self.links.removeClass('selected');
			link.addClass('selected');
			selectedIndex = self.links.indexOf(link);
		};

		this.links = this.menu.getElements('a').addEvents({

			mouseup: function(e){
				self.fireEvent('press', this);
				self.hide();
				e.stopPropagation().preventDefault();
			},

			mousedown: function(e){
				e.stopPropagation().preventDefault();
			},
			
			mouseenter: function(){
				selectLink(this);
			},
			
			mouseleave: function(){
				this.removeClass('selected');
			}

		});
		
		new ART.Keyboard(this, this.options.keyboardOptions);
		
		var keySend = function(e){
			Keyboard.stop(e.preventDefault());
			var link = self.links[selectedIndex];
			if (link) link.fireEvent('mouseup', e);
		};
		
		this.attachKeys({
			'keyup:esc': function(e){
				Keyboard.stop(e.preventDefault());
				self.hide();
			},
			
			'keydown:down': function(e){
				Keyboard.stop(e.preventDefault());
				selectLink(self.links[selectedIndex + 1]);
			},
			
			'keydown:up': function(e){
				Keyboard.stop(e.preventDefault());
				selectLink(self.links[selectedIndex - 1]);
			},
			
			'keyup:space': keySend,
			
			'keyup:enter': keySend
			
		});
		
		this.hide();
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
		var sheet = this.parent(newSheet), cs = this.currentSheet;
		var boxChanged = !!(sheet.width || sheet.padding || sheet.borderRadius);
		
		if (boxChanged){
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
	},
	
	show: function(left, top){
		this.element.setStyles({left: left, top: top, visibility: 'visible'});
		this.enable();
		this.element.focus();
		return this;
	},
	
	hide: function(){
		this.element.setStyles({visibility: 'hidden'});
		this.links.removeClass('selected');
		this.disable();
		return this;
	}
	
});
	
})();
