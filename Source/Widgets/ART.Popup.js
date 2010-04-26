/*
---
name: ART.Popup
description: Base class for windows and other popups.
requires: [ART.Widget, Core/Fx.Tween, More/IframeShim, More/Element.Position, Stacker, Touch/Touch, More/Mask, More/Element.Delegation, ART.Keyboard]
provides: [ART.Popup, ART.WindowManager]
...
*/


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
		self = this;
		instance._stackerEvents = events = {
			hide: function(){
				var layer = self.getLayerForInstance(instance);
				self.cycle('back', (layer && layer.name) || 'default');
			}
		};
		instance.addEvents(instance._stackerEvents);

	},

	unregister: function(instance) {
		var cycle = (this.enabled == instance);
		var layer = this.getLayerForInstance(instance);
		this.parent.apply(this, arguments);
		this.keyboard.drop(instance.keyboard);
		this.enableTop(layer);
		if (instance._stackerEvents) widget.removeEvents(instance._stackerEvents);
	}

});

ART.Popup = new Class({

	Extends: ART.Widget,

	name: 'popup',

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
		keyboardOptions: {},
		//events:
		'drag:start': $empty,
		'drag:move': $empty(x,y),
		'drag:end': $empty,
		'shade': $empty
		'unshade': $empty,

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

	initialize: function(options) {
		//by default, inject instances into the document.body
		if (!this.options.inject) {
			this.options.inject = {
				target: document.body,
				where: 'bottom'
			};
		}
		options = options || {};
		//delete any Class instance references from the options to avoid recurssion errors
		this.windowManager = options.windowManager || this.options.windowManager || ART.Popup.DefaultManager;
		delete this.options.windowManager;
		delete options.windowManager;

		//the window manager enables the windows; so we must start with disabled = true
		this.disabled = true;

		this.parent(options);

		//store a reference to this instance on the element
		this.element.store('Popup', this);

		//configure this instance's element
		this._build();

		this._artKB = new ART.Keyboard(this, this.options.keyboardOptions);

		//register this instance
		this.windowManager.register(this, this.options.windowManagerLayer);

		if (this.options.content) this.setContent(this.options.content);
		
		if (this.options.draggable) this.makeDraggable();
		
		if (this.options.timeout) {
			//hide this instance after the specified timeout
			this.addEvent('show', function(){
				this.hide.delay(this.options.timeout, this);
			}.bind(this));
		}
		
		this.attach();
		
		if (this.options.destroyOnClose) this.addEvent('hide', this.destroy.bind(this));
		this.element.setStyle('display', 'none');
		
		if (this.options.useIframeShim) this.hideIframeShim();
		this.setState('hidden', true);
		
		if (this.options.showNow) this.show();
		//add event to hide the instance whenever an element with the closeClass is clicked
		
		this.element.addEvent('click:relay(.' + this.options.closeClass + ')', function(){
			this.hide();
		}.bind(this));

	},

	attach: function(attach){
		if (!this.options.closeOnClickOut && !this.options.closeOnEsc) return;
		//add events for closing on escape and closing on clicking outside of the window
		var method = $pick(attach, true) ? 'addEvents' : 'removeEvents';
		var events = {};
		this._boundEsc = this._boundEsc || this.esc.bind(this);
		if (this.options.closeOnClickOut) events.click = this._boundEsc;
		if (this.options.closeOnEsc) events.keyup = this._boundEsc;
		document[method](events);
		return this;
	},

	detach: function(){
		return this.attach(false);
	},

	//check if the user hit the escape key and, if so, close the window
	esc: function(e) {
		if ((e.type == "click" && this.element != e.target && !this.element.hasChild(e.target)) || e.key == "esc") this.hide();
	},

	//set up the element
	_build: function(){
		//hide it and inject it into the document.
		this.element.setStyles({
			display: 'none',
			position: 'absolute'
		}).inject(this.options.inject.target, this.options.inject.where);
	},

	//hides the instance
	hide: function(){
		if (!this.getState('hidden')){
			this.element.setStyle('display', 'none');
			if (this.options.useIframeShim) this.hideIframeShim();
			this.fireEvent('hide');
			this.windowManager.enableTop(this.options.windowManagerLayer);
			this.deferDraw();
		}
		return this;
	},

	//masks a target beneath the window (such as the document body)
	maskTarget: function(){
		var target = document.id(this.options.maskTarget);
		if (!target && this.options.maskOptions.inject && this.options.maskOptions.inject.target)
			target = document.id(this.options.maskOptions.inject.target) || document.id(document.body);
		else target = document.id(document.body);

		var mask = target.retrieve('Popup:mask');
		if (!mask) {
			//compute the zindex of the mask to be just above the target
			//unless it's the document body, in which case put it just below this instance
			var zIndex = this.options.maskOptions.zIndex;
			if (zIndex == null) {
				if (target != document.body && target.getStyle('zIndex') != "auto") zIndex = document.id(target).getStyle('zIndex').toInt() + 1;
				if (target == document.body || zIndex > document.id(this).getStyle('zIndex').toInt() || zIndex == null)
					zIndex = document.id(this).getStyle('zIndex').toInt() - 1;
				if (zIndex < 0 || isNaN(NaN)) zIndex = 0;
			}
			if (zIndex >= document.id(this).getStyle('zIndex').toInt()) document.id(this).setStyle('z-index', zIndex + 1);
			mask = new Mask(target, $merge({
					style: {
						zIndex: zIndex
					},
					destroyOnHide: true,
					hideOnClick: this.options.hideOnMaskClick
				}, this.options.maskOptions)
			).addEvent('hide', function(){
				if (!this.getState('hidden')) this.hide();
			}.bind(this));
			this.addEvent('hide', function(){
				if (!mask.hidden) mask.hide();
			});
			target.store('Popup:mask', mask);
		}
		mask.show();
	},

	//show this instance
	show: function(){
		if (this.getState('hidden')){
			this.setState('hidden', false);
			this.element.setStyles({
				opacity: 0,
				display: 'block'
			});
			this.windowManager.enable(this);
			this.fireEvent('display');
			if (!this.positioned) {
				this.position(null, function(){
					this.element.setStyle('opacity', 1);
				}.bind(this));
			} else {
				this.element.setStyle('opacity', 1);
			}
			this.showIframeShim();
			if (this.options.mask) this.maskTarget();
		}
		return this;
	},

	//bring this instance to the front
	bringToFront: function(){
		this.windowManager.bringToFront(this);
		return this;
	},

	//positions this instance to the position specified in the options
	//pass in new options (same as those passed in on init) to override
	position: function(options, callback){
		this.positioned = true;
		this.setOptions(options);
		//if cascading is enabled and the window manager doesn't want to do this positioning for us
		if (true && this.options.cascaded && !this.windowManager.positionNew(this, this.options)) {
			//if top/left options defined in options, put the window there
			if ($defined(this.options.top) && $defined(this.options.left)) {
				this.element.setStyles({
					top: this.options.top,
					left: this.options.left
				});
			} else {
				if (!this.drawn) {
					this.position.delay(1, this, arguments);
					return this;
				}
				//else position it using the other options specified
				this.element.position({
					allowNegative: $pick(this.options.allowNegative, this.options.relativeTo != document.body),
					relativeTo: document.id(this.options.relativeTo) || document.id(document.body),
					position: this.options.position,
					offset: this.options.offset,
					edge: this.options.edge,
					minimum: this.options.posMin,
					maximum: this.options.posMax
				});
			}
		}
		if (callback) callback();
		if (this.shim) this.shim.position();
		return this;
	},
	
	draw: function(){
		this.drawn = true;
		return this.parent.apply(this, arguments);
	},

	//pins an instance to a specific fixed location using Element.Pin
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

	//makes the instance draggable using MooTools Touch
	makeDraggable: function(handle){
		handle = handle || this.options.dragHandle || this.element;
		this.touchDrag = new Touch(handle);
		handle.setStyle('cursor', 'move');
		var size, containerSize;
		this.touchDrag.addEvent('start', function(){
			this.fireEvent('drag:start');
			this.startTop = this.element.offsetTop;
			this.startLeft = this.element.offsetLeft;
			if (this.options.constrainToContainer) {
				size = this.element.getSize();
				var container = document.id(this.options.constrainToContainer) || this.element.getParent();
				containerSize = container.getSize();
			}
		}.bind(this));
		this.touchDrag.addEvent('move', function(dx, dy){
			this._displayForDrag(true);
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
			this._displayForDrag(false);
			this.fireEvent('drag:end');
		}.bind(this);
		this.touchDrag.addEvent('end', end);
		this.touchDrag.addEvent('cancel', end);
	},

	//add pseudo for dragging and fire the shade event when dragging starts/stops
	_displayForDrag: function(dragging, render) {
		if (this.getState('dragging') == dragging) return;
		render = $pick(render, true);
		this.setState('dragging', dragging);
		if (render) this.deferDraw();
		this.fireEvent(dragging ? 'shade' : 'unshade');
	},

	disableDrag: function(){
		this.touchDrag.detach();
		return this;
	},

	enableDrag: function(){
		this.touchDrag.attach();
		return this;
	},

	//set the content of this window
	//argument can be an element, an array of elements, or a string of html
	setContent: function(){
		if (document.id(content) || $type(content) == "array") this.element.adopt(content);
		else if ($type(content) == "string") this.element.set('html', content);
		return this;
	},

	//resize this instance to a given size
	resize: function(width, height){
		this.draw({'height': height, 'width': width});
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
		this.eject();
		this.element.destroy();
		this.fireEvent('destroy');
		return this;
	},

	//creates an IframeShim for this instance if one is required.
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

	//moves the instance to be on the screen
	getOnScreen: function(){
		var pos = this.element.getPosition();
		var size = this.element.getSize();
		var bottom = pos.y + size.y;
		var right = pos.x + size.x;
		var containerSize = document.id(window.getDocument()).getSize();
		if (bottom > containerSize.y) this.element.setStyle('top', containerSize.y - size.y);
		if (right > containerSize.x) this.element.setStyle('left', containerSize.x - size.x);
		return true;
	}

});

ART.Popup.DefaultManager = new ART.WindowManager();
