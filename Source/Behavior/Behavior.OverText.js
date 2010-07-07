/*
---
description: Sets up all inputs with the css class .overtext to have an OverText instance for inline labeling. This is a global filter
provides: [Behavior.OverText]
requires: [/Behavior, More/OverText]
script: Behavior.OverText.js
...
*/

Behavior.OverText = new Behavior.Filter('OverText', function(element, container){
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

	this.markForCleanup(element, function(){
		container.removeEvent('show', updater);
		ot.destroy();
	});

}).global();
