/*
---
name: UI.Sheet
description: StyleSheet cascading emulator
author: Jan Kassens
requires: [UI, Core/Array, Core/String, Slick/Slick.Parser]
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
	var style = {};
	where.sort(function(a, b){
		return a.specificity - b.specificity;
	});

	selector = parseSelector(Slick.parse(selector).expressions[0]);
	where.each(function(rule){
		var i = rule.selector.length - 1, j = selector.length - 1;
		if (!containsAll(selector[j], rule.selector[i])) return;
		while (i-- > 0){
			while (true){
				if (j-- <= 0) return;
				if (containsAll(selector[j], rule.selector[i])) break;
			}
		}
		$mixin(style, rule.style);
	});
	return style;
};

var containsAll = function(self, other){
	return other.every(function(x){
		return self.contains(x);
	}, this);
};

//returns the rules for a given namespace
var getRules = function(namespace){
	if (!namespace) namespace = "default";
	rules[namespace] = rules[namespace] || [];
	return rules[namespace];
};

//defines rules for a given selector
//takes an object for ART.Sheet "styles" - arbitrary key/value pairs used by widgets
//namespace (string) is optional; allows for the use of ART.Sheet with arbitrary style groups
Sheet.define = function(selectors, style, namespace){
	createRules(selectors, style, getRules(namespace));
	return this;
};

//returns the "style" object for a given selector
Sheet.lookup = function(selector, namespace){
	return getStyles(selector, getRules(namespace));
};

})();
