// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova','angularXml2json'])

.config(function ($stateProvider, $urlRouterProvider, USER_ROLES, $ionicConfigProvider) {
  $ionicConfigProvider.tabs.position('bottom');
  $stateProvider
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })

  .state('dash', {
    url: '/dash',
    templateUrl: 'templates/dashboard.html',
    controller: 'DashCtrl'
  })

  .state('upload', {
    url: '/upload',
    templateUrl: 'templates/uploadScreen.html',
    controller: 'DashCtrl'
  })
  .state('doc', {
    url: '/doc',
    templateUrl: 'templates/doc_add.html',
    controller: 'addDocCtrl'
  })
  .state('status', {
    url: '/status',
    templateUrl: 'templates/status.html',
    controller: 'DashCtrl'
  })
  .state('pending',{
    url:'/pending',
    templateUrl:'templates/pending.html',
    controller: 'DashCtrl'
  });

  // Thanks to Ben Noblet!
  $urlRouterProvider.otherwise(function ($injector, $location) {
    var $state = $injector.get("$state");
    $state.go("dash");
  });
})
// .run(function($httpBackend){
//   $httpBackend.whenGET('http://localhost:8100/valid')
//         .respond({message: 'This is my valid response!'});
//   $httpBackend.whenGET('http://localhost:8100/notauthenticated')
//         .respond(401, {message: "Not Authenticated"});
//   $httpBackend.whenGET('http://localhost:8100/notauthorized')
//         .respond(403, {message: "Not Authorized"});
 
//   $httpBackend.whenGET(/templates\/\w+.*/).passThrough();
// })
.run(function ($rootScope, $state, AuthService, AUTH_EVENTS) {
  $rootScope.$on('$stateChangeStart', function (event,next, nextParams, fromState) {
 
    if ('data' in next && 'authorizedRoles' in next.data) {
      var authorizedRoles = next.data.authorizedRoles;
      if (!AuthService.isAuthorized(authorizedRoles)) {
        event.preventDefault();
        $state.go($state.current, {}, {reload: true});
        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
      }
    }
 
    if (!AuthService.isAuthenticated()) {
      if (next.name !== 'login') {
        event.preventDefault();
        $state.go('login');
      }
    }
  });
})