(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('bexioservice', bexioservice);

  /* @ngInject */
  function bexioservice($http, $q, $localStorage) {
    var service = {
      getTimesByUser: getTimesByUser,
      getProjects: getProjects,
      getProjectById: getProjectById,
      getContacts: getContacts,
      getContactById: getContactById,
      getServices: getServices,
      getServiceById: getServiceById
    };

    return service;

    // Read user data
    function getTimesByUser(userId) {
      var userData = $localStorage.userData;

      var filter = [
        {
          'field': 'user_id',
          'value': userId
        }
      ];

      var request = {
        method: 'POST',
        url: `https://office.bexio.com/api2.php/${userData.org}/timesheet/search?&limit=20&order_by=id_desc`,
        data: filter
      };

      return $http(request);

    }

    function getProjects() {
      var userData = $localStorage.userData;

      var request = {
        method: 'GET',
        url: `https://office.bexio.com/api2.php/${userData.org}/pr_project?order_by=id`
      };

      return $http(request);
    }

    function getProjectById(id) {
      return  getObjById($localStorage.projects, 'id', id);
    }

    function getContacts() {
      var userData = $localStorage.userData;

      var filter = [
        {
          "field": "contact_type_id",
          "value": 1
        }
      ];

      var request = {
        method: 'POST',
        url: `https://office.bexio.com/api2.php/${userData.org}/contact/search`,
        data: filter
      };

      return $http(request);
    }

    function getContactById(id) {
      return  getObjById($localStorage.contacts, 'id', id);
    }

    function getObjById(obj, field, value) {
      var search = {};
      search[field] = value;

      return _.findWhere(obj, search);
    }

    function getServices() {
      var userData = $localStorage.userData;

      var request = {
        method: 'GET',
        url: `https://office.bexio.com/api2.php/${userData.org}/client_service`
      };

      return $http(request);
    }

    function getServiceById(id) {
      return  getObjById($localStorage.services, 'id', id);
    }
  }
})();
