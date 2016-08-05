/* 

<input type="file" id="files" name="files[]" multiple webkitdirectory />
<div id="tree"></div>




 var input = document.getElementById('files');
 var narr = [];
var fileICON = "http://imdbnator.com/test/images/file.png";
var farr = [];
//when browse button is pressed
 input.onchange = function (e) {
     var dummyObj = [];
     var filesArray = [];
     var files = e.target.files; // FileList
     for (var i = 0, f; f = files[i]; ++i) {
          var reader = new FileReader();
          //console.log(files[i]);
          reader.readAsText(files[i], "UTF-8");
          reader.onload = function (evt) {
            var length = evt.target.result.length;

            //farr = $.merge(filesArray, (cat(fname)));
          }
          reader.onerror = function (evt) {
            console.error("error reading file");
          }
          var fname = './' + files[i].webkitRelativePath;
          narr = $.merge(dummyObj, (cat(fname)));
     }

            
     treeJSON = narr.getUnique(); // getting the JSON tree after processing input
     //console.log(JSON.stringify(treeJSON));
     //console.log(treeJSON);
			//console.log(objArr);
      //console.log(folderArr.getUnique());
     //creating the tree using jstree
     
     $('#tree')
         .jstree({
         'core': {
             'check_callback': true,
                 'data': function (node, cb) {
                 cb.call(this, treeJSON);
             }
         }
     });
     var tree = $('#tree').jstree(true);
     tree.refresh();
     $('#tree').on("activate_node.jstree", 	     function (event, data) {
      console.log(data.node.original);
     })
 };

//get unqiue array function
 Array.prototype.getUnique = function () {
     var o = {}, a = [];
     for (var i = 0, l = this.length; i < l; ++i) {
         if (o.hasOwnProperty(JSON.stringify(this[i]))) {
             continue;
         }
         a.push(this[i]);
         o[JSON.stringify(this[i])] = 1;
     }
     return a;
 };

 // categorizing function which converts each ./Files/Root/File.jpg to a JSON

 var objArr = [];
 var folderArr = [];

 function cat(a) {

     if (!a.match(/\/(.+?)\//)) {
         var dummyObj = {};
         var fname = a.match(/\/(.*)/)[1];
         dummyObj.id = fname;
         dummyObj.text = fname;
         //dummyObj.reader = reader;
         if (folderArr === undefined || folderArr.length == 0) {
             dummyObj.parent = '#';
             dummyObj.isFolder = false;
         } else {
         		 var parentFolder = folderArr[(folderArr.length) - 1];
             dummyObj.isFolder = false;
             //console.log(dummyObj.text, " is a file");
             dummyObj.parent = parentFolder;
             dummyObj.icon = fileICON; // add extention and icon support
         }
         objArr.push(dummyObj);
         return objArr;
     } else {
         if (a.charAt(0) == '.') {
             var dummyObj = {};
             var dir1 = a.match(/^.*?\/(.*?)\//)[1];
             dummyObj.id = dir1;
             //dummyObj.reader = reader;
             dummyObj.text = dir1;
             dummyObj.parent = '#';
             dummyObj.isFolder = false;
             dummyObj.state = {
                 'opened': true,
                     'selected': true
             }; // not working
             folderArr.push(dir1);
             objArr.push(dummyObj);
             var remStr = a.replace(/^[^\/]*\/[^\/]+/, '');
             cat(remStr);
             return objArr;
         } else {
             var dummyObj = {};
             var dir1 = a.match(/^.*?\/(.*?)\//)[1];
             dummyObj.id = dir1;
             dummyObj.text = dir1;
             //dummyObj.reader = reader;
             dummyObj.isFolder = true;
             var parentFolder = folderArr[(folderArr.length) - 1];
             //console.log(dummyObj.text, "if a folder");
             dummyObj.parent = parentFolder;
             folderArr.push(dir1);
             objArr.push(dummyObj);
             var remStr = a.replace(/^[^\/]*\/[^\/]+/, '');
             cat(remStr);
             return objArr;
         }
     }
 }*/