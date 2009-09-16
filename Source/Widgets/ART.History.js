ART.Sheet.defineStyle('history button.navLeft', {
	'float': 'left',
	'padding': 0
});
ART.Sheet.defineStyle('history button.navRight', {
	'corner-radius-top-right': 0,
	'corner-radius-bottom-right': 0,
	'float': 'left',
	'marginLeft': -1,
	'padding': 0
});
ART.Sheet.defineStyle('history button.navDown', {
	'height': 19,
	'width': 200,
	'corner-radius': 0,
	'corner-radius-top-right': 0,
	'corner-radius-bottom-right': 0,
	'corner-radius-top-left': 0,
	'corner-radius-bottom-left': 0,
	'glyph': false,
	'padding': 0,
	'float': 'left',
	'marginLeft': -1,
	'position': 'relative'
});
ART.Sheet.defineStyle('history button.refresh', {
	'height': 19,
	'width': 27,
	'padding': 0,
	'float': 'left',
	'marginLeft': -1,
	'corner-radius-top-right': 4,
	'corner-radius-bottom-right': 4,
	'corner-radius-top-left': 0,
	'corner-radius-bottom-left': 0,
	'glyph': 'refresh',
	'glyph-stroke': 0,
	'glyph-fill': true,
	'glyph-height': 20,
	'glyph-width': 20,
	'glyph-top': 5,
	'glyph-left': 13
});
ART.Sheet.defineStyle('history', {
	'position': 'relative',
	'width': 'auto'
});
ART.Sheet.defineStyle('history ul', {
	'left': 0,
	'overflow': 'visible',
	'border': 'solid #000',
	'border-width': '0px 1px 0px',
	'background': '#fff',
	'z-index': 10,
	'padding': 0,
	'margin': 0,
	'position': 'relative',
	'top': -4,
	'display': 'none'
});
ART.Sheet.defineStyle('history ul li', {
  'list-style': 'none'
});
ART.Sheet.defineStyle('history ul li a', {
	'display': 'block',
	'background': '#fff',
	'border-bottom': '1px solid #000',
	'padding': 4,
	'line-height': 12,
	'cursor': 'pointer',
	'color': '#333',
	'text-decoration': 'none'
});
ART.Sheet.defineStyle('history ul li a span', {
	'padding': '4px 0px 0px',
	'color': '#888',
	'font-weight': 'normal',
	'cursor': 'pointer',
	'display': 'block',
	'font-size': 9
});
ART.Sheet.defineStyle('history ul li a.current', {
	'font-weight': 'bold',
	'background-color': '#ddd'
});
ART.Sheet.defineStyle('history div.location_text', {
	'height': 12,
	'left': 7,
	'overflow': 'hidden',
	'position': 'absolute',
	'top': 2,
	'padding-right': 12
});
ART.Sheet.defineStyle('history ul li a:hover', {
	'cursor': 'pointer',
	'background-color': '#d5dee5',
	'color': '#000'
});
ART.Sheet.defineStyle('history ul li.hovered a', {
	'background-color': '#d5dee5',
	'color': '#000',
	'cursor': 'pointer'
});
ART.Sheet.defineStyle('history input', {
	'display': 'none',
	'position': 'absolute',
	'height': 9,
	'left': 54,
	'top': 1,
	'background-color': 'transparent',
	'border': 'none',
	'font-family':"'Lucida Grande','Lucida Sans Unicode','Trebuchet MS',Helvetica,Arial,sans-serif",
	'font-size': 12,
	'height': 14,
	'position': 'absolute',
	'width': 300,
	'color': '#fff'
});

