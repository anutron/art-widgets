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
	
	attach: function(element, container, meta){
		//create the overtext instance
		var ot = new OverText(element);
		//this method updates the text position with a slight delay
		var updater = function(){
			(function(){
				ot.reposition();
			}).delay(10);
		};
		//update the position whenever the behavior container is shown
		container.addEvent('show', updater);
		this.mark(element, function(){
			container.removeEvent('show', updater);
			ot.destroy();
		});
	}

}).global();
