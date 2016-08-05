Template.onRendered(function () {
	var elArray = this.findAll('*');
	var name = this.view.name.replace("Template.", "");
	for (var i = 0; i < elArray.length; i++) {
		elArray[i].setAttribute('data-template', name);	
	};

});