/*
---
name: ART.History
description: A history component with forward, back, location, and reload buttons.
requires: [ART.Button, Core/Element.Dimensions, More/Element.Forms, More/Element.Shortcuts, ART.Glyphs, ART.Keyboard]
provides: ART.History
...
*/
ART.Sheet.define('history.art', {
	'height': 20,
	'width': 400,
	'padding':[0, 0, 0, 0]
});
ART.Sheet.define('history.art', {
	'position': 'relative',
	'width': 'auto',
	'display': 'block'
}, 'css');
ART.Sheet.define('history.art button.art', {
	'shadow-color': hsb(0, 0, 0, 0)
});
ART.Sheet.define('history.art button.art.navLeft', {
	'padding': [0, 0, 0, 0],
	'border-radius': [4, 0, 0, 4],
	'glyph-top': 5,
	'glyph-left': 6,
	'glyph-right': 8,
	'glyph-bottom': 6
});
ART.Sheet.define('history.art button.art.navLeft', {
	'float': 'left'
}, 'css');
ART.Sheet.define('history.art button.art.navRight', {
	'glyph-top': 5,
	'glyph-left': 8,
	'glyph-right': 6,
	'glyph-bottom': 6,
	'border-radius': [0, 0, 0, 0],
	'padding': [5, 8, 6, 6]
});
ART.Sheet.define('history.art button.art.navRight', {
	'float': 'left',
	'left': -1,
	'position': 'relative'
}, 'css');
ART.Sheet.define('history.art button.art.navDown', {
	'height': 19,
	'width': 200,
	'border-radius': [0, 0, 0, 0],
	'glyph': false,
	'padding': [0, 0, 0, 0]
});
ART.Sheet.define('history.art button.art.navDown:editing', {
	'background-color': ['hsb(0, 0, 100)', 'hsb(0, 0, 95)'],
	'border-color': ['hsb(0, 0, 0)', 'hsb(0, 0, 0)']
});
ART.Sheet.define('history.art button.art.navDown', {
	'float': 'left',
	'left': -2,
	'position': 'relative'
}, 'css');
ART.Sheet.define('history.art button.art.refresh', {
	'height': 19,
	'width': 27,
	'padding': [0, 0, 0, 0],
	'border-radius': [0, 4, 4, 0],
	'glyph': ART.Glyphs.refresh,
	'glyph-stroke': 0,
	'glyph-fill': true,
	'glyph-height': 12,
	'glyph-width': 12,
	'glyph-top': 4,
	'glyph-left': 8
});
ART.Sheet.define('history.art button.art.refresh', {
	'float': 'left',
	'left': -3,
	'position': 'relative'
}, 'css');
ART.Sheet.define('history.art ul', {
	'left': 0,
	'overflow': 'visible',
	'border': 'solid #000',
	'border-width': '0px 1px 0px',
	'background': '#fff',
	'z-index': 10,
	'padding': [0, 0, 0, 0],
	'margin': 0,
	'position': 'relative',
	'top': 19,
	'display': 'none'
}, 'css');
ART.Sheet.define('history.art ul li', {
	'font-family':"'Lucida Grande','Lucida Sans Unicode','Trebuchet MS',Helvetica,Arial,sans-serif",
	'font-size': 12,
  'list-style': 'none'
}, 'css');
ART.Sheet.define('history.art ul li a', {
	'display': 'block',
	'position': 'relative',
	'background': '#fff',
	'border-bottom': '1px solid #000',
	'padding': [4, 4, 4, 4],
	'line-height': 12,
	'cursor': 'pointer',
	'color': '#333',
	'text-decoration': 'none'
}, 'css');
ART.Sheet.define('history.art ul li a span', {
	'padding': '4px 0px 0px',
	'color': '#888',
	'font-weight': 'normal',
	'cursor': 'pointer',
	'display': 'block',
	'font-size': 9
}, 'css');
ART.Sheet.define('history.art ul li a.current', {
	'font-weight': 'bold',
	'background-color': '#ddd'
}, 'css');
ART.Sheet.define('history.art div.location_text', {
	'height': 16,
	'left': 7,
	'overflow': 'hidden',
	'position': 'absolute',
	'top': 1,
	'padding-right': 12,
	'font-family':"'Lucida Grande','Lucida Sans Unicode','Trebuchet MS',Helvetica,Arial,sans-serif",
	'font-size': 12
}, 'css');
ART.Sheet.define('history.art ul li a:hover', {
	'cursor': 'pointer',
	'background-color': '#d5dee5',
	'color': '#000'
}, 'css');
ART.Sheet.define('history.art ul li.hovered a', {
	'background-color': '#d5dee5',
	'color': '#000',
	'cursor': 'pointer'
}, 'css');
ART.Sheet.define('history.art input', {
	'display': 'none',
	'position': 'absolute',
	'height': 9,
	'margin-left': 45,
	'top': 1,
	'background-color': 'transparent',
	'border': 'none',
	'font-family':"'Lucida Grande','Lucida Sans Unicode','Trebuchet MS',Helvetica,Arial,sans-serif",
	'font-size': 12,
	'height': 14,
	'position': 'absolute',
	'width': 300,
	'color': '#000'
}, 'css');