ART.Sheet.defineStyle('history divot', {
	'position': 'absolute',
	'right': 5,
	'top': 7,
	'color': hsb(0, 0, 33)
});
ART.Sheet.defineStyle('history:disabled divot', {
	'color': hsb(0, 0, 66)
});

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
		*/
		maxToShow: 4,
		editable: false,
		history: []
	},
	
	initialize: function(options) {
		this.parent(options);
		this.selected = $pick(this.options.selected, this.history.length -1);
		this.build();
		this.render();
		this.setHistory(this.options.history);
		this.setNavState();
		this.attach();
	},
	
	history: [],
	
	resize: function() {
		var w = this.element.getSize().x - $(this.nav_back).getSize().x - $(this.nav_next).getSize().x - $(this.refresher).getSize().x - 5;
		['padding', 'margin'].each(function(style){
			this.element.getStyle(style).split(' ').each(function(val, i) {
				if (i%2) w = w - val.toInt();
			});
		}, this);
		this.location.render({
			width: w
		});
	},
	
	build: function(){
		this.nav_back = new ART.Button.Nav.Left().setParent(this);
		$(this.nav_back).inject(this.element).addEvent('click', this.back.bind(this));

		this.nav_next = new ART.Button.Nav.Right().setParent(this);
		$(this.nav_next).inject(this.element).addEvent('click', this.next.bind(this));

		this.location = new ART.Button.Nav.Down().setParent(this);
		this.location_text = new Element('div');
		$(this.location).inject(this.element).addEvent('click', function(){
			this.toggle();
		}.bind(this)).adopt(this.location_text);

		this.divot = new ART.Paint().resize({x: 10, y: 10});
		$(this.divot).inject(this.location).setStyles(ART.Sheet.lookupStyle(this.getSelector() + ' divot'));

		this.refresher = new ART.Button({
			className: 'refresh'
		}).setParent(this);

		$(this.refresher).inject(this.element).addEvent('click', function(){
			this.fireEvent('refresh');
		}.bind(this));

		//create the list for the history
		this.nav = new Element('ul').inject(this.location);

		var hoveredStyles = ART.Sheet.lookupStyle(this.getSelector() + ' ul li.hovered a');
		var nonHovered = ART.Sheet.lookupStyle(this.getSelector() + ' ul li a');
		var currentHovered = ART.Sheet.lookupStyle(this.getSelector() + ' ul li a.current');

		this.attachKeys({
			down: function(e) {
				e.preventDefault();
				//hover the next item
				var hovered = this.nav.getElement('li.hovered');
				var target;
				if (!hovered) {
					target = this.nav.getElement('li');
				} else {
					var lis = this.nav.getElements('li');
					target = lis[lis.indexOf(hovered) + 1];
					if (!target) return;
					hovered.removeClass('hovered');
					var a = hovered.getElement('a');
					if (a.hasClass('current')) a.setStyles(currentHovered);
					else a.setStyles(nonHovered);
				}
				if (target) {
					target.addClass('hovered').getElement('a').setStyles(hoveredStyles);
					this.editor.set('value', target.getElement('a').get('href')).setCaretPosition('end');
				}
			}.bind(this),
			up: function(e) {
				//hover the previous item
				e.preventDefault();
				var hovered = this.nav.getElement('li.hovered');
				var target;
				if (!hovered) {
					target = this.nav.getElement('li');
				} else {
					var lis = this.nav.getElements('li');
					target = lis[lis.indexOf(hovered) - 1];
					if (!target) return;
					var a = hovered.removeClass('hovered').getElement('a');
					if (a.hasClass('current')) a.setStyles(currentHovered);
					else a.setStyles(nonHovered);
				}
				if (target) {
					target.addClass('hovered').getElement('a').setStyles(hoveredStyles);
					this.editor.set('value', target.getElement('a').get('href')).setCaretPosition('end');
				}
			}.bind(this),
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
						this.fireEvent('selectManual', this.editor.get('value'));
						this.hide();
					}
				}.bind(this),
				mousedown: function(e){
					e.stopPropagation();
				}
			}
		}).inject(this.element);

	},
	
	render: function(){
		this.parent();
		if (!this.nav_back) return;
		this.element.setStyles(ART.Sheet.lookupStyle(this.getSelector()));
		
		this.nav_back.render();
		$(this.nav_back).setStyles(ART.Sheet.lookupStyle(this.nav_back.getSelector()));

		this.nav_next.render();
		$(this.nav_next).setStyles(ART.Sheet.lookupStyle(this.nav_next.getSelector()));

		this.location.render();
		this.location_text.setStyles(ART.Sheet.lookupStyle(this.getSelector() + ' div.location_text'));
		$(this.location).setStyles(ART.Sheet.lookupStyle(this.location.getSelector()));

		this.refresher.render();
		$(this.refresher).setStyles(ART.Sheet.lookupStyle(this.refresher.getSelector()));

		this.resize();
		this.nav.setStyles(ART.Sheet.lookupStyle(this.getSelector() + ' ul'));

		this.divot.start({x: 0, y: 0});
		this.divot.shape('triangle', {x: 9, y: 5}, 'down');
		var divotStyles = ART.Sheet.lookupStyle(this.getSelector() + ' divot');
		this.divot.end({fill: true, fillColor: divotStyles.color});

		this.editor.setStyles(ART.Sheet.lookupStyle(this.getSelector() + (this.history.length ? ' input': ' input:disabled')));
		this.resize();
	},
	
	destroy: function(){
		this.element.empty();
		this.detach();
	},
	
	attach: function(attach) {
		var method = $pick(attach, true) ? 'addEvents' : 'removeEvents';
		this.outClick = this.outClick || function(e){
			if (!this.element.hasChild(e.target) && this.element != e.target) this.hide();
		}.bind(this);
		$(document)[method]({
			click: this.outClick
		});
	},
	
	detach: function(){
		this.attach(false);
	},
	
	push: function(item, select, index) {
		if ($type(item) == 'string') item = { path: item, title: item };
		this.history = this.history.filter(function(hist) {
			return item.path != hist.path;
		});

		this.dropFutureHistory();

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
	
	toggle: function(){
		//if the nav is already displayed, hide it (so this toggles);
		if (this.nav.getStyle('display') != 'none') return this.hide();
		else return this.show();
	},

	showEditor: function(show){
		if ($pick(show, true) && this.history.length) {
			this.editor.setStyle('display', 'block').set('value', this.history[this.selected].path).select();
			this.editor.setStyle('width', $(this.location).getSize().x - 30);
			this.location_text.setStyle('display', 'none');
		} else {
			this.editor.setStyle('display', 'none');
			this.location_text.setStyle('display', 'block');
			if (this.history.length) this.editor.set('value', this.history[this.selected].title);
		}
	},

	//displays the dropdown list of your history
	show: function(){
		this.parent.apply(this, arguments);
		if(this.nav.isDisplayed()) return this;
		//activate this keyboard watcher
		this.keyboard.activate();
		this.location.activate();
		if (this.options.editable) this.showEditor();
		
		//mark it as active (this makes it stand out a bit more)
		this.element.addClass('history_location_active');
		//create list items for each history item
		var liStyles = ART.Sheet.lookupStyle(this.getSelector() + ' ul li');
		var liAnchorStyles = ART.Sheet.lookupStyle(this.getSelector() + ' ul li a');
		var liCurrentAnchorStyles = ART.Sheet.lookupStyle(this.getSelector() + ' ul li a.current');
		var hoveredStyles = ART.Sheet.lookupStyle(this.getSelector() + ' ul li.hovered a');
		var urlStyles = ART.Sheet.lookupStyle(this.getSelector() + ' ul li a span');
		var nav = this.nav;

		var lis = this.history.map(function(hist, index){
			if (index < this.selected - this.options.maxToShow || index > this.selected + this.options.maxToShow) return;
			var current = this.selected == index;
			var link = new Element('a', {
				html: hist.title,
				href: hist.path,
				'class': current ? 'current' : '',
				events: {
					click: function(e){
						e.preventDefault();
						//this.loadHistory(index);
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
			if (hist.path != hist.title) {
				link.adopt(new Element('span', {
					html: hist.path
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
	
	hide: function(){
		this.parent.apply(this, arguments);
		this.element.removeClass('history_location_active');
		this.location.deactivate();
		this.keyboard.relenquish(); //disable the main keyboard
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
		this.hide();
		this.setTitle(hist.title);
		this.selected = this.history.indexOf(hist);
		this.setNavState();
		return suppressEvent ? this : this.fireEvent('select', [ hist, this.selected ]);
	},

	setNavState: function(){
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

	back: function(){
		var hist = this.history[this.selected - 1];
		if (hist) {
			this.select(hist);
			this.fireEvent('back');
		}
	},

	next: function(){
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