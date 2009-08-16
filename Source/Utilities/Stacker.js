Stacker = new Class({

	instances: [],
	
	zIndexBase: 0,

	intialize: function(zIndexBase) {
		if (zIndexBase) this.zIndexBase = zIndexBase;
	},

	register: function(instance){
		
		if (this.instances.contains(instance)) return;
		
		$(instance).addEvent('mousedown', function(){
			if (!instance.focused) this.focus(instance);
		}.bind(this));
		
		this.instances.push(instance);
	},
	
	cascade: function(noAnim, x, y, offsetx, offsety){
		offsetx = $pick(offsetx, 20);
		offsety = $pick(offsety, 10);
		this.instances.each(function(current, i){
			var styles = {top: (offsety * i) + y, left: (offsetx * i) + x};
			(noAnim) ? current.element.setStyles(styles) : current.morph.start(styles);
		});
	},
	
	unregister: function(instance){
		this.instances.erase(instance);
	},
	
	focus: function(instance){
		if (instance) this.instances.erase(instance).push(instance);
		
		this.instances.each(function(current, i){
			$(current).setStyle('z-index', this.zIndexBase + i);
			if (current === instance) current.focus();
			else current.blur();
		}, this);
	}
	
});
