(function() {
  'use strict';

  angular
    .module('app.dashboard')
    .controller('Dashboard', Dashboard);

  /* @ngInject */
  function Dashboard($q, authservice, $localStorage, bexioservice) {
      var vm = this;
      vm.title = 'Track your Time!';
      vm.times = '';
      vm.projects = '';


      ///////////////////////

      var now = new Date();

      if(!$localStorage.userData) {
          authservice.getAccessToken()
              .then(function(data) {
                  // Save access data
                  var d = new Date();
                  d = new Date(d.getTime() + data.expires_in);
                  data.expires = d.toString();

                  $localStorage.userData = data;
                  return getTimes(data.user_id);
              })
              .then(function(result) {
                  vm.times = result.data;
                  
              });
      } else {
          getTimes($localStorage.userData.user_id)
              .then(function(result) {
                  vm.times = result.data;
              });
      }

      bexioservice.getProjects()
          .then(function(result) {
              $localStorage.projects = vm.projects = result.data;
          });
      
      bexioservice.getContacts()
          .then(function(result) {
              $localStorage.contacts = vm.contacts = result.data;
          });

      bexioservice.getServices()
          .then(function(result) {
              $localStorage.services = vm.services = result.data;
          });

      $q.all([bexioservice.getContacts(), bexioservice.getProjects(), bexioservice.getServices()]).then(function() {
          vm.times = $localStorage.times = _.map(vm.times, function(obj, key) {
              obj.contact = bexioservice.getContactById(obj.contact_id);
              obj.project = bexioservice.getProjectById(obj.pr_project_id);
              obj.client_service = bexioservice.getServiceById(obj.slient_service_id);

              return obj;
          });

          console.log()
      });

      function getTimes(userId) {
          return bexioservice.getTimesByUser(userId);
      }
  }
})();
