/*
---
description: Adds an instance of Form.Validator.Inline to any form with the class .form-validator.
provides: [Behavior.FormValidator]
requires: [/Behavior, More/Form.Validator.Inline]
script: Behavior.FormValidator.js

...
*/

Behavior.addGlobalFilters({

	//validates any form with the .form-validator class
	FormValidator: function(element, methods) {
		//instantiate the form validator
		var validator = element.retrieve('validator');
		if (!validator) {
			validator = new Form.Validator.Inline(element, {
				useTitles: true
			});
		}
		//stupid monkey patch, for now. TODO(nutron)
		validator.insertAdvice = function(advice, field){
			//look for a .ccs-errors advice element that is a sibling of the field and inject errors there
			var target = field.getParent().getElement('.ccs-errors');
			if (target) target.adopt(advice);
			//otherwise inject them as siblings.
			else field.getParent().adopt(advice);
		};
		validator.setOptions({
			onShow: function(input, advice, className) {
				//scroll to errors within the jframe
				/*JFrame Reference */
				this.jframe.scroller.toElement(input);
			}.bind(this),
			//not the window
			scrollToErrorsOnSubmit: false
		});
	}

});
