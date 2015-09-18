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
      comments: {},
    });

    // Clear the request in preparation for creating the next one
    this.request = '';
  };
}).controller('PrayerCtrl', function($scope, $stateParams, $ionicHistory, $ionicModal, $firebaseArray, Prayers) {
  // Use the id contained in the current state to find the current prayer request
  var prayerId = $stateParams.id;
  $scope.prayer = Prayers.$getRecord(prayerId);

  // Load the comments array
  var commentsRef = new Firebase('https://im-praying.firebaseio.com/prayers/' + prayerId + '/comments');
  var Comments = $firebaseArray(commentsRef);
  $scope.comments = Comments;

  // Create and load the modal window
  $ionicModal.fromTemplateUrl(
    '/templates/pray.html',
    function(modal) {
      $scope.prayModal = modal;
    },

    {
      scope: $scope,
      animation: 'slide-in-up',
    }
  );

  $scope.openPrayModal = function() {
    this.comment = '';
    $scope.prayModal.show();
  };

  $scope.closePrayModal = function() {
    $scope.prayModal.hide();
  };

  $scope.addComment = function() {
    Comments.$add({
      user: 'commenter',
      content: this.comment,
      timestamp: Firebase.ServerValue.TIMESTAMP,
    });
    $scope.closePrayModal();
  };

  $scope.pray = function() {
    $scope.openPrayModal();
  };

  $scope.destroy = function() {
    Prayers.$remove(this.prayer);
    $ionicHistory.goBack();
  };
});
