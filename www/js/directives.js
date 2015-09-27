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
}).directive('commentPreview', function() {
  return {
    restrict: 'E',
    scope: {
      comment: '=comment',
    },
    templateUrl: 'templates/comment-preview.html',
    controller: function($scope, $firebaseObject, Prayers, Users, User) {
      $scope.user = User.getUser();

      // Look up the comment's author
      var authorRef = Users.$ref().child($scope.comment.author);
      $scope.author = $firebaseObject(authorRef);

      $scope.destroyComment = function() {
        var commentRef = Prayers.$ref().child($scope.comment.prayer).child('comments').child($scope.comment.$id);
        commentRef.remove();
      };
    },
  };
});
