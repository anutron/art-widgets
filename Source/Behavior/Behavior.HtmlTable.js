/*
---
description: Creates instances of HtmlTable for any table with the css class .ccs-data_table with additional options for sortability and selectability.
provides: [Behavior.HtmlTable]
requires: [/Behavior, More/HtmlTable.Sort, More/HtmlTable.Zebra, More/HtmlTable.Select]
script: Behavior.HtmlTable.js
...
*/

Behavior.addGlobalFilters({

	HtmlTable: function(element, methods){
		//make all data tables sortable
		var selectable;
		var isSelectable = (element.hasClass('sortable') && !element.hasClass('noSelect')) || element.hasClass('selectable');
		var firstSort;
		element.getElements('thead th').each(function(th, i){
			if (firstSort == null && !th.hasClass('noSort')) firstSort = i;
			if (th.hasClass('defaultSort')) firstSort = i;
		});
		new HtmlTable(element, {
			sortIndex: firstSort,
			sortable: element.hasClass('sortable'),
			classNoSort: 'noSort',
			selectable: isSelectable,
			allowMultiSelect: element.hasClass('multiselect'),
			useKeyboard: !element.hasClass('noKeyboard')
		});
	}

});

HtmlTable.defineParsers({
	//A parser to allow numeric sorting by any value.
	dataSortNumeric: {
		match: /data-sort-numeric/,
		convert: function() {
			return this.getElement('[data-sort-numeric]').get('data', 'sort-numeric').toInt();
		},
		number: true
	},
	//A parser to allow lexicographical sorting by any string.
	dataSortString: {
		match: /data-sort-string/,
		convert: function() {
			return this.getElement('[data-sort-string]').get('data', 'sort-string');
		},
		number: false 
	}
});