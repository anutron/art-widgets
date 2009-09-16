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
		this.addLayer('default', this.options.zIndexBase);
	},

	addLayer: function(name, zIndex) {
		this.layers[name] = {
			zIndex: zIndex,
			name: name,
			instances: []
		};
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
				if (!instance.focused) this.focus(instance);
			}.bind(this));
			this.instances.push(instance);
		}
		this.layers[layer].instances.push(instance);
		if (instance.focused) this.focus(instance);
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

	focus: function(instance){
		if (instance) this.instances.erase(instance).push(instance);
		this.layers.each(function(layer) {
			var i = 0;
			if (!layer.instances.contains(instance)) return;
			layer.instances.erase(instance).push(instance);
			layer.instances.each(function(current){
				$(current).setStyle('z-index', layer.zIndex + i);
				if (current === instance) current.focus(true);
				i++;
			}, this);
		}, this);
		if (this.focused && this.focused != instance) this.focused.blur();
		this.focused = instance;
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
		if (options) {
			pos = ['top', 'left', 'edge', 'position', 'offset', 'relativeTo'].every(function(opt){
				return options[opt] == null || (this.focused.options[opt] == options[opt]);
			}, this);
		}
		var instances = this.instances.filter(function(instance){
			return !instance.hidden;
		});
		if (instances.length < 2 || !pos) return false;
		var focused = this.focused;
		this.focus(instance);
		$(instance).position({
			relativeTo: $(focused),
			offset: this.options.offset,
			edge: 'upperLeft',
			position: 'upperLeft'
		});
		return true;
	}
	
});
