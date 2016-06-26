(function () {
    'use strict';

    angular
        .module('app.dashboard')
        .config(getRoutes);

    /* @ngInject */
    function getRoutes($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'dashboard/dashboard.html',
                controller: 'Dashboard',
                controllerAs: 'vm'
            })
            .otherwise({
                redirectTo: '/'
            });
    }

})();