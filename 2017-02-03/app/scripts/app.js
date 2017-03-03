'use strict';

/**
 * @ngdoc overview
 * @name 20170130App
 * @description
 * # 20170130App
 *
 * Main module of the application.
 */
 /*
angular
  .module('20170130App', [])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
      })
      .otherwise({
        redirectTo: '/'
      });
  });
*/
angular.module('20170130App', ['ngRoute']).config(function($routeProvider){
	$routeProvider.when('/', {
		templateUrl:'views/main.html',
    controller:'MainCtrl'
	}).otherwise({
		redirectTo: '/'
	});

}).filter('TimeFormat', function() {
  return function(num) {
    var inum = parseInt(num);
    var minutes = Math.floor(inum / 60);
    var seconds = Math.floor(inum % 60);
    var formatstring = "";
    if (minutes < 10) {
      formatstring += "0";
    }
    formatstring += minutes + ":";
    if (seconds < 10) {
      formatstring += "0";
    }
    formatstring += seconds;
    return formatstring;
  }
});;

