/*
---
description: Converts any element with the ArtButton data-filter into an ART button widget.
provides: [Behavior.ArtButton]
requires: [/Behavior, /ART.Button, /Element.Data, More/String.Extras]
script: Behavior.ArtButton.js

...
*/

ART.Button.Icon = new Class({

	Extends: ART.Button,

	options: {
		//icon - the properties passed to the element constructor for the icon div
		icon: null
	},

	initialize: function(options){
		this.parent(options);
		if (this.options.icon) {
			this.iconDiv = new Element('div', this.options.icon);
			this.iconDiv.inject($(this));
		}
	}

});

Behavior.addGlobalFilters({

	ArtButtonBar: function(element){
		var position = element.get('data', 'bar-position');
		var above = position == "above";
		var below = position == "below";
		var buttons = element.getElements('[data-filters*=ArtButton]');
		buttons.each(function(button, i) {
			var first = (i == 0);
			var last = (i == buttons.length - 1);
			var margin = !first ? -1 : 0;
			button.store('_ArtButton:styles', {
				borderRadius: [
					first && !below ? 4 : 0, //top-left
					last && !below ? 4 : 0, //top-right
					last && !above ? 4 : 0, //bottom-right
					first && !above ? 4 : 0 //bottom-left
				],
				'buttonElementMargin': margin
			});
		});
	},

	/*
		By default, the button is just rendered as a button with text in it, but it is possible to have an icon image.
		
		To have an icon, style the element with a background image as normal and specify the padding to accomodate that image as normal.
		You must also specify at the very least a width and height in the data-icon-styles property, but you can, if you like, also specify
		other styles for the image, including top and left offsets (these default to 4px). Here's a simple example (it's not required that you
		style it inline).

			<a data-filter="ArtButton" href="http://google.com" style="background: url(google.png) left 50%; padding: 6px 6px 6px 20px; margin: 10px;" data-icon-styles="{'width': 14, 'height': 14}">Teh Googles!</a>
		
		When used with buttons, the button is replaced with a standard art-button (button's with inner text just render as buttons with 
		that text as the visible value, so we must replace it with a regular DOM element). The button input is hidden. When the art button
		is clicked, the click event is fired on the button so it still behaves the same way.
	*/
	ArtButton: function(button, events) {
		var pos = button.getStyle('position');
		if (pos != 'absolute' && button.getStyle('display') == 'inline') button.setStyle('display', 'inline-block');
		var text, element;
		var isAnchor = button.get('tag') == 'a';
		if (isAnchor) {
			text = button.get('html').stripTags();
			button.empty();
			element = button;
		} else {
			text = button.get('html').stripTags() || button.get('value') || button.get('name');
		}
		var buttonOptions = {
			element: element,
			text: text,
			styles: {},
			className: 'art ' + button.get('class')
		};
		var height = button.getStyle('height').toInt();
		if (height) buttonOptions.height = height;
		if (button.getStyle("background-image")) {
			buttonOptions.icon = {
				styles: $merge(
					{
						position: 'absolute', 
						top: 4,
						left: 4,
						backgroundRepeat: 'no-repeat'
					},
					button.getStyles('background-image', 'background-position'),
					button.get('data', 'icon-styles', true)
				)
			};
		}
		//converts valid css expressions for padding, margin, etc into arrays of integers
		var fixStyleString = function(str) {
			var style = str.split(' ');
			style[0] = style[0].toInt();
			for (var i = 1; i < 4; i++) {
				style[i] = (style[i] || style[(i-2).max(0)]).toInt();
			}
			return style;
		};

		var isInButtonBar;
		if (button.retrieve('_ArtButton:styles')) {
			isInButtonBar = true;
			$extend(buttonOptions.styles, button.retrieve('_ArtButton:styles'));
		}
		if (button.getStyle('padding') != "0px 0px 0px 0px") buttonOptions.styles.padding = button.getStyle('padding');
		if ($type(buttonOptions.styles.padding) == "string") {
			buttonOptions.styles.padding = fixStyleString(buttonOptions.styles.padding);
		}
		if (isAnchor) button.set('class', '');
		var b = new ART.Button.Icon(buttonOptions);
		this.markForCleanup(button, function(){
			b.eject();
		});
		if (button.retrieve('_ArtButton:styles')) {
			$(b).setStyle('margin-left', button.retrieve('_ArtButton:styles').buttonElementMargin);
		}
		

		$(b).setStyles({
			background: 'none',
			padding: 0,
			position: (pos == 'static') ? 'relative' : pos
		});
		if (isInButtonBar) $(b).setStyle('float', 'left');
		var parent = button.get('parentWidget');
		if (!isAnchor) {
			b.inject(parent || button, button, 'after');
			b.addEvent('press', function(){
				button.click();
			});
			button.setStyle('display', 'none');
		} else {
			if (parent) b.register(parent);
		}
		b.draw();
	}

});