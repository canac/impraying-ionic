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
}).controller('PrayerCtrl', function($scope, $stateParams, $ionicHistory, $ionicModal, $firebaseArray, Prayers, Users, User) {
  // Use the id contained in the current state to find the current prayer request
  var prayerId = $stateParams.id;
  $scope.prayer = Prayers.$getRecord(prayerId);

  $scope.user = User.getUser();

  // Load the comments array
  var commentsRef = Prayers.$ref().child(prayerId).child('comments');
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

  // Return a user record based on its id
  $scope.lookupUser = function(id) {
    return Users.$getRecord(id);
  };

  $scope.addComment = function() {
    Comments.$add({
      author: $scope.user.id,
      content: this.comment,
      timestamp: Firebase.ServerValue.TIMESTAMP,
    });
    $scope.closePrayModal();
  };

  $scope.pray = function() {
    $scope.openPrayModal();
  };

  $scope.destroyPrayer = function() {
    Prayers.$remove(this.prayer);
    $ionicHistory.goBack();
  };

  $scope.destroyComment = function(comment) {
    Comments.$remove(comment);
  };

  // Determine whether or not the provided user is the currently logged in user
  $scope.isCurrentUser = function(user) {
    return user === $scope.user.id;
  };
});
