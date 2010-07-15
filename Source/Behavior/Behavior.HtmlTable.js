// regarding copyright ownership.  Cloudera, Inc. licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/*
---
description: Creates instances of HtmlTable for any table with the css class .ccs-data_table with additional options for sortability and selectability.
provides: [Behavior.HtmlTable]
requires: [/Behavior, More/HtmlTable.Sort, More/HtmlTable.Zebra, More/HtmlTable.Select]
script: Behavior.HtmlTable.js
...
*/

//The newHash here is used to attach these parsers at the beginning of the HtmlTable.Parsers hash.  Otherwise, anything that begins with a number is picked up by the 'number' parser, which is not what we want.
/*newHash = new Hash();
//A parser to allow numeric sorting by any value.
newHash.dataSortValue = {
        match: /data-sort-value/,
        convert: function() {
                text = this.getElement('[data-sort-value]').get('data', 'sort-value');
                return text.toInt();
        },
        number: true
};
//A parser to allow lexicographical sorting by any string.
newHash.dataSortString = {
        match: /data-sort-string/,
        convert: function() {
                text = this.getElement('[data-sort-string]').get('data', 'sort-string');
                return text;
        },
        number: false 
};
newHash.combine(HtmlTable.Parsers);
HtmlTable.Parsers = newHash;*/

Behavior.addGlobalFilters({
	HtmlTable: function(element, events){
		//make all data tables sortable
                var table = element;
		var selectable;
                var isSelectable = (table.hasClass('sortable') && !table.hasClass('noSelect')) || table.hasClass('selectable');
                var ht = new HtmlTable(table, {
                        sortable: table.hasClass('sortable'),
                        selectable: isSelectable,
                        allowMultiSelect: table.hasClass('allowMultiSelect'),
                        useKeyboard: false
                });
                if (isSelectable && !selectable) selectable = ht;
		//Will not work without reference to JFrame
                /*if (selectable) {
			this.addShortcuts({
				'Select Previous Row': {
					keys: 'up',
					shortcut: 'up arrow',
					handler: function(e){
						e.preventDefault();
						selectable.shiftFocus(-1);
						if (selectable.hover) selectable.focusRow(selectable.hover);
					}.bind(this),
					description: 'Select the previous row in the table.'
				},
				'Select Next Row': {
					keys: 'down',
					shortcut: 'down arrow',
					handler: function(e){
						e.preventDefault();
						selectable.shiftFocus(1);
						if (selectable.hover) selectable.focusRow(selectable.hover);
					}.bind(this),
					description: 'Select the next row in the table.'
				}
			});
			this.markForCleanup(function(){
				this.removeShortcuts(['Select Previous Row', 'Select Next Row']);
			}.bind(this));
		}*/
	}

});

