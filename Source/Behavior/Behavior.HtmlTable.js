/*
---
description: Creates instances of HtmlTable for any table with the css class .ccs-data_table with additional options for sortability and selectability.
provides: [Behavior.HtmlTable]
requires: [/Behavior, More/HtmlTable.Sort, More/HtmlTable.Zebra, More/HtmlTable.Select, More/HtmlTable.Tree]
script: Behavior.HtmlTable.js
...
*/

Behavior.addGlobalFilters({

	HtmlTable: function(element, methods){
		//make all data tables sortable
		var firstSort;
		element.getElements('thead th').each(function(th, i){
			if (firstSort == null && !th.hasClass('noSort')) firstSort = i;
			if (th.hasClass('defaultSort')) firstSort = i;
		});
		var multiselectable = element.hasClass('multiselect');
		var table = new HtmlTable(element, {
			sortIndex: firstSort,
			sortable: element.hasClass('sortable') && !element.hasClass('treeview'),
			classNoSort: 'noSort',
			selectable: element.hasClass('selectable') || multiselectable,
			allowMultiSelect: multiselectable,
			useKeyboard: !element.hasClass('noKeyboard'),
			enableTree: element.hasClass('treeView'),
			build: element.hasClass('buildTree')
		});
		this.markForCleanup(table, function(){
			table.keyboard.relinquish();
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