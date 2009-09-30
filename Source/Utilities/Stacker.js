var Stacker = new Class({

	Implements: [Options, Events],

	options: {
		zIndexBase: 0,
		offset: {
			x: 20,
			y: 10
		}
	},

	instances: [],

	initialize: function(options) {
		this.setOptions(options);
		this.layers = $H();
		this.setLayer('default', this.options.zIndexBase);
	},

	setLayer: function(name, zIndex) {
		if (this.layers[name]) {
			this.setZIndex(zIndex, name);
			return this.getLayer(name);
		}
		this.layers[name] = {
			zIndex: zIndex,
			name: name,
			instances: []
		};
	},

	getLayer: function(name, defaultZIndex) {
		if (!this.layers[name] && defaultZIndex) this.addLayer(name, defaultZIndex);
		return this.layers[name];
	},

	register: function(instance, layer){
		layer = layer || 'default';
		var registered = this.instances.contains(instance);
		if (registered) {
			var instanceLayer = this.getLayerForInstance(instance);
			if (instanceLayer == layer) return;
			instanceLayer.instances.erase(instance);
		} else  {
			$(instance).addEvent('mousedown', function(){
				if (instance.disabled) this.enable(instance);
			}.bind(this));
			this.instances.push(instance);
		}
		this.layers[layer].instances.push(instance);
	},

	unregister: function(instance) {
		this.instances.erase(instance);
		this.layers.each(function(layer) {
			if (layer.instances.contains(instance)) layer.instances.erase(instance);
		});
	},

	getLayerForInstance: function(instance) {
		var ret;
		this.layers.each(function(layer) {
			if (layer.instances.contains(instance)) ret = layer;
		});
		return ret;
	},

	enable: function(instance){
		if (!instance) return;
		this.instances.erase(instance).push(instance);
		this.layers.each(function(layer) {
			var i = 0;
			if (!layer.instances.contains(instance)) return;
			layer.instances.erase(instance).push(instance);
			layer.instances.each(function(current){
				$(current).setStyle('z-index', layer.zIndex + i);
				if (current === instance) current.enable(true);
				i++;
			}, this);
		}, this);
		if (this.enabled && this.enabled != instance) this.enabled.disable();
		this.enabled = instance;
	},

	cascade: function(noAnim, x, y){
		x = $pick(x, this.options.offset.x);
		y = $pick(y, this.options.offset.y);
		this.instances.each(function(current, i){
			var styles = {top: (y * i) + y, left: (x * i) + x};
			(noAnim || !current.morph) ? $(current).setStyles(styles) : current.morph.start(styles);
		});
	},

	positionNew: function(instance, options){
		var pos = true;
		//if there are no instances other than this one, or one instance
		//or the position is not set or is equal to the enabled instances options
		//then return; and let the window be positioned as the class would normally.
		var current;
		var instances = this.instances.filter(function(instance){
			return !instance.hidden && $(instance);
		});
		instances.reverse().some(function(win){
			if (win != instance && $(win)) {
				current = win;
				return true;
			}
		});
		if (options) {
			//if the position is not defined in the options
			//or, if it is, the position is the same as the enabled instance's options
			//such that opening with the same options will place them on top of each other
			//(assuming the first one hasn't moved)
			pos = ['top', 'left', 'edge', 'position', 'relativeTo'].every(function(opt){
				curOpt = current ? current.options[opt] : null;
				return curOpt == options[opt];
			}, this);
		}
		if (instances.length < 2 || !pos || !current) return false;
		this.enable(instance);
		//position near the enabled instance, with an offset as defined in the options
		$(instance).position({
			relativeTo: $(current),
			offset: this.options.offset,
			edge: 'upperLeft',
			position: 'upperLeft'
		});
		instance.getOnScreen();
	}
	
});
