angular.module('controllers', ['angularMoment', 'ngOpenFB']).run(function($ionicPlatform, ngFB) {
  // Initalize the Facebook authentication module using LocalStorage instead of the default
  // SessionStorage for the token store to persist logins across sessions
  ngFB.init({ appId: 1641039379506767, tokenStore: window.localStorage });
}).controller('PrayersCtrl', function($scope, ngFB, Prayers) {
  // Initialize the scope variables
  $scope.prayers = Prayers;
  $scope.request = '';

  // Authenticate with Facebook
  $scope.facebookLogin = function() {
    ngFB.login(['public_profile']).then(function(response) {
      $scope.loggedIn = true;
      loadUser();
    });
  };

  $scope.facebookLogout = function() {
    ngFB.logout().then(function() {
      $scope.loggedIn = false;
    });
  };

  $scope.loggedIn = false;
  $scope.user = {};

  // Load information about the current user from Facebook
  var loadUser = function() {
    return ngFB.api({
      path: '/me',
      params: { fields: 'id,name' },
    }).then(function(user) {
      $scope.loggedIn = true;
      $scope.user = user;
      return user;
    }).catch(function(error) {
      $scope.loggedIn = false;
      $scope.user = {};
      return error;
    });
  };

  loadUser().catch(function() {
    $scope.facebookLogin();
  });

  // Create a new prayer request
  $scope.createPrayer = function() {
    Prayers.$add({
      user: {
        id: $scope.user.id,
        name: $scope.user.name,
      },
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

  $scope.destroyPrayer = function() {
    Prayers.$remove(this.prayer);
    $ionicHistory.goBack();
  };

  $scope.destroyComment = function(comment) {
    Comments.$remove(comment);
  };
});
