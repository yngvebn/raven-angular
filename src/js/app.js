var ngRaven = angular.module("ngRaven", ['ngResource'])

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
	Raven.databases('dummy').success(function(data){
		$scope.items = data;
		console.log(data);
	});
	
});