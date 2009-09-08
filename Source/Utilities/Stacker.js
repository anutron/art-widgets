var Stacker = new Class({

	Implements: [Options, Events],

	options: {
		zIndexBase: 0,
		offset: {
			x: 20,
			y: 10
		}
	},

	initialize: function(options) {
		this.setOptions(options);
		this.instances = [];
	},

	register: function(instance){
		if (this.instances.contains(instance)) return;
		
		$(instance).addEvent('mousedown', function(){
			if (!instance.focused) this.focus(instance);
		}.bind(this));
		
		this.instances.push(instance);
	},
	
	cascade: function(noAnim, x, y){
		x = $pick(x, this.options.offset.x);
		y = $pick(y, this.options.offset.y);
		this.instances.each(function(current, i){
			var styles = {top: (y * i) + y, left: (x * i) + x};
			(noAnim || !current.morph) ? $(current).setStyles(styles) : current.morph.start(styles);
		});
	},
	
	unregister: function(instance){
		this.instances.erase(instance);
	},
	
	focus: function(instance){
		if (instance) this.instances.erase(instance).push(instance);
		this.instances.each(function(current, i){
			$(current).setStyle('z-index', this.options.zIndexBase + i);
			if (current === instance) current.focus(true);
			else current.blur();
		}, this);
		this.focused = instance;
	},

	positionNew: function(instance, options){
		if (options) {
			var pos = ['top', 'left', 'edge', 'position', 'offset', 'relativeTo'].every(function(opt){
				return options[opt] == null || (this.focused.options[opt] == options[opt]);
			}, this);
		}
		if (this.instances.length < 2 || !pos) return false;
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
