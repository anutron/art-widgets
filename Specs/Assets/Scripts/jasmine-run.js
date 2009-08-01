window.onload = function(){
	var jasmineEnv = jasmine.getEnv();
	jasmineEnv.reporter = new jasmine.TrivialReporter();
	jasmineEnv.execute();
};
