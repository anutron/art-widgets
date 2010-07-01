/*
---
description: Turns any input with the filter "ArtInput" into Art.Input elements Elements can optionaly specify a data-art-input-type value as either "Input" or "Search" - if none is defined "Input is used".
provides: [Behavior.ArtInput]
requires: [/Behavior, /ART.Input, /ART.Search]
script: Behavior.ArtInput.js
...
*/

Behavior.ArtInput = new Behavior.Filter({

	name: 'ArtInput',
	
	attach: function(element, container){
		var parent = element.getParent(':widget');
		var temp = new Element('span').injectAfter(element);
		var beforeStyles = element.style.cssText;
		var type = element.get('data', 'art-input-type');
		var widget = new ART[type ? type.capitalize() : 'Input']({
			inputElement: element,
			placeholder: null,
			onChange: function() {
				element.fireEvent('change');
			}
		});
		if (parent) widget.inject(parent.get('widget'), temp, 'after');
		else widget.inject(temp, temp, 'after');
		this.mark(element, function(){
			widget.eject();
		});
		if (element.retrieve('OverText')) element.retrieve('OverText').reposition();
		widget.draw();
		temp.dispose();
	}

}).global();
