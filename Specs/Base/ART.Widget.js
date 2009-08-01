/*
Script: ART.Widget.js

License:
	MIT-style license.

Requires:
	@require 'jsspec'
	@require '../Assets/Scripts/mootools.js'
	@require '../../Source/Base/ART.js'
	@require '../../Source/Base/ART.Widget.js'
*/

var w;
var container;

describe('ART.Widget', {
	
	before_all : function(){
		container = new Element('div')
			.inject(document.body)
			.setStyles({
				position:'absolute'
				,bottom:'0px'
				,right:'0px'
				,zIndex:'9999'
				,backgroundColor:'#fff'
			})
		;
	}
	,before : function(){
		w = new ART.Widget();
	}
	,after : function(){
		container.empty();
		$(w).dispose();
		w = null;
	}
	
	,'should exist': function(){
		value_of(ART.Widget).should_not_be_undefined();
	}
	
	,'should implement toElement': function(){
		$(w).inject(container);
		value_of( container.contains($(w)) ).should_be_true();
	}
	
	,'should get ART.Sheet Selector': function(){
		ART.Widget.SubClass = new Class({
			Extends: ART.Widget,
			ns: 'mynamespace',
			name: 'mywidgetsubclass'
		});
		
		w = new ART.Widget.SubClass();
		value_of( w.getSelector() ).should_be( 'mywidgetsubclass' );
	}
	
	,'should set classname of root node': function(){
		ART.Widget.SubClass = new Class({
			Extends: ART.Widget,
			ns: 'mynamespace',
			name: 'mywidgetsubclass'
		});
		
		w = new ART.Widget.SubClass();
		value_of( $(w).hasClass('mynamespace') ).should_be_true();
		value_of( $(w).hasClass('mynamespace-mywidgetsubclass') ).should_be_true();
	}
	
});
