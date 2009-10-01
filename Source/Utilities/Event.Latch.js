(function(){

	Events = Class.refactor(Events, {

		latched: {},
	
		getLatch: function(type) {
			if (!this.latched[type]) this.latched[type] = { enabled: false };
			return this.latched[type];
		},

		addEvent: function(type, fn, internal){
			type = Events.removeOn(type);
			var latched = type.contains(':latch');
			type = type.replace(':latch', '');
			if (latched || this.getLatch(type)) {
				this.getLatch(type).enabled = true;
				if (this.latched[type].args) fn.create({'bind': this, 'delay': 10, 'arguments': this.latched[type].args})();
			}
			return this.previous(type, fn, internal);
		},

		fireEvent: function(type, args, delay){
			type = Events.removeOn(type);
			this.getLatch(type).args = args;
			return this.previous(type, args, delay);
		},

		latchEvents: function(type) {
			type = Events.removeOn(type);
			this.getLatch(type).enabled = true;
		}

	});


	var oldAddEvent = Element.prototype.addEvent,
		oldRemoveEvent = Element.prototype.removeEvent;
	
	var getLatch = function(element, type) {
		var latches = element.retrieve('event:latches', {});
		if (!latches[type]) latches[type] = { enabled: false };
		return latches[type];
	};
	var elementLatches = {};
	Element.implement({

		addEvent: function(type, fn){
			type = Events.removeOn(type);
			if (type.contains(':latch') || elementLatches[type]) {
				type = type.replace(':latch');
				var latch = getLatch(this, type);
				latch.enabled = true;
				if (latch.args) fn.create({'bind': this, 'delay': delay, 'arguments': args})();
			}
			return oldAddEvent.call(this, type, fn);
		},

		fireEvent: function(type, args, delay, bind){
			type = Events.removeOn(type);
			getLatch(this, type).args = args;
			return oldRemoveEvent.call(this, type, args, delay, bind);
		},

		latchEvents: function(type) {
			type = Events.removeOn(type);
			elementLatches[type] = true;
		}

	});


})();

