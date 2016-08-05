Apps = new Mongo.Collection('apps');

Apps.attachSchema(new SimpleSchema({
	
}));

MasterDocuments = new Mongo.Collection('masterdocuments');

MasterDocuments.attachSchema(new SimpleSchema({
	fileName: {
		type: String
	},
	filePath: {
		type: String,
		optional: true
	},
	fileLastLine: {
		type: Number,
		optional: true
	},
	linkedCardIds: {
		type: [String]
	},
	boardId: {
		type: String
	},
}));


/*
var github = new GitHub({
    version: "3.0.0", // required
    timeout: 5000     // optional
});

github.repos.get({
    user: "Qualmsy",
    repo: "Facepool"
}, function(err, res) {
    console.log(JSON.stringify(res));
});*/