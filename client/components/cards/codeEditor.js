Template.CodeMirrorEditor.BlazeComponent({
  helperToUpdateCodeMirror() {
    var language = this.data().language;
    //var l = Cards.findOne({_id: this.data()._id})
    if (this.editor) {
      this.editor.setOption("mode", language);
    }
  },
  editorBefore() {
    var data = this.data();
    if (data.previousCardId) {
      return Cards.findOne(data.previousCardId).title;
    }
    else {
      return null;
    }
  },
  editorAfter() {
    var data = this.data();
    if (data.nextCardId) {
      return Cards.findOne(data.nextCardId).title;
    }
    else {
      return null;
    }
  },
  segmentHelper() {
    var data = this.data();
    if (data.segment) {
      return this.data().segment;
    }
    else if(data.documentId) {

    }
  },
  activatedLinkedHighlight() {
    var link = Session.get("currentlyHoverLink");
    var data = this.data();
    if (link === data._id) {
      return true;
    }
    else
      return false;
  },
  onCreated() {

  },
  events() {
    return [{
      'mouseenter span.rightalignchainfrom'() {
        var data = this.data();
        if (data.previousCardId) {
          Session.set("currentlyHoverLink", data.previousCardId);
        }
      },
      'mouseenter span.rightalignchainto'() {
        var data = this.data();
        if (data.nextCardId) {
          Session.set("currentlyHoverLink", data.nextCardId);
        }
      },
      'mouseleave span.rightalignchainfrom'() {
        var data = this.data();
        if (data.previousCardId) {
          Session.set("currentlyHoverLink", null);
        }
      },
      'mouseleave span.rightalignchainto'() {
        var data = this.data();
        if (data.nextCardId) {
          Session.set("currentlyHoverLink", null);
        }
      },
    }];
  },
  onRendered() {
    var data = this.data();
    var masters = CodeMirrorMasterDocuments;
    var options = {
      value: "",
      mode: data.language ? data.language : "htmlembedded",
      lineNumbers: true,
      theme: "3024-night"
    };
    var textArea = this.find("textarea.codeEditor");
    var editor = CodeMirror.fromTextArea(textArea, options);
    this.editor = editor;
    editor.thisComponent = this;
    editor.setSize("100%", "100%");
    editor.refresh();

    if (data.masterId) {
      var masterDoc = masters[data.masterId];
      if (!masterDoc) {
        if (data.masterId === data._id) {
          var masterCard = data;
        }
        else {
          var masterCard = Cards.findOne(data.masterId);
        }
        if (masterCard) {
          masterDoc = new CodeMirror.Doc(masterCard.segment, masterCard.language);
          masters[data.masterId] = masterDoc;
        }
        else {
          masterDoc = editor.getDoc();
        }
      }
      var slaveDoc = masterDoc.linkedDoc({
        from: data.firstLine,
        to: data.lastLine+1
      });
      editor.swapDoc(slaveDoc);
      editor.masterDoc = masterDoc;
    }
    else {
      Cards.update(data._id, {$set: {masterId: data._id}});
      var masterDoc = editor.getDoc();
      editor.masterDoc = masterDoc;
    }

    editor.on("change", function(editor, changeObj) {
      var val = editor.getValue();
      var data = editor.thisComponent.data();
      var masterDoc = editor.masterDoc;
      var updateLinkedCards = function (doc, sharedHist) {
          var iterEditor = doc.getEditor();
          if (iterEditor && masterDoc !== doc) {
            var iterData = iterEditor.thisComponent.data();
            if (!iterData) {
              //console.error("Error in rendering engine on change");
              return;
            }
            if (iterData._id === data.masterId) {
              Cards.update(iterData._id, {$set: {
                segment: masterDoc.getValue(),
                firstLine: doc.firstLine(),
                lastLine: doc.lastLine(),
                fileLastLine: masterDoc.lastLine()
              }});
            }
            else {
              Cards.update(iterData._id, {$set: {
                firstLine: doc.firstLine(),
                lastLine: doc.lastLine(),
                fileLastLine: masterDoc.lastLine()
              }});
            }
          }
      }
      if (data) {
        if (editor.firstLine() !== data.firstLine 
          || editor.lastLine() !== data.lastLine) {
          if (data.masterId === data._id && masterDoc) {
            Cards.update(data._id, {$set: {
              segment: masterDoc.getValue(),
              firstLine: editor.firstLine(),
              lastLine: editor.lastLine(),
              fileLastLine: masterDoc.lastLine()
            }});
          }
          else {
            Cards.update(data._id, {$set: {
              firstLine: editor.firstLine(),
              lastLine: editor.lastLine(),
              fileLastLine: masterDoc.lastLine()
            }});
          }
          editor.iterLinkedDocs(updateLinkedCards);
        }
        else if (data.masterId === data._id && masterDoc) {
          Cards.update(data._id, {$set: {
            segment: masterDoc.getValue(),
            firstLine: editor.firstLine(),
            lastLine: editor.lastLine(),
            fileLastLine: masterDoc.lastLine()
          }});        
        }
        else if (masterDoc && data.masterId) {
          Cards.update(data.masterId, {$set: {
            segment: masterDoc.getValue(),
            fileLastLine: masterDoc.lastLine()
          }});
        }
      }
      else {
        //console.error("Error in rendering engine.");
      }
    });
  console.log(editor);
    editor.on("gutterClick", function(editor, line, cssClass, event) {
      var parent = editor.thisComponent.parentComponent();
      var minicardWrapper = parent.find(".minicard").parentElement;
      var next = minicardWrapper.nextSibling;
      if (next.classList) {
        var sortIndex = Utils.calculateIndex(minicardWrapper, next);
      }
      else {
        var sortIndex = Utils.calculateIndex(minicardWrapper, null);     
      }
      
      var data = editor.thisComponent.data();
      var doc = editor.getDoc();

      var splitObj = editor.splitDoc(line);
      //{topDoc: topDoc, bottomDoc: bottomDoc, masterDoc: masterDoc};
      console.log(splitObj, next, minicardWrapper);
      var topPosition = data.segmentPosition;
      if (topPosition)
        var bottomPosition = topPosition++;
      else {
        topPosition = 0;
        var bottomPosition = topPosition++;
      }
      var masterTitle = Cards.findOne(data.masterId).title;
      var linkedDocsCount = Cards.find({masterId: data.masterId}).count();
      var bottomTitle = masterTitle + " (" + linkedDocsCount + ")";
      const _id = Cards.insert({
        title: bottomTitle,
        //masterTitle: masterTitle,
        //segment: splitObj.bottomDoc.getValue(),
        segmentPosition: bottomPosition,
        masterId: data.masterId ? data.masterId : data._id,
        fileName: data.fileName ? data.fileName : null,
        filePath: data.filePath ? data.filePath : null,
        fileLastLine: splitObj.masterDoc.lastLine(),
        previousCardId: data._id,
        firstLine: splitObj.bottomDoc.firstLine(),
        lastLine: splitObj.bottomDoc.lastLine(),
        language: data.language,
        listId: data.list()._id,
        boardId: data.board()._id,
        sort: sortIndex.base
      });

      Cards.update(data._id, {$set: {
        //segment: splitObj.topDoc.getValue(),
        segmentPosition: topPosition,
        masterId: data.masterId ? data.masterId : data._id,
        fileLastLine: splitObj.masterDoc.lastLine(),
        nextCardId: _id,
        firstLine: splitObj.topDoc.firstLine(),
        lastLine: splitObj.topDoc.lastLine(),
      }});
    });
  },
});
Template.CodeMirrorEditor.destroyed = function() {
  this.$("textarea").parent().find(".CodeMirror").remove();
};