// Copyright (c) 2010, Cloudera, inc. All rights reserved.
/*
---
description: Sets up all inputs with the css class .overtext to have an OverText instance for inline labeling.
provides: [Behavior.OverText]
requires: [/Behavior, More/OverText]
script: Behavior.OverText.js
...
*/

Behavior.OverText = new Behavior.Filter({

	name: 'overtext',

	selector: 'input[data-filter=overtext], textarea[data-filter=overtext]',

	stringMatch: 'overtext',
	
	attach: function(element, meta){
		var ot = new OverText(element);
		var updater = function(){
			(function(){
				ot.reposition();
			}).delay(10);
		};
		element.addEvent('show', updater);
		this.mark(element, function(){
			element.removeEvent('show', updater);
			ot.destroy();
		});
	}

}).global();
