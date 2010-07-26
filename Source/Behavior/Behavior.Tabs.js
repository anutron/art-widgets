/*
---
description: Adds a tab interface (TabSwapper instance) for elements with .css-tab_ui. Matched with tab elements that are .ccs-tabs and sections that are .ccs-tab_sections.
provides: [Behavior.Tabs]
requires: [/Behavior, clientcide/TabSwapper]
script: Behavior.Tabs.js

...
*/

Behavior.addGlobalFilters({

	Tabs: function(element, methods) {
		var tabGroup = element;
		var tabs = tabGroup.getElements('.tabs>li');
		var sections = tabGroup.getElements('.tab_sections>li');
		if (tabs.length != sections.length) {
			methods.error('warning; sections and sections are not of equal number. tabs: %o, sections: %o', tabs, sections);
			return;
		}
		var ts = new TabSwapper({
			tabs: tabs,
			sections: sections,
			smooth: true,
			smoothSize: true
		});
		tabGroup.store('TabSwapper', ts);
	}

});
