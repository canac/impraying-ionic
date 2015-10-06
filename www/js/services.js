angular.module('services', []).factory('Prayers', function($firebaseArray, Friends, Feeds) {
  var prayersRef = new Firebase('https://im-praying.firebaseio.com/prayers');

  // Watch for added prayers
  prayersRef.on('child_added', function(snap) {
    updateFeeds(snap, function(feedRef) {
      // Mark the prayer as in this feed
      feedRef.set(true);
    });
  });

  // Watch for destroyed prayers
  prayersRef.on('child_removed', function(snap) {
    updateFeeds(snap, function(feedRef) {
      // Mark the prayer as not in this feed
      feedRef.remove();
    });
  });

  // This generically updates a prayer's status in all of its author's friend's feeds
  // The callback is called once for every reference to the prayer in any user's feed
  var updateFeeds = function(prayerSnap, callback) {
    var prayerId = prayerSnap.key();
    var authorId = prayerSnap.val().author;

    // Call the callback for the prayer request's entry in all of its author's friends' feeds
    var feedsRootRef = Feeds.$ref();
    var friendsRef = Friends.$ref().child(authorId);
    friendsRef.once('value', function(snap) {
      snap.forEach(function(friend) {
        var userId = friend.key();
        var feedRef = feedsRootRef.child(userId).child(prayerId);
        callback(feedRef);
      });
    });
  };

  return $firebaseArray(prayersRef);
}).factory('Notifications', function($firebaseArray) {
  var notificationsRef = new Firebase('https://im-praying.firebaseio.com/notifications');
  return $firebaseArray(notificationsRef);
}).factory('Users', function($firebaseArray) {
  var usersRef = new Firebase('https://im-praying.firebaseio.com/users');
  return $firebaseArray(usersRef);
}).factory('Friends', function($firebaseArray) {
  var friendsRef = new Firebase('https://im-praying.firebaseio.com/friends');
  return $firebaseArray(friendsRef);
}).factory('Feeds', function($firebaseArray) {
  var feedsRef = new Firebase('https://im-praying.firebaseio.com/feeds');
  return $firebaseArray(feedsRef);
}).service('User', function(ngFB, $q, $firebaseArray, Notifications, Users, Friends, Feeds) {
  var User = {};

  // Authenticate with Facebook
  User.login = function() {
    ngFB.login({ scope: 'public_profile,user_friends' }).then(function(response) {
      loadProfile();
    });
  };

  // Unauthenticate with Facebook
  User.logout = function() {
    ngFB.logout().then(function() {
      setUser(null);
    });
  };

  // Return an object representing the currently logged in user
  User.getUser = function() {
    return currentUser;
  };

  // Represents the currently logged in user
  // The "id" property is the user's Facebook user ID, the "name" property is the user's Facebook
  // name, and the "loggedIn" boolean property is true only if the user is logged in
  var currentUser = {
    // Determine whether or not the provided user is the currently logged in user
    isCurrentUser: function(userId) {
      return userId === currentUser.id;
    },
  };

  // Set the current user to the provided object which either contains properties for the user's id
  // and name or is null to represent an unlogged in
  var setUser = function(user) {
    if (user === null) {
      currentUser.id = null;
      currentUser.name = null;
      currentUser.loggedIn = false;
      currentUser.feed = [];
      currentUser.notifications = [];
    } else {
      currentUser.id = user.id;
      currentUser.name = user.name;
      currentUser.loggedIn = true;

      var feedRef = Feeds.$ref().child(user.id);
      currentUser.feed = $firebaseArray(feedRef);

      var notificationsRef = Notifications.$ref().child(user.id);
      currentUser.notifications = $firebaseArray(notificationsRef);
    }
  };

  // Load information about the current user from Facebook
  var loadProfile = function() {
    return ngFB.api({
      path: '/me',
      params: { fields: 'id,name,friends{id}' },
    }).then(function(user) {
      setUser(user);

      // Add the user to the Users array or update the existing record
      Users.$ref().child(user.id).update({
        name: user.name,
      });

      if (user.friends) {
        // Update the list of this user's friends
        var userFriendsRef = Friends.$ref().child(user.id);
        var friends = {};
        user.friends.data.forEach(function(friend) {
          friends[friend.id] = true;
        });

        // Add the user to their own friends list
        friends[user.id] = true;

        Friends.$ref().child(user.id).set(friends);
      }

      return user;
    }).catch(function(error) {
      setUser(null);
      return error;
    });
  };

  // Start out as logged out, then try to load the user's profile, and try to login if that fails
  setUser(null);
  loadProfile().catch(function() {
    User.login();
  });

  return User;
});
