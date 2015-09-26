angular.module('directives', []).directive('prayerPreview', function() {
  return {
    restrict: 'E',
    scope: {
      prayerId: '=prayerId',
    },
    templateUrl: 'templates/prayer-preview.html',
    controller: function($scope, $firebaseObject, Prayers, Users) {
      // Return a user record based on its id
      $scope.lookupUser = function(id) {
        return Users.$getRecord(id);
      };

      var prayerRef = Prayers.$ref().child($scope.prayerId);
      $scope.prayer = $firebaseObject(prayerRef);
    },
  };
});
