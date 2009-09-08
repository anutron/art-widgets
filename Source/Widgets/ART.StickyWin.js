ART.WM = new Stacker();

ART.StickyWin = new Class({
	
	Extends: ART.Widget,
	
	name: 'stickywin',
	
	options: { 
		/*
		inject: {
			target: document.body,
			where: 'bottom'
		},
		content: null,
		timeout: 0,
		width: null,
		height: null,
		iframeShimSelector: '',
		closeOnClickOut: false,
		closeOnEsc: false,
		fadeTransition: 'sine:in:out',
		windowManager: instanceOfStacker,
		destroyOnClose: false,

		//these are the defaults for Element.position anyway
		************************************************
		edge: false, //see Element.position
		position: 'center', //center, corner == upperLeft, upperRight, bottomLeft, bottomRight
		offset: {x:0,y:0},
		relativeTo: document.body,
		allowNegative: false,
		************************************************

		*/
		close: true,
		draggable: false,
		dragHandle: false,
		showNow: true,
		useIframeShim: true,
		fade: true,
		fadeDuration: 150,
		cascaded: false
	},

	initialize: function(options) {
		if (!this.options.inject) {
			this.options.inject = {
				target: document.body,
				where: 'bottom' 
			};
		}
		this.windowManager = this.options.windowManager || ART.WM;
		this.parent(options);
		this.build();
		this.windowManager.register(this);
		if (this.options.content) this.setContent(this.options.content);
		if (this.options.draggable) this.makeDraggable();
		if (this.options.timeout) {
			this.addEvent('show', function(){
				this.hide.delay(this.options.timeout, this);
			}.bind(this));
		}
		if (this.options.closeOnClickOut || this.options.closeOnEsc) this.attach();
		if (this.options.destroyOnClose) this.addEvent('hide', this.destroy);
		if (this.options.showNow) this.show();
	},

	attach: function(attach){
		var method = $pick(attach, true) ? 'addEvents' : 'removeEvents';
		var events = {};
		if (this.options.closeOnClickOut) events.click = this.esc;
		if (this.options.closeOnEsc) events.keyup = this.esc;
		document[method](events);
	},

	esc: function(e) {
		if ((e.type == "click" && this.element != e.target && !this.element.hasChild(e.target)) || e.key == "esc") this.hide();
	},
	
	build: function(){
		var self = this;
		this.size = {};
		['height', 'width'].each(function(axis) {
			var val = this.options[axis];
			if (val) {
				this['current'+axis.capitalize()] = val;
				this.element.setStyle(axis, val);
			}
		}, this);
		this.element.setStyles({
			display: 'none',
			position: 'absolute'
		}).inject(this.options.inject.target, this.options.inject.where).store('StickyWin', this);;
	},

	hide: function(noFade){
		if (noFade) {
			this.element.setStyle('display', 'none');
			if (this.options.useIframeShim) this.hideIframeShim();
			this.parent();
		} else {
			this.fade(0);
		}
	},
	
	show: function(){
		this.parent();
		this.element.setStyle('display', 'block');
		if (!this.positioned) this.position();
		this.fade(1);
		this.windowManager.focus(this);
		if (this.options.useIframeShim) this.showIframeShim();
	},

	fade: function(to){
		if (!this.fadeFx) {
			this.element.setStyles({
				opacity: 0,
				display: 'block'
			});
			var opts = {
				property: 'opacity'
			};
			if (this.options.fadeDuration) opts.duration = this.options.fadeDuration;
			this.fadeFx = new Fx.Tween(this.element, opts);
		}
		this.fadeFx.clearChain();
		this.fadeFx.start(to).chain(function (){
			if (to == 0) {
				this.element.setStyle('display', 'none');
				//this.hide(true);
			} else {
				//this.show();
			}
		}.bind(this));
		return this;
	},

	position: function(options){
		this.positioned = true;
		this.setOptions(options);
		if (this.options.cascaded && !this.windowManager.positionNew(this, this.options)) {
			if ($defined(this.options.top) && $defined(this.options.left)) {
				this.element.setStyles({
					top: this.options.top,
					left: this.options.left
				});
			} else {
				this.element.position({
					allowNegative: $pick(this.options.allowNegative, this.options.relativeTo != document.body),
					relativeTo: this.options.relativeTo,
					position: this.options.position,
					offset: this.options.offset,
					edge: this.options.edge
				});
			}
		}
		if (this.shim) this.shim.position();
		return this;
	},

	pin: function(pin) {
		if (this.element.pin) {
			this.pinned = $pick(pin, true);
			this.element.pin(pin);
		}
		return this;
	},

	unpin: function(){
		return this.pin(false);
	},

	togglepin: function(){
		return this.pin(!this.pinned);
	},

	makeDraggable: function(handle){
		handle = handle || this.options.dragHandle || this.element;
		this.touchDrag = new Touch(handle);
		handle.setStyle('cursor', 'move');
		this.touchDrag.addEvent('start', function(){
			this.startTop = this.element.offsetTop;
			this.startLeft = this.element.offsetLeft;
		}.bind(this));
		
		this.touchDrag.addEvent('move', function(dx, dy){
			var top = this.startTop + dy;
			var left = this.startLeft + dx;
			if (top < 0) top = 0;
			if (left < 0) left = 0;
			this.element.setStyles({
				'top': top,
				'left': left
			});
		}.bind(this));
	},

	setContent: function(){
		this.element.adopt(arguments);
		return this;
	},
	
	resize: function(width, height){
		this.render({'height': height, 'width': width});
		return this;
	},

	focus: function(callParent){
		if (callParent) this.parent();
		else this.windowManager.focus(this);
	},

	destroy: function(){
		this.windowManager.unregister(this);
		this.element.dispose();
		if (this.options.useIframeShim && this.shim) this.shim.destroy();
		return this;
	},
	
	makeIframeShim: function(target){
		if (!this.shim){
			var el = this.element || target;
			if(this.options.iframeShimSelector) el = this.element.getElement(this.options.iframeShimSelector);
			this.shim = new IframeShim(el, {
				display: false,
				name: this.prefix + '_Shim'
			});
		}
	},

	showIframeShim: function(){
		if (this.options.useIframeShim) {
			this.makeIframeShim();
			this.shim.show();
		}
	},

	hideIframeShim: function(){
		if (this.shim) this.shim.hide();
	}

});