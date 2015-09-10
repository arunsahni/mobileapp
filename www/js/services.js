angular.module('starter')
 
.service('AuthService', function($q, $http, USER_ROLES) {
  var LOCAL_TOKEN_KEY = {};
  var username = '';
  var isAuthenticated = false;
  var role = '';
  var authToken;

 
  function loadUserCredentials() {
    var token = window.localStorage.getItem(LOCAL_TOKEN_KEY.user);
    if (token) {
      useCredentials(token);
    }
  }
 
  function storeUserCredentials(token) {

    if(token[0].case_id) {
        LOCAL_TOKEN_KEY.documentData = token;
    } else {
        LOCAL_TOKEN_KEY.user = token;
    }
    window.localStorage['LOCAL_TOKEN_KEY'] = JSON.stringify(LOCAL_TOKEN_KEY);
    console.log(LOCAL_TOKEN_KEY);
    useCredentials(LOCAL_TOKEN_KEY.user);
  }
   
  function useCredentials(token) {
    username = token.split('.')[0];
    isAuthenticated = true;
    authToken = token;
 
    if (username == 'admin') {
      role = USER_ROLES.admin
    }
    if (username == 'user') {
      role = USER_ROLES.public
    }
 
    // Set the token as header for your requests!
    $http.defaults.headers.common['X-Auth-Token'] = token;
  }
 
  function destroyUserCredentials() {
    authToken = undefined;
    username = '';
    isAuthenticated = false;
    $http.defaults.headers.common['X-Auth-Token'] = undefined;
    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
  }
 
  var login = function(name, pw) {
    return $http({
                method: 'POST',
                url: 'http://192.168.100.90:8080/HERO/pages/DHFL_Mobile.jsp?Value=Login&U=' + name + '&P=' + pw + '&V=2'

            });
  };
 
  var logout = function() {
    destroyUserCredentials();
  };
 
  var isAuthorized = function(authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (isAuthenticated && authorizedRoles.indexOf(role) !== -1);
  };
 
  loadUserCredentials();
 
  return {
    login: login,
    logout: logout,
    isAuthorized: isAuthorized,
    storeUserCredentials: storeUserCredentials,
    isAuthenticated: function() {return isAuthenticated;},
    username: function() {return username;},
    role: function() {return role;}
  };
})
.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) {
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
        403: AUTH_EVENTS.notAuthorized
      }[response.status], response);
      return $q.reject(response);
    }
  };
})
 
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
});