ART.Sheet.define('history.art divot', {
	'color': hsb(0, 0, 33),
	'width': 20,
	'height': 20
});
ART.Sheet.define('history.art divot', {
	'position': 'absolute',
	'right': 5,
	'top': 7
}, 'css');


ART.History = new Class({

	Extends: ART.Widget,
	
	name: 'history',
	
	options: {
		/*
		selected: 0,
		onAdd: $empty(item, index),
		onRemove: $empty(item),
		onSelectManual: $empty(path),
		onShowEditor: $empty,
		onHideEditor: $empty,
		onSelect: $empty(item),
		onBack: $empty(item, index),
		onForward: $empty(item, index),
		onRefresh: $empty,
		keyboardOptions: {},
		*/
		pathFilter: function(val){ return val;},
		pathBuilder: function(val){ return val; },
		maxToShow: 4,
		editable: false,
		history: [],
		showPath: true,
		renderWhileHidden: true,
		styles: {}
	},
	
	initialize: function(options) {
		this.parent(options);
		new ART.Keyboard(this, this.options.keyboardOptions);
		this.selected = $pick(this.options.selected, this.history.length -1);
		this._build();
		this.setHistory(this.options.history);
		this.setNavState();
		this.attach();
	},

	history: [],
	
	resize: function(w, force) {
		if (!w || this.isDestroyed()) return this;
		var cs = this.currentSheet;
		if (w != this.options.styles.width || !this._drawn || force) {
			this._drawn = true;
			this.setOptions({ styles: { width: w } });
			['nav_back', 'nav_next', 'refresher'].each(function(button) {
				w = w - this[button].getSize().width;
			}, this);
			if (cs.padding) w = w - cs.padding[1] - cs.padding[3];
			w = w - 10;
			this.location.setStyles({
				width: w
			}).draw();
		}
		return this;
	},
	
	_build: function(){
		document.id(this).setStyle('display', 'none');
		var cancel = function(e) {
			e.stopPropagation();
		};
		this.nav_back = new ART.Button({
			className: 'art navLeft',
			tabIndex: 1,
			glyph: ART.Glyphs.triangleLeft,
			onPress: this.back.bind(this)
		}).inject(this);
		document.id(this.nav_back).addEvent('mousedown', cancel);

		this.nav_next = new ART.Button({
			className: 'art navRight',
			tabIndex: 1,
			glyph: ART.Glyphs.triangleRight,
			onPress: this.next.bind(this)
		}).inject(this);
		document.id(this.nav_next).addEvent('mousedown', cancel);

		this.location = new ART.Button({
			className: 'art navDown',
			tabIndex: 1,
			onPress: this.toggle.bind(this)
		}).inject(this);
		this.location_text = new Element('div', {'class': 'location_text'});
		document.id(this.location).adopt(this.location_text).addEvent('mousedown', cancel);

		this.divotContainer = new ART().resize(10, 10).inject(this.location);
		this.divot = new ART.Shape("M0,0L8,0L4,8L0,0")
		                    .inject(this.divotContainer)
		                    .translate(0, -1);
		document.id(this.divotContainer).setStyles(ART.Sheet.lookup(this.toString() + ' divot', 'css'));
		this.divotContainer.grab(this.divot);
		window.dc = this.divotContainer;
		window.divot = this.divot;

		this.refresher = new ART.Button({
			className: 'art refresh',
			tabIndex: 1,
			onPress: function(e){
				var hist = this.history[this.selected] || {};
				this.fireEvent('refresh', [ this.options.pathBuilder(hist.path), hist.title, this.selected ]);
			}.bind(this)
		}).inject(this);
		document.id(this.refresher).addEvent('mousedown', cancel);
		

		//create the list for the history
		this.nav = new Element('ul').inject(this.location);

		var hoveredStyles = ART.Sheet.lookup(this.toString() + ' ul li.hovered a', 'css');
		var nonHovered = ART.Sheet.lookup(this.toString() + ' ul li a', 'css');
		var currentHovered = ART.Sheet.lookup(this.toString() + ' ul li a.current', 'css');

		var arrow = function(e, polarity){
			e.preventDefault();
			//hover the next item
			var hovered = this.nav.getElement('li.hovered');
			var target;
			if (!hovered) {
				target = this.nav.getElement('li');
			} else {
				var lis = this.nav.getElements('li');
				target = lis[lis.indexOf(hovered) + (polarity*1)];
				if (!target) return;
				hovered.removeClass('hovered');
				var a = hovered.getElement('a');
				if (a.hasClass('current')) a.setStyles(currentHovered);
				else a.setStyles(nonHovered);
			}
			if (target) {
				target.addClass('hovered').getElement('a').setStyles(hoveredStyles);
				this.editor.set('value', this.options.pathFilter(target.getElement('a').get('href'))).setCaretPosition('end');
			}
		};

		this.attachKeys({
			down: arrow.bindWithEvent(this, 1),
			up: arrow.bindWithEvent(this, -1),
			enter: function(e) {
				var hovered = this.nav.getElement('li.hovered a');
				if (hovered) hovered.fireEvent('click');
			}.bind(this),
			esc: function(e) {
				this.hide();
			}.bind(this)
		});

		this.editor = new Element('input', {
			events: {
				keyup: function(e) {
					if (e.key == 'enter') {
						this.fireEvent('selectManual', this.options.pathBuilder(this.editor.get('value')));
						this.hide();
					}
				}.bind(this),
				mousedown: function(e){
					e.stopPropagation();
				}
			}
		}).inject(this.element);
	},
	
	draw: function(newSheet){
		var sheet = this.parent(newSheet);
		var cs = this.currentSheet;

		if (this.current_selector == this.toString()) return;
		this.current_selector = this.toString();
		this.element.setStyles({
			height: cs.height,
			padding: cs.padding
		});
		document.id(this.nav_back).setStyles(ART.Sheet.lookup(this.nav_back.toString(), 'css'));

		document.id(this.nav_next).setStyles(ART.Sheet.lookup(this.nav_next.toString(), 'css'));

		this.location_text.setStyles(ART.Sheet.lookup(this.toString() + ' div.location_text', 'css'));
		document.id(this.location).setStyles(ART.Sheet.lookup(this.location.toString(), 'css'));

		document.id(this.refresher).setStyles(ART.Sheet.lookup(this.refresher.toString(), 'css'));

		this.nav.setStyles(ART.Sheet.lookup(this.toString() + ' ul', 'css'));
		
		var divotStyles = ART.Sheet.lookup(this.toString() + ' divot');
		this.divot.fill.apply(this.divot, $splat(divotStyles.color));

		this.editor.setStyles(ART.Sheet.lookup(this.toString() + (this.history.length ? ' input': ' input:disabled'), 'css'));
		this.resize(cs.width);
		this.element.setStyles(ART.Sheet.lookup(this.toString(), 'css'));
		
	},
	
	destroy: function(){
		this.eject();
		this.element.destroy();
		this.fireEvent('destroy');
	},
	
	attach: function(attach) {
		var method = $pick(attach, true) ? 'addEvents' : 'removeEvents';
		this.outClick = this.outClick || function(e){
			if (!this.element.hasChild(e.target) && this.element != e.target) this.hide();
		}.bind(this);
		document.id(document)[method]({
			click: this.outClick
		});
	},
	
	detach: function(){
		this.attach(false);
	},
	
	push: function(item, select, index) {
		//make the item a history object if it is a string
		if ($type(item) == 'string') item = { path: item, title: item };
		//remove anything forward of this.selected
		this.dropFutureHistory();
		//strip it from the current history
		this.history = this.history.filter(function(hist) {
			return item.path != hist.path;
		});

		if($type(index) == 'number' && index < this.history.length) {
			this.history = this.history.splice(index, 0, item);
			this.selected = index;
		} else {
			this.history.push(item);
		}
		if ($pick(select, true)) {
			this.selected = this.history.indexOf(item);
			this.select(item, true);
		}
		this.fireEvent('add', [item, this.selected]);
	},
	
	pop: function(){
		var item = this.history.getLast();
		this.remove(item);
		return item;
	},

	remove: function(item) {
		var val = this.history[this.selected];
		this.history.erase(item);
		if (val == item) this.makeEndSelected();
		this.fireEvent('remove', item);
		return this;
	},
	
	dropFutureHistory: function(){
		this.history = this.history.slice(0, this.selected + 1);
	},
	
	toggle: function(e){
		//if the nav is already displayed, hide it (so this toggles);
		if (this.nav.getStyle('display') != 'none') return this.hide();
		else return this.show();
	},

	showEditor: function(show){
		if ($pick(show, true) && this.history.length) {
			this.editor.setStyle('display', 'block')
			    .set('value', this.options.pathFilter(this.history[this.selected].path)).select();
			this.editor.setStyle('width', document.id(this.location).getSize().x - 30);
			this.location_text.setStyle('display', 'none');
		} else {
			this.editor.setStyle('display', 'none');
			this.location_text.setStyle('display', 'block');
			if (this.history.length) this.editor.set('value', this.history[this.selected].title);
		}
	},

	//displays the dropdown list of your history
	show: function(e){
		if(this.nav.isDisplayed()) return this;
		//activate this keyboard watcher
		this.keyboard.activate();
		this.location.setState('editing', true);
		document.id(this.divotContainer).setStyle('display', 'none');
		if (this.options.editable) this.showEditor();
		
		//mark it as active (this makes it stand out a bit more)
		this.element.addClass('history_location_active');
		//create list items for each history item
		var liStyles = ART.Sheet.lookup(this.toString() + ' ul li', 'css');
		var liAnchorStyles = ART.Sheet.lookup(this.toString() + ' ul li a', 'css');
		var liCurrentAnchorStyles = ART.Sheet.lookup(this.toString() + ' ul li a.current', 'css');
		var hoveredStyles = ART.Sheet.lookup(this.toString() + ' ul li.hovered a', 'css');
		var urlStyles = ART.Sheet.lookup(this.toString() + ' ul li a span', 'css');
		var nav = this.nav;

		var lis = this.history.map(function(hist, index){
			if (index < this.selected - this.options.maxToShow || index > this.selected + this.options.maxToShow) return;
			var current = this.selected == index;
			var link = new Element('a', {
				html: hist.title,
				href: this.options.pathBuilder(hist.path),
				'class': current ? 'current' : '',
				events: {
					click: function(e) {
						e.stop();
						this.select(hist);
					}.bind(this),
					mouseup: function(e){
						if (e) e.preventDefault();
						this.selected = index;
						this.select(hist);
					}.bind(this),
					mouseenter: function(){
						var hovered = nav.getElement('li.hovered');
						if (hovered) {
							var a = hovered.removeClass('hovered').getElement('a');
							if (a.hasClass('current')) a.setStyles(liCurrentAnchorStyles);
							else a.setStyles(liAnchorStyles);
						}
						this.setStyles(hoveredStyles);
						this.getParent('li').addClass('hovered');
					},
					mouseleave: function(){
						this.setStyles(current ? liCurrentAnchorStyles : liAnchorStyles);
					}
				},
				styles: current ? liCurrentAnchorStyles : liAnchorStyles
			});
			if (this.options.showPath && hist.path != hist.title && ['string', 'element'].contains($type(hist.path))) {
				link.adopt(new Element('span', {
					html: this.options.pathFilter(hist.path)
				}).setStyles(urlStyles));
			}
			return new Element('li').adopt(link).setStyles(liStyles);
		}, this);
		//empty the nav (destroying all children), inject the list items, 
		//then put the static prompt back in at the end and show
		this.nav.empty().adopt(lis.reverse()).setStyle('display', 'block');
		this.fireEvent('showEditor');
		return this;
	},
	
	hide: function(e){
		if (!this.location) return;
		this.element.removeClass('history_location_active');
		this.location.setState('editing', false);
		this.location.draw();
		document.id(this.divotContainer).setStyle('display', 'block');
		this.keyboard.relinquish(); //disable the main keyboard
		this.nav.setStyle('display', 'none'); //hide the nav
		this.showEditor(false);
		this.fireEvent('hideEditor');
		return this;
	},

	blur: function(){
		this.parent.apply(this, arguments);
		this.hide();
	},
	
	disable: function(){
		this.parent.apply(this, arguments);
		this.hide();
	},
	
	enable: function(){
		this.parent.apply(this, arguments);
		this.setNavState();
	},
	
	select: function(hist, suppressEvent){
		this.setTitle(hist.title);
		this.selected = this.history.indexOf(hist);
		this.setNavState();
		return suppressEvent ? this : this.fireEvent('select', [ this.options.pathBuilder(hist.path), hist.title, this.selected ]);
	},

	setNavState: function(){
		if (!this.location) return;
		var hasNext = !!this.history[this.selected + 1];
		var hasPrev = !!this.history[this.selected - 1];
		if (!hasNext) this.nav_next.disable();
		else this.nav_next.enable();
		if (!hasPrev) this.nav_back.disable();
		else this.nav_back.enable();
		if (!this.history.length) {
			this.location.disable();
			this.refresher.disable();
		} else {
			this.location.enable();
			this.refresher.enable();
		}
	},

	back: function(e){
		var hist = this.history[this.selected - 1];
		if (hist) {
			this.select(hist);
			this.fireEvent('back');
		}
	},

	next: function(e){
		var hist = this.history[this.selected + 1];
		if (hist) {
			this.select(hist);
			this.fireEvent('forward');
		}
	},

	setEditable: function(editable) {
		this.options.editable = editable;
	},

	setTitle: function(title) {
		this.location_text.set('html', title);
	},
	
	getHistory: function(){
		return this.history;
	},
	
	setHistory: function(arr) {
		this.clear();
		arr.each(function(hist) {
			this.push(hist);
		}, this);
	},
	
	clear: function(){
		this.history.empty();
	},
	
	makeEndSelected: function(){
		this.selected = Math.max(this.history.length - 1, 0);
	},
	
	getSelected: function(){
		return this.history[this.selected];
	}

});