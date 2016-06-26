(function() {
  'use strict';

  var core = angular.module('app.core');

  core
      .config(['remoteProvider', function(remoteProvider) {
        remoteProvider.register('electron-oauth2');
      }])
      .run(['$http', '$localStorage', function($http, $localStorage) {
          if ($localStorage.userData) {
              $http.defaults.headers.common.Authorization = `Bearer ${$localStorage.userData.access_token}`;
              $http.defaults.headers.common.Accept = 'application/json';
          }
      }]);


})();
