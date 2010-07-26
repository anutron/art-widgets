/*
---
description: Creates a SplitView instances for all elements that have the css class .splitview (and children with .left_col and .right_col).
provides: [Behavior.SplitView]
requires: [/Behavior, Widgets/ART.SplitView]
script: Behavior.SplitView.js

...
*/

Behavior.addGlobalFilters({

	SplitView: function(splitview, methods) {
		//for all div.splitview containers, get their left and right column and instantiate an ART.SplitView
		//if the container has the class "resizable" then make it so
		//ditto for the foldable option
		//if the left or right columns have explicit style="width: Xpx" assignments
		//resize the side to match that statement; if both have it, the right one wins
		var left = splitview.getElement('.left_col');
		var right = splitview.getElement('.right_col');
		var top = splitview.getElement('.top_col');
		var bottom = splitview.getElement('.bottom_col');
		if (!(left && right) && !(top && bottom)) {
			methods.error('found split view element, but could not find top/botom or left/right; exiting');
			return;
		}
		splitview.getParent().setStyle('overflow', 'hidden');
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
			if (size) inlineSize[side] = size.toInt();
			conf.elements[side].setStyle(conf.dimension, 'auto');
		});
		
		var styles = {}, splitterHidden;
		var splitter = splitview.getElement('.splitter_col');
		if (splitter) {
			if (splitter.getStyle('display', 'none')) {
				splitterHidden = true;
				splitter.setStyle('display', 'block');
			}
			if (left) styles['splitter-width'] = splitter.getSize().x;
			else styles['splitter-height'] = splitter.getSize().y;
		}
		
		var whichSplit = left ? ART.SplitView : ART.SplitView.Vertical;
		var parent = splitview.get('parentWidget');
		var split = new whichSplit({
			resizable: splitview.hasClass("resizable"),
			foldable: splitview.hasClass("foldable"),
			splitterContent: splitview.getElement('.splitter_col'),
			styles: styles
		}).inject(parent || splitview, splitview, 'after').draw();
		var sized;
		conf.sides.each(function(side) {
			split['set' + side.capitalize() + 'Content'](conf.elements[side]);
			split[side].addClass('save_scroll');
			if (sized) return;
			if (conf.elements[side].getStyle('display') == 'none') {
				split.fold(side, 0, splitterHidden, true);
				conf.elements[side].setStyle('display', 'block');
				sized = true;
			} else if (inlineSize[side]) {
				split['resize'+side.capitalize()](inlineSize[side]);
				sized = true;
			}
		});
		var classes = splitview.get('class').split(' ');
		var filters = splitview.getDataFilters();
		splitview.destroy();
		classes.each(split.addClass, split);
		filters.each(split.element.addDataFilter, split.element);
		split.resizer = function(x, y){
				var offsets = {
					x: splitview.get('data', 'split-offset-x', true),
					y: splitview.get('data', 'split-offset-y', true)
				};
				var w = x;
				var h = y;
				if (offsets.x) w = w - offsets.x;
				if (offsets.y) h = h - offsets.y;
				if (w != undefined && h != undefined) split.resize(w, h);
				else split.resizer.delay(1);
		}.bind(this);
		methods.addEvents({
			resize: split.resizer,
			show: split.resizer
		});
		var size = methods.getCurrentSize();
		split.resizer(size.x, size.y);
		this.markForCleanup(splitview, function(){
			splitviews.each(function(splitview) {
				methods.removeEvent('resize', splitview.resizer);
				splitview.eject();
			}, this);
		}.bind(this));
	}

});