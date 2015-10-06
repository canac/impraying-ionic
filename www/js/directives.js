angular.module('directives', []).directive('prayerPreview', function() {
  return {
    restrict: 'E',
    scope: {
      prayerId: '=prayerId',
    },
    templateUrl: 'templates/prayer-preview.html',
    controller: function($scope, $firebaseObject, Prayers, Users, User) {
      $scope.user = User.getUser();

      var prayerRef = Prayers.$ref().child($scope.prayerId);
      $scope.prayer = $firebaseObject(prayerRef);
      prayerRef.once('value', function(snap) {
        // Look up the prayer's author
        var authorRef = Users.$ref().child(snap.val().author);
        $scope.author = $firebaseObject(authorRef);
      });

      $scope.destroyPrayer = function(prayer) {
        prayerRef.remove();
      };
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
}).directive('notificationPreview', function() {
  return {
    restrict: 'E',
    scope: {
      notification: '=notification',
    },
    templateUrl: 'templates/notification-preview.html',
    controller: function($scope, $state, $firebaseObject, Prayers, Users, User) {
      $scope.user = User.getUser();

      // Look up the notification's referenced prayer and comment
      var prayerRef = Prayers.$ref().child($scope.notification.prayerId);
      $scope.prayer = $firebaseObject(prayerRef);
      var commentRef = prayerRef.child('comments').child($scope.notification.commentId);
      $scope.comment = $firebaseObject(commentRef);
      commentRef.once('value', function(snap) {
        // Look up the comment's author
        var authorRef = Users.$ref().child(snap.val().author);
        $scope.author = $firebaseObject(authorRef);
      });

      $scope.destroyNotification = function(prayer) {
        $scope.user.notifications.$remove($scope.notification);
      };

      $scope.openNotification = function() {
        $state.go('tab.notification', { id: $scope.notification.prayerId });

        // Remove the notification since it has been read
        $scope.destroyNotification();
      };
    },
  };
});
