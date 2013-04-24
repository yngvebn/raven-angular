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
	return {
		databases: self.databases
	}
	
});

ngRaven.controller('ListCtrl', function($scope, Raven){
	Raven.databases().success(function(data){
		$scope.items = data;
		console.log(data);
	});
	
});

ngRaven.controller("DocsCtrl", function($scope, Raven, $routeParams){
	console.log('loading docs for '+$routeParams.name);
	Raven.databases($routeParams.name).success(function(data){
		console.log(data);
		$scope.docs = data;
	})
});