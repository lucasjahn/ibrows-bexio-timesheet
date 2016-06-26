(function() {
    'use strict';

    angular
        .module('app.core')
        .factory('APIInterceptor', APIInterceptor);

    /* @ngInject */
    function APIInterceptor($q, $injector) {

        var APIInterceptor = {
            // On request success
            request: function(config) {

                //Return the config or wrap it in a promise if blank.
                return config || $q.when(config);
            },

            // On request failure
            requestError: function(rejection) {

                // Return the promise rejection.
                return $q.reject(rejection);
            },

            // On response success
            response: function(response) {

                // Return the response or promise.
                return response || $q.when(response);
            },

            // On response failture
            responseError: function(rejection) {

                // This will capture all HTTP errors such as 401 errors so be careful with your code. You can however
                // examine the "rejection" object so you can add more filtering
                var $localStorage = $injector.get('$localStorage');
                var $http = $injector.get('$http');
                var deferred = $q.defer();
                var authservice = $injector.get('authservice');

                // Session has expired
                if (rejection.status == 401) {

                    // Create a new session (recover the session)
                    // We use login method that logs the user in using the current credentials and
                    // returns a promise
                    var config = {
                        clientId: '6777100542.apps.bexio.com',
                        clientSecret: 'FfdjCu3Q3Rp8Ujmcch2iFGHJC3o=',
                        authorizationUrl: 'https://office.bexio.com/oauth/authorize',
                        tokenUrl: 'https://office.bexio.com/oauth/access_token',
                        useBasicAuthorizationHeader: false
                    };

                    var userData = $localStorage.userData;

                    var request = {
                        method: 'POST',
                        url: `https://office.bexio.com/oauth/refresh_token?client_id=${config.clientId}&client_secret=${config.clientSecret}&refresh_token=${userData.refresh_token}`
                    };

                    $http(request).then(deferred.resolve, deferred.reject);


                    // When the session recovered, make the same backend call again and chain the request
                    return deferred.promise.then(function (result) {
                        $localStorage.userData = result.data;
                        return $http(rejection.config);
                    });
                }

                else if (rejection.status == 404) {

                    authservice.getAccessToken().then(deferred.resolve, deferred.reject);

                    return deferred.promise.then(function (result) {
                        $localStorage.userData = result.data;
                        return $http(rejection.config);
                    });
                }

                return $q.reject(rejection);
            }
        };

        return APIInterceptor;
    }
})();
