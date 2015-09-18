angular.module('controllers', []).controller('PrayersCtrl', function($scope, Prayers) {
  $scope.prayers = Prayers;
}).controller('NewPrayerCtrl', function($scope, $ionicHistory, Prayers) {
  $scope.request = '';

  // Create a new prayer request
  $scope.createPrayer = function(request) {
    Prayers.$add({
      name: 'user',
      content: request,
      timestamp: Date.now(),
    });
    $ionicHistory.goBack();
  };
});
