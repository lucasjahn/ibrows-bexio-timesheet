(function() {
  'use strict';

  var config = {
    clientId: '6777100542.apps.bexio.com',
    clientSecret: 'FfdjCu3Q3Rp8Ujmcch2iFGHJC3o=',
    authorizationUrl: 'https://office.bexio.com/oauth/authorize',
    tokenUrl: 'https://office.bexio.com/oauth/access_token',
    useBasicAuthorizationHeader: false
  };

  var scopes = [
    'article_show',
    'calendar_show',
    'contact_show',
    'lead_show',
    'task_show',
    'monitoring_show',
    'monitoring_edit',
    'project_show'
  ];

  angular
    .module('app.core')
    .factory('authservice', ['electron-oauth2', '$localStorage', authservice ]);


  function authservice(electronOauth2, $localStorage) {
    var service = {
      getAccessToken: getAccessToken
    };

    return service;

    function getAccessToken() {
      var windowParams = {
        width: 800,
        height: 600,
        alwaysOnTop: true,
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: false
        },
        closable: false,
        frame: false,
        center: true
      };
      
      var options = {
        scope: scopes.join(' '),
        state: Math.random().toString(36).substring(7)
      };

      var myApiOauth = electronOauth2(config, windowParams);

      // Get access token promise (electron-oauth2)
      return myApiOauth.getAccessToken(options)
    }
  }
})();
