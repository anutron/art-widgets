/*
---
name: ART.Search
description: Base Search Class
requires: [ART.Sheet, ART.Input, ART.Glyphs, ART.Menu]
provides: ART.Search
...
*/

(function(){

ART.Sheet.define('search.art', $merge(ART.Sheet.lookup('input.art'), {
	'padding': [2, 12, 2, 22],
	'pill': true,
	'glyph': ART.Glyphs.search,
	'glyph-color': 'hsb(0, 0, 0, 0.7)',
	'glyph-top': 5,
	'glyph-left': 6
}));

ART.Sheet.define('search.art:focused', {
	'border-color': ['hsb(205, 80, 100)', 'hsb(205, 100, 95)']
});

var Search = ART.Search = new Class({
	
	Extends: ART.Input,
	
	name: 'search',
	
	options: {
		placeholder: 'search…',
		updatePlaceholderWithMenuValue: true,
		menu: false
	},
	
	initialize: function(options, menu){
		this.parent(options);
		
		if (this.options.menu) menu = this.options.menu;

		if (menu){
			
			var self = this, sheet = this.getSheet();
			
			this.menuHandler = new Element('div').setStyles({
				height: 22, width: 22, position: 'absolute', top: 1, left: 1, background: 'red'
			}).inject(this.element).set('opacity', 0, true);

			this.menu = new ART.Menu({
				tabIndex: this.options.tabIndex,
				left: function(){
					return self.element.offsetLeft;
				}, top: function(){
					return self.element.offsetTop + sheet.height + 3;
				}}, menu, this.menuHandler);
			
			if (this.options.updatePlaceholderWithMenuValue){
				this.menu.addEvent('press', function(element){
					self.updatePlaceholder(element.get('value') || element.get('text'));
				});
			}
			
		}
	},
	
	inject: function(wi, el, wh){
		this.parent(wi, el, wh);
		if (this.menu && this.element.parentNode) this.menu.inject(this, this.element.parentNode);
		return this;
	}
	
});

})();
