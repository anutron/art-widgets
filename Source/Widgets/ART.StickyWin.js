ART.WindowManager = new Class({

	Extends: Stacker,

	initialize: function(widget, options){
		this.parent(options);
		this.keyboard = new Keyboard({
			active: true,
			manager: widget ? widget.keyboard : null
		});
		this.keyboard.widget = widget || 'window manager';
	},

	register: function(instance){
		this.parent.apply(this, arguments);
		this.keyboard.manage(instance.keyboard);
	},

	unregister: function(instance) {
		this.parent.apply(this, arguments);
		Keyboard.manager.drop(instance.keyboard);
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
		
		//events:
		'drag:start': $empty,
		'drag:move': $empty(x,y),
		'drag:end': $empty,
		'shade': $empty

		//these are the defaults for Element.position anyway
		************************************************
		edge: false, //see Element.position
		position: 'center', //center, corner == upperLeft, upperRight, bottomLeft, bottomRight
		offset: {x:0,y:0},
		relativeTo: document.body,
		allowNegative: false,
		posMin: {x: , y:}, //passed as 'minimum' to element.position
		posMax: {x: , y: },//passed as 'maximum' to element.position
		************************************************

		mask: false,
		maskTarget: document.body,
		*/
		maskOptions: {},
		hideOnMaskClick: true,
		closeClass: 'closeWin',
		close: true,
		draggable: false,
		dragHandle: false,
		showNow: true,
		useIframeShim: true,
		cascaded: false,
		constrainToContainer: false
	},

	hidden: true,

	initialize: function(options) {
		this.requireToRender('window:managed', 'window:displayed');
		if (!this.options.inject) {
			this.options.inject = {
				target: document.body,
				where: 'bottom'
			};
		}
		options = options || {};
		this.windowManager = options.windowManager || this.options.windowManager || ART.StickyWin.DefaultManager;
		delete this.options.windowManager;
		delete options.windowManager;
		if (!options.keyboardOptions) options.keyboardOptions = {};
		options.keyboardOptions.manager = options.keyboardOptions.manager || this.windowManager.keyboard;
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
		this.element.setStyle('display', 'none');
		if (this.options.useIframeShim) this.hideIframeShim();
		this.hidden = true;
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

	initialSize: function(element){
		['height', 'width'].each(function(axis) {
			var val = this.options[axis];
			if (val) {
				this['current'+axis.capitalize()] = val;
				(element || this.element).setStyle(axis, val);
			}
		}, this);
	},

	build: function(){
		this.element.setStyles({
			display: 'none',
			position: 'absolute'
		}).inject(this.options.inject.target, this.options.inject.where);
	},

	hide: function(){
		if (!this.hidden){
			this.element.setStyle('display', 'none');
			if (this.options.useIframeShim) this.hideIframeShim();
			this.parent();
		}
	},

	maskTarget: function(){
		var target = $(this.options.maskTarget);
		if (!target && this.options.maskOptions.inject && this.options.maskOptions.inject.target)
			target = $(this.options.maskOptions.inject.target) || $(document.body);
		else target = $(document.body);
		var mask = target.retrieve('StickyWin:mask');
		if (!mask) {
			var zIndex = this.options.maskOptions.zIndex;
			if (zIndex == null) {
				if (target != document.body && target.getStyle('zIndex') != "auto") zIndex = $(target).getStyle('zIndex').toInt() + 1;
				if (target == document.body || zIndex > $(this).getStyle('zIndex').toInt() || zIndex == null)
					zIndex = $(this).getStyle('zIndex').toInt() - 1;
				if (zIndex < 0 || isNaN(NaN)) zIndex = 0;
			}
			if (zIndex >= $(this).getStyle('zIndex').toInt()) $(this).setStyle('z-index', zIndex + 1);
			mask = new Mask(target, $merge({
					style: {
						zIndex: zIndex
					},
					destroyOnHide: true,
					hideOnClick: this.options.hideOnMaskClick
				}, this.options.maskOptions)
			).addEvent('hide', function(){
				if (!this.hidden) this.hide();
			}.bind(this));
			this.addEvent('hide', function(){
				if (!mask.hidden) mask.hide();
			});
		}
		mask.show();
	},

	show: function(){
		if (this.hidden){
			this.readyToRender('window:displayed');
			this.element.setStyles({
				opacity: 0,
				display: 'block'
			});
			this.parent();
			this.windowManager.enable(this);
			this.fireEvent('display');
			if (!this.positioned) this.position();
			if (this.options.useIframeShim) this.showIframeShim();
			this.element.setStyle('opacity', 1);
			if (this.options.mask) this.maskTarget();
		}
	},

	bringToFront: function(){
		this.windowManager.bringToFront(this);
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
					relativeTo: $(this.options.relativeTo) || $(document.body),
					position: this.options.position,
					offset: this.options.offset,
					edge: this.options.edge,
					minimum: this.options.posMin,
					maximum: this.options.posMax
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
		var size, 
				containerSize;
		this.touchDrag.addEvent('start', function(){
			this.fireEvent('drag:start');
			this.displayForDrag(true);
			this.startTop = this.element.offsetTop;
			this.startLeft = this.element.offsetLeft;
			if (this.options.constrainToContainer) {
				size = this.element.getSize();
				var container = $(this.options.constrainToContainer) || this.element.getParent();
				containerSize = container.getSize();
			}
		}.bind(this));
		this.touchDrag.addEvent('move', function(dx, dy){
			var top = this.startTop + dy;
			var left = this.startLeft + dx;
			if (top < 0) top = 0;
			if (left < 0) left = 0;
			if (this.options.constrainToContainer) {
				if (top + size.y > containerSize.y) top = containerSize.y - size.y;
				if (left + size.x > containerSize.x) left = containerSize.x - size.x;
			}
			this.element.setStyles({
				'top': top,
				'left': left
			});
			this.fireEvent('drag:move', [top, left]);
		}.bind(this));
		var end = function(){
			this.displayForDrag(false);
			this.fireEvent('drag:end');
		}.bind(this);
		this.touchDrag.addEvent('end', end);
		this.touchDrag.addEvent('cancel', end);
	},

	displayForDrag: function(dragging, render) {
		render = $pick(render, true);
		this.element[dragging ? 'addClass' : 'removeClass'](this.prefix + '-dragging');
		this[dragging ? 'addPseudo' : 'removePseudo']('dragging');
		if (render) this.render();
		this.fireEvent('shade', dragging);
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
		if (document.id(content) || $type(content) == "array") this.element.adopt(content);
		else if ($type(content) == "string") this.element.set('html', content);
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
	},

	getOnScreen: function(){
		var pos = this.element.getPosition();
		var size = this.element.getSize();
		var bottom = pos.y + size.y;
		var right = pos.x + size.x;
		var containerSize = $(window.getDocument()).getSize();
		if (bottom > containerSize.y) this.element.setStyle('top', containerSize.y - size.y);
		if (right > containerSize.x) this.element.setStyle('left', containerSize.x - size.x);
		return true;
	}

});

ART.StickyWin.DefaultManager = new ART.WindowManager();
