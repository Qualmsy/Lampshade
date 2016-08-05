Blaze.Template.prototype.BlazeComponent = function (BlazeComponentClass) {
	var template = this;
	var fullName = template.viewName;
	var fullNameArray = fullName.split(".");
	var templateName = fullNameArray[1];
	if (ViewModel) {
		if (typeof BlazeComponentClass.viewmodel === 'function') {
			if (typeof this.viewmodel === 'function') {
				this.viewmodel(BlazeComponentClass.viewmodel);
				delete BlazeComponentClass.viewmodel;
			}
		}
	}
	return BlazeComponent.extendComponent(BlazeComponentClass).register(templateName);
};

CodeMirrorMasterDocuments = {};

CodeMirror.prototype.setMaster = function (id) {
	var c = this.thisComponent;
	if (!c)
		return;

	var data = c.data();
	if (data.masterId) {
		var id = data.masterId;
	}
	else if (data.filePath && data.fileName) {
		var id = data.filePath + data.fileName;
	}
	else if (data.fileFirstCard) {
		var id = data.fileFirstCard;
	}
	else {
		var id = data._id;
	}
	/*
	var entireDocument = data.getEntireDocument();
	if (entireDocument) {
		var masterDoc = CodeMirror.Doc(entireDocument);
	}
	else {
		var masterDoc = CodeMirror.Doc("");
	}*/

	if (CodeMirrorMasterDocuments[id]) {
		return false;
	}
	else {
		CodeMirrorMasterDocuments[id] = masterDoc;
		return id;
	}
};
CodeMirror.prototype.getMaster = function () {
	var c = this.thisComponent;
	if (!c)
		return;
	var data = c.data();
	if (data.masterId) {
		return CodeMirrorMasterDocuments[data.masterId];
	}
	else if (data.filePath && data.fileName) {
		return CodeMirrorMasterDocuments[data.filePath + data.fileName];
	}
	else if (data.fileFirstCard) {
		return CodeMirrorMasterDocuments[data.fileFirstCard];
	}
	else if (data._id) {
		return CodeMirrorMasterDocuments[data._id];
	}
	else {
		return null;
	}
};
CodeMirror.prototype.splitDoc = function (line) {
	var masterDoc = this.masterDoc;
	var thisDoc = this.getDoc();
	if (!masterDoc) {
		masterDoc = thisDoc;
	}
	var topDoc = masterDoc.linkedDoc({
		from: thisDoc.firstLine(),
		to: line
	});
	var bottomDoc = masterDoc.linkedDoc({
		from: line,
		to: thisDoc.lastLine()+1
	});
	this.swapDoc(topDoc);
	return {topDoc: topDoc, bottomDoc: bottomDoc, masterDoc: masterDoc};
};
CodeMirror.prototype.appendDoc = function () {
	var doc = this.getDoc();
	var masterDoc = this.getMaster();
	if (masterDoc) {
		var newDoc = masterDoc.linkedDoc({
			from: masterDoc.lastLine()+1
		});		
	}
	else {
		var newDoc = doc.linkedDoc({
			from: doc.lastLine()+1
		});
		if (!this.setMaster()) {
			console.error("There is a bug in Master setting function!");
		}
	}	
	return newDoc;
};
/*
MasterDocumentManager = {
	_masterDocuments: {},
	checkIf
	splitDoc: function (doc, line, id) {

      var topEditor = doc.linkedDoc({
        to: line
      });
      var bottomEditor = doc.linkedDoc({
        from: line
      });
		if (this._masterDocuments[id]) {
			var file = doc.swapDoc(topEditor);
			return this._masterDocuments[id].linkedDoc({
		    	from: line,
		    	to: doc.lastLine()
		    });
		}
		else {
			this._masterDocuments[id] = doc;
			return doc.linkedDoc({
		    	from: line,
		    	to: doc.lastLine()
		    });		
		}
	},
	newDoc: function (newDoc, id) {
		if (_masterDocuments[id]) {
			return _masterDocuments[id].linkedDoc({
		    	from: newDoc.firstLine(),
		    	to: newDoc.lastLine()
		    });
		}
		else {
			_masterDocuments[id] = newDoc;
		}


      var topEditor = doc.linkedDoc({
        to: line
      });
		this._masterDocuments.forEach(function (master) {
			if (master.id === id) {
				master.docs.push(newDoc);

			}
			master.iterLinkedDocs(function (doc, sharedHist) {
				doc.linkedDoc({
			    	to: line
			    });
			})
		});
	}
	createLinkedDocument: function () {
		this.masterDocuments.forEach(function (master) {
			master.iterLinkedDocs(function (doc, sharedHist) {
				doc.linkedDoc({
			    	to: line
			    });
			})
		});
	},

	linkedDocuments: [],
	map: function (func) {
		this.masterDocuments.map(func);
		iterLinkedDocs(func);
	},

};
*/

Blaze.Template.prototype.BlazeComponentExtends = function (ComponentParent, BlazeComponentClass) {
	var template = this;
	var fullName = template.viewName;
	var fullNameArray = fullName.split(".");
	var templateName = fullNameArray[1];
	if (ViewModel) {
		if (typeof BlazeComponentClass.viewmodel === 'function') {
			if (typeof this.viewmodel === 'function') {
				this.viewmodel(BlazeComponentClass.viewmodel);
				delete BlazeComponentClass.viewmodel;
			}
		}
	}
	return ComponentParent.extendComponent(BlazeComponentClass).register(templateName);
};

Blaze.Template.prototype.getBlazeComponent = function () {
	var template = this;
	var fullName = template.viewName;
	var fullNameArray = fullName.split(".");
	var templateName = fullNameArray[1];
	return BlazeComponent.getComponent(templateName);
};
