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
		var self = this;
		instance._stackerEvents = events = {
			hide: function(){
				var layer = self.getLayerForInstance(instance);
				self.cycle('back', (layer && layer.name) || 'default');
			}
		};
		instance.addEvents(instance._stackerEvents);
	},

	unregister: function(instance) {
		var cycle = (this.focused == instance);
		var layer = this.getLayerForInstance(instance);
		this.parent.apply(this, arguments);
		this.keyboard.drop(instance.keyboard);
		this.focusTop(layer);
		if (instance._stackerEvents) instance.removeEvents(instance._stackerEvents);
	}

});

ART.Popup = new Class({

	Extends: ART.Widget,

	name: 'popup',

	options: { 
		/*
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
		'hide': $empty,
		'show': $empty,

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
		useIframeShim: true,
		cascaded: false,
		constrainToContainer: false,
		showOnInject: true
	},

	initialize: function(options) {
		this._focus = this.focus;
		this.focus = this._focusWindow;
		options = options || {};
		//delete any Class instance references from the options to avoid recurssion errors
		this.windowManager = options.windowManager || this.options.windowManager || ART.Popup.DefaultManager;
		delete this.options.windowManager;
		delete options.windowManager;

		this.setState('hidden', true);
		this.parent(options);
		this._hiddenByEjection = this.options.showOnInject;

		//store a reference to this instance on the element
		this.element.store('Popup', this);

		//configure this instance's element
		this._build();
		this.element.setStyle('display', 'none');

		new ART.Keyboard(this, this.options.keyboardOptions);

		//register this instance
		this.windowManager.register(this, this.options.windowManagerLayer);

		if (this.options.draggable) this.makeDraggable();
		
		if (this.options.timeout) {
			//hide this instance after the specified timeout
			this.addEvent('show', function(){
				this.hide.delay(this.options.timeout, this);
			}.bind(this));
		}
		
		this.attach();
		
		if (this.options.destroyOnClose) this.addEvent('hide', this.destroy.bind(this));
		
		if (this.options.useIframeShim) this.hideIframeShim();

		if (this.options.content) this.setContent(this.options.content);

		//add event to hide the instance whenever an element with the closeClass is clicked
		this.element.addEvent('click:relay(.' + this.options.closeClass + ')', function(e){
			e.stop();
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
			position: 'absolute'
		});
	},

	//hides the instance
	hide: function(){
		if (!this.getState('hidden')){
			this.element.setStyle('display', 'none');
			if (this.options.useIframeShim) this.hideIframeShim();
			this.setState('hidden', true);
			this.fireEvent('hide');
			this.windowManager.focusTop(this.options.windowManagerLayer);
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
		if (!mask || !$(mask).parentNode) {
			if (mask) mask.destroy();
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
			).addEvents({
				hide: function(){
					if (!this.getState('hidden')) this.hide();
				}.bind(this),
				destroy: function(){
					this.removeEvent('hide', mask._popupHider);
				}.bind(this)
			});
			mask._popupHider = function(){
				mask.hide();
			};
			mask._popupDestroyer = function(){
				mask.destroy();
			};
			this.addEvents({
				hide: mask._popupHider,
				destroy: mask._popupDestroyer
			});
			target.store('Popup:mask', mask);
		}
		mask.show();
	},

	inject: function(){
		var ret = this.parent.apply(this, arguments);
		if (this._hiddenByEjection) this.show.delay(1, this);
		if (!this.getState('hidden') && !this.positioned) this.position();
		return ret;
	},
	
	eject: function(){
		this._hiddenByEjection = true;
		this.hide();
		return this.parent.apply(this, arguments);
	},

	//show this instance
	show: function(){
		if (this.getState('hidden')){
			this.setState('hidden', false);
			this.windowManager.focus(this);
			this.fireEvent('display').fireEvent('show'); //display event for backwards compat
			if (!this.positioned) {
				if (this.parentWidget || $(document.body).hasChild($(this))) {
					this.position();
				}
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
		//if cascading is focused and the window manager doesn't want to do this positioning for us
		if (this.options.cascaded && !this.windowManager.positionNew(this, this.options)) {
			//if top/left options defined in options, put the window there
			if ($defined(this.options.top) && $defined(this.options.left)) {
				this.element.setStyles({
					top: this.options.top,
					left: this.options.left
				});
			} else {
				if (!this._drawn) {
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
		this._drawn = true;
		this.element.setStyle('display', this.getState('hidden') ? 'none' : 'block');
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
		this.setState('dragging', dragging, !render);
		this.fireEvent.delay(1, this, dragging ? 'shade' : 'unshade');
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
	setContent: function(content){
		if (document.id(content) || $type(content) == "array") this.element.adopt(content);
		else if ($type(content) == "string") this.element.set('html', content);
		return this;
	},

	//resize this instance to a given size
	resize: function(width, height){
		if (this.isDestroyed()) return;

		this.draw({'height': height, 'width': width});
		this.fireEvent('resize', [width, height]);
		if (this.shim) this.shim.position();
		return this;
	},

	_focusWindow: function(){
		this.windowManager.focus(this);
		return this;
	},

	destroy: function(){
		this.windowManager.unregister(this);
		if (this.options.useIframeShim && this.shim) this.shim.destroy();
		this.eject();
		(function(){
			this.element.destroy();
		}).delay(10, this);
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
	getOnScreen: function(offset){
		if (!offset) offset = {};
		var pos = this.element.getPosition();
		var size = this.element.getSize();
		var bottom = pos.y + size.y;
		var right = pos.x + size.x;
		var containerSize = document.id(window.getDocument()).getSize();
		if (bottom > containerSize.y) this.element.setStyle('top', containerSize.y - size.y + (offset.y || 0));
		if (right > containerSize.x) this.element.setStyle('left', containerSize.x - size.x + (offset.x || 0));
		return true;
	}

});

ART.Popup.DefaultManager = new ART.WindowManager();
