angular.module('controllers', ['angularMoment', 'ngOpenFB']).run(function($ionicPlatform, ngFB) {
  // Initalize the Facebook authentication module using LocalStorage instead of the default
  // SessionStorage for the token store to persist logins across sessions
  ngFB.init({ appId: 1641039379506767, tokenStore: window.localStorage });
}).controller('RootCtrl', function($scope, User) {
  $scope.user = User.getUser();

  $scope.getNotificationCount = function() {
    return $scope.user ? $scope.user.notifications.length : 0;
  };
}).controller('PrayersCtrl', function($scope, Prayers, Friends, Feeds, User) {
  // Initialize the scope variables
  $scope.request = '';
  $scope.facebookLogin = User.login;
  $scope.facebookLogout = User.logout;

  // Create a new prayer request
  $scope.createPrayer = function() {
    Prayers.$add({
      author: $scope.user.id,
      content: this.request,
      timestamp: Firebase.ServerValue.TIMESTAMP,
      comments: {},
    });

    // Clear the request in preparation for creating the next one
    this.request = '';
  };
}).controller('PrayerCtrl', function($scope, $stateParams, $ionicModal, $firebaseArray, $firebaseObject, Prayers, Notifications, Users, Friends, Feeds, User) {
  // Use the id contained in the current state to find the current prayer request
  var prayerId = $stateParams.id;
  var prayerRef = Prayers.$ref().child(prayerId);
  $scope.prayer = $firebaseObject(prayerRef);
  prayerRef.once('value', function(snap) {
    // Look up the prayer's author
    var authorRef = Users.$ref().child(snap.val().author);
    $scope.author = $firebaseObject(authorRef);
  });

  // Load the comments array
  var commentsRef = Prayers.$ref().child(prayerId).child('comments');
  var Comments = $firebaseArray(commentsRef);
  $scope.comments = Comments;

  $scope.createComment = function() {
    Comments.$add({
      author: $scope.user.id,
      prayer: prayerId,
      content: this.comment,
      timestamp: Firebase.ServerValue.TIMESTAMP,
    }).then(function(ref) {
      if ($scope.user.id === $scope.prayer.author) {
        // Do not notify when users comment on their own requests
        return;
      }

      var notificationsRef = Notifications.$ref().child($scope.prayer.author);
      var notifications = $firebaseArray(notificationsRef);
      notifications.$add({
        prayerId: prayerId,
        commentId: ref.key(),
      });
    });

    this.comment = '';
  };
}).controller('NotificationsCtrl', function($scope) {
});
