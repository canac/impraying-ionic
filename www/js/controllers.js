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
      // This function will add the prayer request to the given user's feed
      var addToFeed = function(userId) {
        feedsRootRef.child(userId).child(ref.key()).set(true);
      };

      // Add the prayer request to all of the user's friends' feeds
      var feedsRootRef = Feeds.$ref();
      var friendsRef = Friends.$ref().child($scope.user.id);
      friendsRef.once('value', function(snap) {
        snap.forEach(function(friend) {
          addToFeed(friend.key());
        });
      });

      // Add it to the user's own feed
      addToFeed($scope.user.id);
    });

    // Clear the request in preparation for creating the next one
    this.request = '';
  };
}).controller('PrayerCtrl', function($scope, $stateParams, $ionicHistory, $ionicModal, $firebaseArray, $firebaseObject, Prayers, Users, Friends, Feeds, User) {
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

  $scope.pray = function() {};

  $scope.destroyPrayer = function() {
    // Destroy the prayer itself
    var destroyedPrayer = this.prayer;
    Prayers.$remove(destroyedPrayer);

    // This function will remove the prayer request from the given user's feed
    var removeFromFeed = function(userId) {
      feedsRootRef.child(userId).child(destroyedPrayer.$id).remove();
    };

    // Remove the prayer request from all of the user's friends' feeds
    var feedsRootRef = Feeds.$ref();
    var friendsRef = Friends.$ref().child($scope.user.id);
    friendsRef.once('value', function(snap) {
      snap.forEach(function(friend) {
        removeFromFeed(friend.key());
      });
    });

    // Remove it remove from the user's own feed
    removeFromFeed($scope.user.id);

    $ionicHistory.goBack();
  };
});
