angular.module('controllers', ['angularMoment']).controller('PrayersCtrl', function($scope, Prayers) {
  // Initialize the scope variables
  $scope.prayers = Prayers;
  $scope.request = '';

  // Create a new prayer request
  $scope.createPrayer = function() {
    Prayers.$add({
      user: 'user',
      content: this.request,
      timestamp: Firebase.ServerValue.TIMESTAMP,
    });

    // Clear the request in preparation for creating the next one
    this.request = '';
  };
}).controller('PrayerCtrl', function($scope, $stateParams, $ionicHistory, Prayers) {
  // Use the id contained in the current state to find the current prayer request
  $scope.prayer = Prayers.$getRecord($stateParams.id);

  $scope.destroy = function() {
    Prayers.$remove(this.prayer);
    $ionicHistory.goBack();
  };
});
