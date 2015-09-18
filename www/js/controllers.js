angular.module('controllers', ['angularMoment']).controller('PrayersCtrl', function($scope, Prayers) {
  $scope.prayers = Prayers;
}).controller('PrayerCtrl', function($scope, $stateParams, Prayers) {
  // Use the id contained in the current state to find the current prayer request
  $scope.prayer = Prayers.$getRecord($stateParams.id);
}).controller('NewPrayerCtrl', function($scope, $ionicHistory, Prayers) {
  $scope.request = '';

  // Create a new prayer request
  $scope.createPrayer = function(request) {
    Prayers.$add({
      name: 'user',
      content: request,
      timestamp: Firebase.ServerValue.TIMESTAMP,
    });
    $ionicHistory.goBack();
  };
});
