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

	SplitView: function(element, behaviorAPI) {
		//get the left and right column and instantiate an ART.SplitView
		//if the container has the class "resizable" then make it so
		//ditto for the foldable option
		//if the left or right columns have explicit style="width: Xpx" assignments
		//resize the side to match that statement; if both have it, the right one wins
		var left = element.getChildren('.left_col')[0];
		var right = element.getChildren('.right_col')[0];
		var top = element.getChildren('.top_col')[0];
		var bottom = element.getChildren('.bottom_col')[0];
		var originalSize = element.getSize();
		if (!originalSize.x && element.getStyle('width') != "auto") originalSize.x = element.getStyle('width').toInt();
		if (!originalSize.y && element.getStyle('height') != "auto") originalSize.y = element.getStyle('height').toInt();
		if (!(left && right) && !(top && bottom)) {
			behaviorAPI.error('found split view element, but could not find top/botom or left/right; exiting');
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
		var splitter = element.getChildren('.splitter_col')[0];
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
		var splitviewContent = {
			resizable: element.hasClass("resizable"),
			foldable: element.hasClass("foldable"),
			splitterContent: element.getChildren('.splitter_col')[0],
			styles: styles,
			fixed: conf.fixed || 'left',
			element: element,
			parentWidget: parent
		};
		conf.sides.each(function(side) {
			splitviewContent[side + 'Content'] = conf.elements[side];
		});
		var splitview = new whichSplit(splitviewContent);
				splitview.register(parent);
		splitview.draw();

		addLinkers(document.id(splitview));

		var sized;
		conf.sides.each(function(side) {
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

		element.store('SplitView', splitview);
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
		splitview.element.getElements('[data-splitview-toggle]').each(function(toggle){
			manageToggleState(splitview, toggle);
		});
		splitview.getParentSize = function() {
				return splitview.element.getParent().getSize();
		};
		var resizeSplitview = function() {
				var size = splitview.getParentSize();
				splitview.resizer(size.x, size.y);
		};
		behaviorAPI.addEvents({
			show: resizeSplitview
		});
		var size = splitview.getParentSize();
		if (size.x || size.y) splitview.resizer(size.x, size.y);
		this.markForCleanup(element, function(){
						behaviorAPI.removeEvent('show',  resizeSplitview);
			splitview.eject();
		}.bind(this));
	}

});

Behavior.addGlobalPlugin('SplitView', 'ResizeOnContainingSplitView', function(element, methods) {
		if (element.hasClass('resizeOnContain')) {
				var localSplitview = element.retrieve('SplitView');
				var localSvElem = localSplitview.element;
				var containingSplitview = null;
				do {
				containingSplitview = localSvElem.getParent(":widget").get("widget");
				} while (containingSplitview && containingSplitview.name != "splitview");
				//Make sure you actually found a splitview.
				if (containingSplitview.name == "splitview") {
						var otherSide = null, thisSide = null;
						//Find opposite side...that being the side that the splitview is not in.
						var containingOrientation = containingSplitview.getOrientation();
						var containingSvSides = containingSplitview.getSides();
						var left = containingSvSides['left'];
						var right = containingSvSides['right'];
						if (left.hasChild(element)) {
								thisSide = left;
								otherSide = right;
						} else if (right.hasChild(element)) {
								//The check above isn't expressly necessary, but it seems like the safe thing to do.
								thisSide = right;
								otherSide = left;
						}
						var localSvSides = localSplitview.getSides();
						var splitviewLayoutChange = function() {
								localSplitview.resizer(localSplitview.getParentSize().x, localSplitview.getParentSize().y);
								methods.fireEvent('layoutChangeEnd');
						};
						containingSplitview.addEvent('resizeSide', splitviewLayoutChange);
						containingSplitview.addEvent('fold', splitviewLayoutChange);
						this.markForCleanup(element, function() {
								containingSplitview.removeEvent('resizeSide', splitviewLayoutChange);
								containingSplitview.removeEvent('fold', splitviewLayoutChange);
						});
				}
		}

});

var getWidget = function(link) {
	var splitview = link.getParent('[data-filters*=SplitView]');
	if (!splitview) return;
	return splitview.get('widget');
};

var getWidthStr = function(side) {
	return {
		'left': 'leftWidth',
		'right': 'rightWidth',
		'top':'topHeight',
		'bottom':'bottomHeight'
	}[side];
};

var manageToggleState = function(widget, toggle) {
	var params = toggle.get('data', 'splitview-toggle', true);
	if (widget[getWidthStr(params.side)] == 0) {
		toggle.getElements('.toggle-shown').hide();
		toggle.getElements('.toggle-hidden').show();
	} else {
		toggle.getElements('.toggle-shown').show();
		toggle.getElements('.toggle-hidden').hide();
	}
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
				manageToggleState(widget, link);
			});
		}
	});
};

})();

