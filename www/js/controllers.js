angular.module('controllers', ['angularMoment', 'ngOpenFB']).run(function($ionicPlatform, ngFB) {
  // Initalize the Facebook authentication module using LocalStorage instead of the default
  // SessionStorage for the token store to persist logins across sessions
  ngFB.init({ appId: 1641039379506767, tokenStore: window.localStorage });
}).controller('PrayersCtrl', function($scope, Prayers, Friends, Feeds, User) {
  // Initialize the scope variables
  $scope.request = '';
  $scope.user = User.getUser();
  $scope.facebookLogin = User.login;
  $scope.facebookLogout = User.logout;

  // Create a new prayer request
  $scope.createPrayer = function() {
    Prayers.$add({
      author: $scope.user.id,
      content: this.request,
      timestamp: Firebase.ServerValue.TIMESTAMP,
      comments: {},
    }).then(function(ref) {
      // Add the prayer request to all of the user's friends' feeds
      var feedsRootRef = Feeds.$ref();
      var friendsRef = Friends.$ref().child($scope.user.id);
      friendsRef.once('value', function(snap) {
        snap.forEach(function(friend) {
          var userId = friend.key();
          feedsRootRef.child(userId).child(ref.key()).set(true);
        });
      });
    });

    // Clear the request in preparation for creating the next one
    this.request = '';
  };

  // Watch for destroyed prayers
  var prayersRef = Prayers.$ref();
  prayersRef.on('child_removed', function(snap) {
    var prayerId = snap.key();

    // Remove the prayer request from all of the user's friends' feeds
    var feedsRootRef = Feeds.$ref();
    var friendsRef = Friends.$ref().child($scope.user.id);
    friendsRef.once('value', function(snap) {
      snap.forEach(function(friend) {
        var userId = friend.key();
        feedsRootRef.child(userId).child(prayerId).remove();
      });
    });
  });
}).controller('PrayerCtrl', function($scope, $stateParams, $ionicModal, $firebaseArray, $firebaseObject, Prayers, Users, Friends, Feeds, User) {
  // Use the id contained in the current state to find the current prayer request
  var prayerId = $stateParams.id;
  var prayerRef = Prayers.$ref().child(prayerId);
  $scope.prayer = $firebaseObject(prayerRef);
  prayerRef.once('value', function(snap) {
    // Look up the prayer's author
    var authorRef = Users.$ref().child(snap.val().author);
    $scope.author = $firebaseObject(authorRef);
  });

  $scope.user = User.getUser();

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
    });
    this.comment = '';
  };
});
