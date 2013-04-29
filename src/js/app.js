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
			controller: "DocCtrl"
		})
});

ngRaven.factory("Raven", function($http){
	var self = this;
	self.host = 'http://localhost\:8088';

	self.databases = function(name){
		if(!name){
			return $http.get(self.host+'/databases');
		}
		else{
			return $http.get(self.host+'/databases/'+name+'/docs');
		}
	}
	self.doc = function(db, id){
		return $http.get(self.host+'/databases/'+db+'/docs/'+id);
	}
	self.save = function(db, id, data){
		return $http.put(self.host+'/databases/'+db+'/docs/'+id, data, {
			headers: { 'accept': 'application/json' }
		});
	}
	return {
		databases: self.databases,
		doc: self.doc,
		save: self.save
	}
	
});

ngRaven.controller('DocCtrl', function($scope, $routeParams, Raven){
	console.log($routeParams);
	var editor;
	var renderEditor = function(){
		    editor = ace.edit("ace-editor");
		    ace.config.set("workerPath", "/lib/ace/"); 
	    editor.setTheme("ace/theme/monokai");
	    editor.getSession().setMode("ace/mode/json");
	    console.log('rendering editor');
	}
	Raven.doc($routeParams.name, $routeParams.id).success(function(data){
		$scope.doc = data;
		editor.setValue(JSON.stringify($scope.doc, null, 2));
	});

	$scope.save = function(){
		var object = JSON.parse(editor.getValue());
		Raven.save($routeParams.name, $routeParams.id, object);
	}

	renderEditor();
});

ngRaven.controller('ListCtrl', function($scope, Raven){
	Raven.databases().success(function(data){
		$scope.items = data;
		console.log(data);
	});
	
});

ngRaven.controller("DocsCtrl", function($scope, Raven, $routeParams){
	console.log('loading docs for '+$routeParams.name);
	$scope.database = $routeParams.name;
	Raven.databases($routeParams.name).success(function(data){
		var mappedItems = _.map(data, function(item){
			console.log(item);
			console.log(item["@metadata"]["@id"]);
			return {
				name: item.Name,
				details: '#/database/'+$routeParams.name+'/docs/'+item["@metadata"]["@id"]
			};
		});
		$scope.docs = mappedItems;
	})
});