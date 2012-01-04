(function ($) {
	jQuery.fn.html5_uploader = function () {
		
		this.each(function () {
			this.addEventListener("dragenter", function (evt) {
				evt.stopPropagation();
				evt.preventDefault();
				$(this).triggerHandler('html5_uploader.dragenter');
			}, false);
			
			this.addEventListener("dragexit", function (evt) {
				evt.stopPropagation();
				evt.preventDefault();
				$(this).triggerHandler('html5_uploader.dragexit');
			}, false);
			
			this.addEventListener("dragover", function (evt) {
				evt.stopPropagation();
				evt.preventDefault();
				$(this).triggerHandler('html5_uploader.dragover');
			}, false);
			
			this.addEventListener("dragleave", function (evt) {
				evt.stopPropagation();
				evt.preventDefault();
				$(this).triggerHandler('html5_uploader.dragleave');
			}, false);
			
			this.addEventListener("drop", function (evt) {
				evt.stopPropagation();
				evt.preventDefault();
				this.files = evt.dataTransfer.files;
				this.count = this.files.length;
				$(this).triggerHandler('html5_uploader.drop', [evt.dataTransfer.files, this.files.length, evt]);
				
			}, false);
			$(this).bind("html5_uploader.send", function (evn, options) {
				var options = jQuery.extend({
						url : "?upload",
						field_name : "upload[]",
						method: 'post',
						headers : {
							"X-Requested-With" : "XMLHttpRequest",
							"X-File-Name" : function (file) {
								return file.fileName
							},
							"X-File-Size" : function (file) {
								return file.fileSize
							}
						},
                        stop_on_first_error: false
					}, options);
				
				var files = this.files;
				var total = files.length;
				var $this = $(this);
				$this.triggerHandler('html5_uploader.start', [total]);
				xhr = new XMLHttpRequest()
					
					//UPLOAD FUNCTION
				function upload_file(number) {
					if (number == total) {
						$this.triggerHandler('html5_uploader.finish');
						return;
					}
					var file = files[number];
					$this.triggerHandler('html5_uploader.start_one', [file.fileName, number, total]); // tutaj skonczylem na dzis
					
					$this.triggerHandler('html5_uploader.setname', [file.fileName, number, total]);
					$this.triggerHandler('html5_uploader.progress', [0, file.fileSize, file.fileName, number, total]);
					xhr.upload['onprogress'] = function (rpe) {
						$this.triggerHandler('html5_uploader.progress', [rpe.loaded, rpe.total, file.fileName, number, total]);
					};
					xhr.onload = function (load) {
						$this.triggerHandler('html5_uploader.finish_one', [xhr.responseText, file.fileName, number, total]);
						$this.triggerHandler('html5_uploader.progress', [file.fileSize, file.fileSize, file.fileName, number, total]);
						upload_file(number + 1);
					};
					xhr.onabort = function () {
						$this.triggerHandler('html5_uploader.abort', [file.fileName, number, total]);
						upload_file(number + 1);
					};
					xhr.onerror = function (e) {
						$this.triggerHandler('html5_uploader.error', [file.fileName, e]);
						if (!options.stop_on_first_error) {
							upload_file(number + 1);
						}
					};
					xhr.open(options.method, typeof(options.url) == "function" ? options.url(number) : options.url, true);
					$.each(options.headers, function (key, val) {
						val = typeof(val) == "function" ? val(file) : val; // resolve value
						if (val === false)
							return true; // if resolved value is boolean false, do not send this header
						xhr.setRequestHeader(key, val);
					});
							if (window.FormData) {
								var f = new FormData();
								f.append(options.field_name, file);
								xhr.send(f);
							}else{
								$this.triggerHandler('html5_uploader.old_browser');
							}
					 
				}
				upload_file(0);
			})
		});
		return this;
	};
})(jQuery);
