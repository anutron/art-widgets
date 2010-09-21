/*
---
name: UI.Sheet
description: StyleSheet cascading emulator
author: Jan Kassens
requires: [UI, Core/Array, Core/String, Core/Slick.Parser]
provides: UI.Sheet
...
*/

(function(){

var Sheet = UI.Sheet = {};

var rules = {};

//parses a given selector into an array
var parseSelector = function(selector){
	return selector.map(function(chunk){
		var result = [];
		if (chunk.id){
			result.push('#' + chunk.id);
		}
		if (chunk.tag && chunk.tag != '*'){
			result.push(chunk.tag);
		}
		if (chunk.pseudos) chunk.pseudos.each(function(pseudo){
			result.push(':' + pseudo.key);
		});
		if (chunk.classes) chunk.classes.each(function(klass){
			result.push('.' + klass);
		});
		return result;
	});
};

//computes specificity in the same manner that css rules do for a given selector
//see http://www.w3.org/TR/CSS21/cascade.html#specificity
var getSpecificity = function(selector){
	specificity = 0;
	selector.each(function(chunk){
		if (chunk.id) specificity += 10000;
		if (chunk.tag && chunk.tag != '*') specificity++;
		specificity += (chunk.pseudos || []).length;
		specificity += (chunk.classes || []).length * 100;
	});
	return specificity;
};

//defines the objects (sytle rules) for a given set of selectors
//and pushes them into an array passed in (the 'where' argument)
var createRules = function(selectors, style, where){
	Slick.parse(selectors).expressions.each(function(selector){
		var rule = {
			'specificity': getSpecificity(selector),
			'selector': parseSelector(selector),
			'style': {}
		};
		for (var p in style) rule.style[p.camelCase()] = style[p];
		where.push(rule);
	});
};

//retrieves styles for a given selector, merging them into a single
//object given an array of rules (the 'where' argument)
var getStyles = function(selector, where) {
	var cachedStyle = where.selectorCacheGet(selector);
	if (cachedStyle) return cachedStyle;
	
	var style = {};
	where.sort(function(a, b){
		return a.specificity - b.specificity;
	});

	selectorArray = parseSelector(Slick.parse(selector).expressions[0]);
	where.each(function(rule){
		var i = rule.selector.length - 1, j = selectorArray.length - 1;
		if (!containsAll(selectorArray[j], rule.selector[i])) return;
		while (i-- > 0){
			while (true){
				if (j-- <= 0) return;
				if (containsAll(selectorArray[j], rule.selector[i])) break;
			}
		}
		$mixin(style, rule.style);
	});
	//for IE, handle the Color bug that requires the object be a native String
	if (Browser.Engine.trident) {
		var fixColorForIE = function(prop) {
			if (prop && prop.isColor) return prop.toRGB();
			if ($type(prop) == "array") return prop.map(fixColorForIE);
			return prop;
		};
		for (prop in style) style[prop] = fixColorForIE(style[prop]);
	}
	where.selectorCacheSet(selector, style);
	return style;
};
var containsAll = function(self, other){
	var keys = {};
	for(var i=0, l=self.length; i<l; i++){
		keys['__' + self[i]] = true;
	};
	for(i=0, l=other.length; i<l; i++){
		if (keys['__' + other[i]] == null) return false;
	}
	return true;
};
//returns the rules for a given namespace
var getRules = function(namespace){
	if (!namespace) namespace = "default";
	if (!rules[namespace]) {
		rules[namespace] = [];
		$extend(rules[namespace], {
			selectorCacheData: {},
			selectorCacheInvalidate: function(){
				this.selectorCacheData = {};
			},
			selectorCacheSet: function(selector, value){
				this.selectorCacheData[selector] = $unlink(value);
			},
			selectorCacheGet: function(selector){
				var val = this.selectorCacheData[selector]; 
				return $unlink(val);
			}
		});
	}
	return rules[namespace];
};

//defines rules for a given selector
//takes an object for ART.Sheet "styles" - arbitrary key/value pairs used by widgets
//namespace (string) is optional; allows for the use of ART.Sheet with arbitrary style groups
Sheet.define = function(selectors, style, namespace){
	var where = getRules(namespace);
	where.selectorCacheInvalidate();
	createRules(selectors, style, where);
	return this;
};

//returns the "style" object for a given selector
Sheet.lookup = function(selector, namespace){
	return getStyles(selector, getRules(namespace));
};

})();
