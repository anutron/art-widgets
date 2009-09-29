ART.WindowManager = new Class({

	Extends: Stacker,

	initialize: function(){
		this.parent.apply(this, arguments);
		this.keyboard = new Keyboard({
			active: true
		});
		this.keyboard.widget = 'window manager';
	},

	register: function(instance){
		this.parent.apply(this, arguments);
		this.keyboard.manage(instance.keyboard);
	},

	enable: function() {
		this.parent.apply(this, arguments);
		this.keyboard.enable();
		this.enabled.keyboard.enable();
	},

	unregister: function(instance) {
		this.parent.apply(this, arguments);
		Keyboard.manager.manage(instance.keyboard);
	}

});

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
		windowManager: instanceOfStacker,
		destroyOnClose: false,
		windowManagerLayer: 'default',

		//these are the defaults for Element.position anyway
		************************************************
		edge: false, //see Element.position
		position: 'center', //center, corner == upperLeft, upperRight, bottomLeft, bottomRight
		offset: {x:0,y:0},
		relativeTo: document.body,
		allowNegative: false,
		************************************************

		*/
		closeClass: 'closeWin',
		close: true,
		draggable: false,
		dragHandle: false,
		showNow: true,
		useIframeShim: true,
		cascaded: false
	},

	initialize: function(options) {
		this.requireToRender('window:managed', 'window:displayed');
		if (!this.options.inject) {
			this.options.inject = {
				target: document.body,
				where: 'bottom'
			};
		}
		this.windowManager = this.options.windowManager || ART.StickyWin.DefaultManager;
		//the window manager enables the windows; so we must start with disabled = true
		this.disabled = true;
		
		this.parent(options);
		this.element.store('StickyWin', this);
		this.build();
		this.windowManager.register(this, this.options.windowManagerLayer);
		this.readyToRender('window:managed');
		
		if (this.options.content) this.setContent(this.options.content);
		
		if (this.options.draggable) this.makeDraggable();
		if (this.options.timeout) {
			this.addEvent('show', function(){
				this.hide.delay(this.options.timeout, this);
			}.bind(this));
		}
		if (this.options.closeOnClickOut || this.options.closeOnEsc) this.attach();
		if (this.options.destroyOnClose) this.addEvent('hide', this.destroy.bind(this));
		if (this.options.showNow) this.show();
		
		this.element.addEvent('click:relay(.' + this.options.closeClass + ')', function(){
			this.hide();
		}.bind(this));
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
		}).inject(this.options.inject.target, this.options.inject.where);
	},

	hide: function(){
		this.element.setStyle('display', 'none');
		if (this.options.useIframeShim) this.hideIframeShim();
		this.parent();
	},

	show: function(){
		this.readyToRender('window:displayed');
		this.element.setStyles({
			opacity: 0,
			display: 'block'
		});
		this.windowManager.enable(this);
		this.position();
		if (this.options.useIframeShim) this.showIframeShim();
		this.element.setStyle('opacity', 1);
		this.parent();
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
					relativeTo: $(this.options.relativeTo) || $(document.body),
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

	disableDrag: function(){
		this.touchDrag.detach();
		return this;
	},

	enableDrag: function(){
		this.touchDrag.attach();
		return this;
	},

	setContent: function(){
		this.element.adopt(arguments);
		return this;
	},

	resize: function(width, height){
		this.render({'height': height, 'width': width});
		if (this.shim) this.shim.position();
		return this;
	},

	enable: function(callParent){
		if (callParent) this.parent();
		else this.windowManager.enable(this);
		return this;
	},

	destroy: function(){
		this.windowManager.unregister(this);
		if (this.options.useIframeShim && this.shim) this.shim.destroy();
		return this.parent();
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

ART.StickyWin.DefaultManager = new ART.WindowManager();
