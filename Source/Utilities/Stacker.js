/*
---
name: Stacker
description: A z-index manager for ART widgets.
requires: [Core/Class.Extras, Core/Element.Event, Core/Element.Style, More/Keyboard]
provides: Stacker
...
*/

/*
	Manages z-index ordering of objects as well as their focused state.
*/

var Stacker = new Class({

	Implements: [Options, Events],

	options: {
		//the base z-index for the first item in the stack; every other item is incrementally higher
		zIndexBase: 0,
		//when cascading, the offset to use
		offset: {
			x: 20,
			y: 10
		}
	},

	instances: [],

	initialize: function(options) {
		this.setOptions(options);
		this.layers = $H();
		this.setLayer('default');
	},

	/*
		sets / creates a layer and assigns it a zIndex
		zIndex defaults to the one in the options.
		a layer an object w/ a zIndex, name, and an array of the instance in that layer
	*/
	
	
	setLayer: function(name, zIndex) {
		zIndex = zIndex == undefined ? this.options.zIndexBase : zIndex;
		if (this.layers[name]) {
			this.layers[name].zIndex = zIndex;
		} else {
			this.layers[name] = {
				zIndex: zIndex,
				name: name,
				instances: []
			};
		}
		return this.getLayer(name);
	},

	//retrieves a layer given a name; will create it if not found
	//if passed a layer it returns it
	getLayer: function(layer, defaultZIndex) {
		if ($type(layer) == "string" && !this.layers[layer]) this.setLayer(layer, defaultZIndex);
		return this.layers[layer] || layer;
	},

	//registers an instance on a layer (registers it in the default layer if none specified)
	register: function(instance, layer){
		layer = layer || 'default';
		//if the instance was previously registered, move it to the new layer
		var registered = this.instances.contains(instance);
		if (registered && this.getLayerForInstance(instance)) {
			var instanceLayer = this.getLayerForInstance(instance);
			if (instanceLayer == layer) return;
			instanceLayer.instances.erase(instance);
		} else  {
			document.id(instance).addEvent('mousedown', function(){
				if (!instance.getState('focused')) this.focus(instance);
			}.bind(this));
			this.instances.include(instance);
		}
		if (!this.layers[layer]) this.getLayer(layer, this.options.zIndexBase);
		this.layers[layer].instances.include(instance);
	},

	//removes an instance from this stacker's control
	unregister: function(instance) {
		var refocus = this.focused == instance;
		var iLayer = this.getLayerForInstance(instance);
		if (!iLayer) return;
		this.instances.erase(instance);
		this.layers.each(function(layer) {
			if (layer.instances.contains(instance)) layer.instances.erase(instance);
		});
		if (refocus) {
			if (iLayer.instances.length) this.focus(iLayer.instances[iLayer.instances.length -1]);
			else if (this.instances.length) this.focus(this.instances[this.instances.length -1]);
		}
	},

	//retrieves the layer for a given instance
	getLayerForInstance: function(instance) {
		var ret;
		this.layers.each(function(layer) {
			if (layer.instances.contains(instance)) ret = layer;
		});
		return ret;
	},

	//z-index orders a layer so that a specific instance is on top
	bringToFront: function(instance){
		if (!instance || (instance == this.focused && instance._stacked)) return;
		this.layers.each(function(layer) {
			var i = 0;
			if (!layer.instances.contains(instance)) return;
			layer.instances.erase(instance).push(instance);
			this.stack(layer);
		}, this);
	},

	//assigns the zindex order for all the instances in a layer based on their order
	stack: function(layer) {
		layer.instances.each(function(win, i){
			document.id(win).setStyle('z-index', layer.zIndex + (i*2));
			win._stacked = true;
		}, this);
	},

	focusTop: function(layer) {
		layer = this.getLayer(layer || "default");
		var instance;

		for (var i = layer.instances.length - 1; i > 0; i = i-1) {
			if (document.id(layer.instances[i]).getStyle('display') != 'none') {
				instance = layer.instances[i];
				break;
			}
		}

		if (instance) this.focus(instance);
	},

	//cycles the zIndex for a given layer forward or back
	cycle: function(direction, layerName) {
		direction = direction || 'forward';
		var instances = this.layers[layerName].instances;
		if (!instances.length) return;
		if (direction == 'forward') instances.push(instances.shift());
		else instances.unshift(instances.pop());
		this.stack(this.layers[layerName]);
		this.focus(instances[instances.length -1], true);
	},

	//focus an instance, (optionally) bringing it to front
	focus: function(instance, noOrder){
		if (!instance || (instance == this.focused && instance._stacked && instance.getState('focused'))) return;
		if (this.focused && this.focused != instance) this.focused.blur();
		if (instance.getState('disabled')) return;
		if (!noOrder) this.bringToFront(instance);
		instance._focus();
		this.focused = instance;
	},

	//moves all the instances to be in a cascaded line
	cascade: function(layer, x, y){
		x = $pick(x, this.options.offset.x);
		y = $pick(y, this.options.offset.y);
		this.layers[layer].instances.each(function(current, i){
			var styles = {top: (y * i) + y, left: (x * i) + x};
			document.id(current).setStyles(styles);
		});
	},

	//positions new instances based on the current location of the focused instance
	positionNew: function(instance, options){
		var pos = true;
		//if there are no instances other than this one, or one instance
		//or the position is not set or is equal to the focused instances options
		//then return; and let the window be positioned as the class would normally.
		var current;
		var instances = this.getLayerForInstance(instance).instances.filter(function(instance){
			return !instance.getState('hidden') && document.id(instance);
		});
		instances.reverse().some(function(win){
			if (win != instance && document.id(win) && document.id(win).getStyle('display') != 'none') {
				current = win;
				return true;
			}
		});
		if (options) {
			//if the position is not defined in the options
			//or, if it is, the position is the same as the focused instance's options
			//such that opening with the same options will place them on top of each other
			//(assuming the first one hasn't moved)
			pos = ['top', 'left', 'edge', 'position', 'relativeTo'].every(function(opt){
				curOpt = current ? current.options[opt] : null;
				return curOpt == options[opt];
			}, this);
		}
		this.focus(instance);
		if (instances.length < 1 || !pos || !current) return false;
		var instanceEl = document.id(instance);
		//position near the focused instance, with an offset as defined in the options
                if(current instanceof ART.Popup && current.parentWidget) current = current.parentWidget;
		instanceEl.position({
			relativeTo: document.id(current),
			offset: this.options.offset,
			edge: 'upperLeft',
			position: 'upperLeft'
		});
		pos = instanceEl.getPosition();
		var size = instanceEl.getSize();
		var bottom = pos.y + size.y;
		var right = pos.x + size.x;
		var containerSize = document.id(document.body).getSize();
		if (bottom > containerSize.y || right > containerSize.x) {
		        if(instance.options.inject) {
                                instanceEl.position({
                                        relativeTo: instance.options.inject.target,
                                        offset: this.options.offset,
                                        edge: 'upperLeft',
                                        position: 'upperLeft'
                                });
                        }
		}
		
		return true;
	}
	
});
