/*
---
description: Creates a SplitView instances for all elements that have the css class .splitview (and children with .left_col and .right_col).
provides: [Behavior.SplitView]
requires: [Behavior/Behavior, Widgets/ART.SplitView, More/Element.Delegation]
script: Behavior.SplitView.js

...
*/

(function(){

Behavior.addGlobalFilters({

	SplitView: function(element, methods) {
		//get the left and right column and instantiate an ART.SplitView
		//if the container has the class "resizable" then make it so
		//ditto for the foldable option
		//if the left or right columns have explicit style="width: Xpx" assignments
		//resize the side to match that statement; if both have it, the right one wins
		var left = element.getElement('.left_col');
		var right = element.getElement('.right_col');
		var top = element.getElement('.top_col');
		var bottom = element.getElement('.bottom_col');
		var originalSize = element.getSize();
		if (!originalSize.x && element.getStyle('width') != "auto") originalSize.x = element.getStyle('width').toInt();
		if (!originalSize.y && element.getStyle('height') != "auto") originalSize.y = element.getStyle('height').toInt();

		if (!(left && right) && !(top && bottom)) {
			methods.error('found split view element, but could not find top/botom or left/right; exiting');
			return;
		}
		element.getParent().setStyle('overflow', 'hidden');
		var conf;
		if (left) {
			conf = {
				sides: ['left', 'right'],
				elements: {
					left: left,
					right: right
				},
				dimension: 'width'
			};
		} else {
			conf = {
				sides: ['top', 'bottom'],
				elements: {
					top: top,
					bottom: bottom
				},
				dimension: 'height'
			};
		}
		var inlineSize = {};
		conf.sides.each(function(side) {
			var size = conf.elements[side].style[conf.dimension];
			if (size) {
				inlineSize[side] = size.toInt();
				conf.fixed = side;
			}
			conf.elements[side].setStyle(conf.dimension, 'auto');
		});
		
		var styles = {}, splitterHidden;
		var splitter = element.getElement('.splitter_col');
		if (splitter) {
			if (splitter.getStyle('display', 'none')) {
				splitterHidden = true;
				splitter.setStyle('display', 'block');
			}
			if (left) styles['splitter-width'] = splitter.getSize().x;
			else styles['splitter-height'] = splitter.getSize().y;
		}
		
		var whichSplit = left ? ART.SplitView : ART.SplitView.Vertical;
		var parent = element.get('parentWidget');
		var splitview = new whichSplit({
			resizable: element.hasClass("resizable"),
			foldable: element.hasClass("foldable"),
			splitterContent: element.getElement('.splitter_col'),
			styles: styles,
			fixed: conf.fixed || 'left'
		}).inject(parent || element, element, 'after');
		splitview.draw();
		addLinkers(document.id(splitview));
		var sized;
		conf.sides.each(function(side) {
			splitview['set' + side.capitalize() + 'Content'](conf.elements[side]);
			splitview[side].addClass('save_scroll');
			if (sized) return;
			if (conf.elements[side].getStyle('display') == 'none') {
				splitview.fold(side, 0, splitterHidden, true);
				conf.elements[side].setStyle('display', 'block');
				sized = true;
			} else if (inlineSize[side] != null) {
				splitview['resize'+side.capitalize()](inlineSize[side]);
				sized = true;
			}
		});
		var classes = element.get('class').split(' ');
		var filters = element.getDataFilters();
		element.dispose().store('SplitView', splitview);
		classes.each(splitview.addClass, splitview);
		filters.each(splitview.element.addDataFilter, splitview.element);
		splitview.resizer = function(x, y){
			var offsets = {
				x: element.get('data', 'split-offset-x', true),
				y: element.get('data', 'split-offset-y', true)
			};
			if (offsets.x) x = x - offsets.x;
			if (offsets.y) y = y - offsets.y;
			if (x != undefined && y != undefined) {
				originalSize = {
					x: x,
					y: y
				};
				splitview.resize(x, y);
			} else {
				splitview.resizer.delay(1);
			}
		}.bind(this);
		methods.addEvents({
			resize: splitview.resizer,
			show: function(){
				var size = methods.getContainerSize();
				if (!size) size = originalSize;
				splitview.resizer(size.x, size.y);
			}
		});
		var size = methods.getContainerSize() || element.getSize();
		if (size.x || size.y) splitview.resizer(size.x, size.y);
		this.markForCleanup(element, function(){
			methods.removeEvent('resize', splitview.resizer);
			splitview.eject();
		}.bind(this));
	}

});

var getWidget = function(link) {
	var splitview = link.getParent('[data-filters*=SplitView]');
	if (!splitview) return;
	return splitview.get('widget');
};

var addLinkers = function(element){
	element.addEvents({
		'click:relay([data-splitview-resize])': function(e, link){
			if (document.id(e.target).get('tag') == 'a') e.preventDefault();
			var widget = getWidget(link);
			if (!widget) return;
			var resize = link.get('data', 'splitview-resize', true);
			if (!resize) return;
			var side;
			var sides = ['left', 'right', 'top', 'bottom'];
			for (key in resize) {
				if (sides.contains(key)) side = key;
			}
			widget.fold(side, resize[side], resize.hideSplitter).chain(function(){
				widget.fireEvent('postFold', [resize, e, link]);
			});
		},

		'click:relay([data-splitview-toggle])': function(e, link){
			if (document.id(e.target).get('tag') == 'a') e.preventDefault();
			var widget = getWidget(link);
			if (!widget) return;
			var resize = link.get('data', 'splitview-toggle', true);
			if (!resize) return;
			widget.toggle(resize.side, resize.hideSplitter).chain(function(){
				widget.fireEvent('postFold', [resize, e, link]);
                                if (widget[resize.side + "Height"] == 0) {
                                        link.getElements('.toggle-shown').hide();
                                        link.getElements('.toggle-hidden').show();
                                } else {
                                        link.getElements('.toggle-shown').show();
                                        link.getElements('.toggle-hidden').hide();
                                } 
			});
                }
	});
};

})();

