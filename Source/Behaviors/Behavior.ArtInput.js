/*
---
description: Turns any input with the filter "ArtInput" into Art.Input elements. Elements can optionaly specify a data-art-input-type value as either "Input" or "Search" - if none is defined "Input is used". This is a global filter
provides: [Behavior.ArtInput]
requires: [Behavior/Behavior, /ART.Input, /ART.Search, /ART.Check, /ART.Radio]
script: Behavior.ArtInput.js
...
*/

Behavior.addGlobalFilter('ArtInput', function(element){

	//inject a placeholder for the DOM work
	var temp = new Element('span').injectAfter(element);
	//get the input type as specified in the HTML, if any
	var type = element.get('data', 'art-input-type');
	//get the parent widget of the element, if any
	var parent = element.get('parentWidget');

	var menu = element.get('data', 'art-input-menu');
	if (menu) menu = element.getParent().getElement(menu);
	var styles = {};
	if (menu) styles.glyph = ART.Glyphs.searchArrow;

	//make a new instance of ART.Input or ART.Search (bad values will throw an error here)
	var widget = new ART[type ? type.capitalize() : 'Input']({
		//the input is the input element passed in.
		inputElement: element,
		//no placeholder; use the OverText filter if you want that
		placeholder: null,
		updatePlaceholderWithMenuValue: false,
		//when the ART.Input/Search instance fires its change event, pass it through to the input element
		onChange: function() {
			element.fireEvent('change');
		},
		styles: styles
	}, menu).addClass(element.get('class'));

	//inject our new widget into the DOM and the widget tree (if there is a parent widget)
	if (parent) widget.inject(parent, temp, 'after');
	else widget.inject(temp, temp, 'after');

	//when we clean things up, eject our widget from the widget tree
	this.markForCleanup(element, function(){
		widget.eject();
	});

	//draw the widget
	widget.draw();
	//if there's a pre-existing OverText instance, update its position
	if (element.hasDataFilter('OverText')) {
		(function(){
			var ot = element.retrieve('OverText');
			if (ot) {
				ot.reposition.delay(10, ot);
				if (menu) {
					widget.menu.addEvent('press', function(el){
						ot.text.set('html', el.get('text') || el.get('value'));
					});
				}
			}
		}).delay(10);
	}
	//remove our temporary placeholder
	temp.dispose();

});
