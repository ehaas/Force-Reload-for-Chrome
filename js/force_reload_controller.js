ForceReloadController = function() {
	xhr = new XMLHttpRequest();
	xhr.open('GET', chrome.extension.getURL('patterns.txt'), false);
	xhr.send(null);
	var response = xhr.responseText;
	if (response === '') {
		this.patterns = [];
		return;
	}
	this.patterns = response.split("\n").map(function(pattern) {
		return new RegExp(pattern);
	});
	chrome.experimental.webRequest.onBeforeSendHeaders.addListener(this.onBeforeSendHeaders.bind(this), {}, ['requestHeaders', 'blocking']);
};

ForceReloadController.prototype.onBeforeSendHeaders = function(details) {
	if (this.patterns.some(function(pattern) { return details.url.match(pattern); })) {
		var newHeaders = details.requestHeaders.filter(function(header) {
			return header.name !== 'Pragma' && header.name !== 'Cache-Control' && header.name !== 'If-Modified-Since' && header.name !== 'If-Unmodified-Since';
		});
		newHeaders.push({"name":"Cache-Control","value":"no-cache"});
		newHeaders.push({"name":"Pragma","value":"no-cache"});
		return {requestHeaders: newHeaders};
	}
};

