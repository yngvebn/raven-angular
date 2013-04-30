var ngRaven = angular.module("ngRaven", ['ngResource'])

ngRaven.config(function($routeProvider){
	$routeProvider
		.when("/", {
			templateUrl: "views/database-list.html",
			controller: "ListCtrl"
		})
		.when("/database/:name", {
			templateUrl: "views/docs-list.html",
			controller: "DocsCtrl"
		})
		.when("/database/:name/docs/:id", {
			templateUrl: "views/doc.html",
			controller: "EditDocCtrl"
		}).when("/database/:name/docs/:id", {
			templateUrl: "views/doc.html",
			controller: "NewDocCtrl"
		})
});



ngRaven.factory("Raven", function($http){
	var raven = this;
	raven.host = 'http://localhost\:8088';

	var Database = function (name){
		var currentDatabase = name,
		    Doc = function(data, id){
			    var actualId = id ? id : data["@metadata"]["@id"];
			    var actualName = data.Name ? data.Name : data.name;
			    actualName = actualName ? actualName : actualId;
			    console.log(actualName)
				var docReturnObject = {
					name: actualName,
					object: data,
					id: actualId
				};
				docReturnObject._save = function(data, callback){
					if(docReturnObject.id){
						$http.put(raven.host+'/databases/'+currentDatabase+'/docs/'+id, data, {
							headers: { 'accept': 'application/json' }
						}).success(callback);
					}
				};
				return docReturnObject;
		},
		docs = function(/* id, callback */){
			var success= function(){}, id;
			if(typeof argument[0] === 'object'){ // add
				$http.put(raven.host+'/databases/'+currentDatabase+'/docs/', argument[0]).success(function(data){
					success(new Doc(data, id));
				});
			}
			if(typeof arguments[0] === 'string')
			{
				id = arguments[0];
			}
			if(typeof arguments[0] === 'function'){
				success = arguments[0];
			}
			if(arguments[1]){
				id = arguments[0];
				success = arguments[1];
			}
			if(id){
				$http.get(raven.host+'/databases/'+currentDatabase+'/docs/'+id).success(function(data){
					success(new Doc(data, id));
				});
			}
			else{
				$http.get(raven.host+'/databases/'+currentDatabase+'/docs').success(function(data){
					var mappedItems = _.map(data, function(item){
						return new Doc(item);	
					});
				success(mappedItems);
			});
			}
		}

		return {
			name: name,
			docs: docs
		}
	}

	raven.databases = function(success){
		$http.get(raven.host+'/databases').success(function(databases){
			success(_.map(databases, function(name){
				return new Database(name);
			}));
		});
	}

	raven.database = function(name){
		return new Database(name);		
	}

	return {
		databases: raven.databases,
		database: raven.database
	}
	
});

ngRaven.controller('EditDocCtrl', function($scope, $routeParams, Raven){
	var editor;
	var renderEditor = function(){
	    editor = ace.edit("ace-editor");
	    ace.config.set("workerPath", "/lib/ace/"); 
	    editor.setTheme("ace/theme/monokai");
	    editor.getSession().setMode("ace/mode/json");
	    console.log('rendering editor');
	}
	Raven.database($routeParams.name).docs($routeParams.id, function(data){
		$scope.doc = data;
		editor.setValue(JSON.stringify($scope.doc.object, null, 2));
	});
	$scope.actionText = 'Save';
	$scope.save = function(){
		var object = JSON.parse(editor.getValue());
		
		$scope.doc._save(object, function(){
			alert('saved!');
		});
	}

	renderEditor();
});


ngRaven.controller('DocCtrl', function($scope, $routeParams, Raven){
	var editor;
	var renderEditor = function(){
	    editor = ace.edit("ace-editor");
	    ace.config.set("workerPath", "/lib/ace/"); 
	    editor.setTheme("ace/theme/monokai");
	    editor.getSession().setMode("ace/mode/json");
	    console.log('rendering editor');
	}
	
	$scope.actionText = 'Save';
	$scope.save = function(){
		var object = JSON.parse(editor.getValue());
		Raven.database()
		$scope.doc._save(object, function(){
			alert('saved!');
		});
	}

	renderEditor();
});


ngRaven.controller('ListCtrl', function($scope, Raven){
	Raven.databases(function(data){
		$scope.items = data;
	});	
});

ngRaven.controller("DocsCtrl", function($scope, Raven, $routeParams){
	$scope.database = $routeParams.name;

	Raven.database($scope.database).docs(function(data){
		$scope.docs = data;
	})
});