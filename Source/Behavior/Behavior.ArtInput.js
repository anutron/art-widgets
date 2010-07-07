/*
---
description: Turns any input with the filter "ArtInput" into Art.Input elements Elements can optionaly specify a data-art-input-type value as either "Input" or "Search" - if none is defined "Input is used".
provides: [Behavior.ArtInput]
requires: [/Behavior, /ART.Input, /ART.Search]
script: Behavior.ArtInput.js
...
*/

Behavior.ArtInput = new Behavior.Filter('ArtInput', function(element, container){

	var temp = new Element('span').injectAfter(element);
	var type = element.get('data', 'art-input-type');
	//get the parent widget of the element, if any
	var parent = element.get('parentWidget');

	var widget = new ART[type ? type.capitalize() : 'Input']({
		inputElement: element,
		placeholder: null,
		onChange: function() {
			element.fireEvent('change');
		}
	});

	else widget.inject(temp, temp, 'after');

	this.mark(element, function(){
		widget.eject();
	});

	if (element.retrieve('OverText')) element.retrieve('OverText').reposition();
	widget.draw();
	temp.dispose();

}).global();
