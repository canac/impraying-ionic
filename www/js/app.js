// I'm Praying app main module
angular.module('impraying', ['ionic', 'firebase', 'controllers', 'directives', 'services', 'ngIOS9UIWebViewPatch']).run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }

    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
}).config(function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('prayers', {
    url: '/prayers',
    templateUrl: 'templates/prayers.html',
    controller: 'PrayersCtrl',
  }).state('prayer', {
    url: '/prayers/:id',
    templateUrl: 'templates/prayer.html',
    controller: 'PrayerCtrl',
  });

  // Fallback state when no other states are matched
  $urlRouterProvider.otherwise('/prayers');
});
