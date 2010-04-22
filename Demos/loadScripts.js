var loadViaDepender = (function(){
		var uriRegex = /^(?:(\w+):)?(?:\/\/(?:(?:([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?)?(\.\.?$|(?:[^?#\/]*\/)*)([^?#]*)(?:\?([^#]*))?(?:#(.*))?/;
		var parts = ['scheme', 'user', 'password', 'host', 'port', 'directory', 'file', 'query', 'fragment'];
		var parsed = window.location.href.match(uriRegex);
		var location = {};
		for (var i = 0; i < parts.length; i++) {
			location[parts[i]] = parsed[i+1];
		}
		return function(script, host) {
			host = host || location.host || "localhost";
			document.write('<scri' + 'pt src="http://' + host + ':8000/depender/build?' + script + '"></scri' + 'pt>');
		};
	})();