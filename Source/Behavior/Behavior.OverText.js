// Copyright (c) 2010, Cloudera, inc. All rights reserved.
/*
---
description: Sets up all inputs with the css class .overtext to have an OverText instance for inline labeling.
provides: [Behavior.OverText]
requires: [/Behavior, More/OverText]
script: Behavior.OverText.js
...
*/

Behavior.registerGlobal('OverText', {

	run: function(container, manager, meta){
		if (!container.hasClass('overtext') && !container.get('html').contains('overtext')) return;
		var inputs = container.getElements('input.overtext, textarea.overtext');
		if (!inputs.length) return;
		// make an OverText for elements returned by the test.
		var ots = inputs.map(function(input){
			return new OverText(input);
		});
		var updater = function(){
			(function(){
				ots.each(function(ot) {
					ot.reposition();
				});
			}).delay(10);
		};
		manager.addEvent('show', updater);
		manager.mark(function(){
			manager.removeEvent('show', updater);
			ots.each(function(ot) { ot.destroy(); });
		});
	}

});