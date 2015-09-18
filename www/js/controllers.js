angular.module('controllers', ['angularMoment']).controller('PrayersCtrl', function($scope, Prayers) {
  $scope.prayers = Prayers;
}).controller('PrayerCtrl', function($scope, $stateParams, $ionicHistory, Prayers) {
  // Use the id contained in the current state to find the current prayer request
  $scope.prayer = Prayers.$getRecord($stateParams.id);

  $scope.destroy = function() {
    Prayers.$remove(this.prayer);
    $ionicHistory.goBack();
  };
}).controller('NewPrayerCtrl', function($scope, $ionicHistory, Prayers) {
  $scope.request = '';

  // Create a new prayer request
  $scope.createPrayer = function() {
    Prayers.$add({
      name: 'user',
      content: this.request,
      timestamp: Firebase.ServerValue.TIMESTAMP,
    });
    $ionicHistory.goBack();
  };
});
