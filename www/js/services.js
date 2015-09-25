angular.module('services', []).factory('Prayers', function($firebaseArray) {
  var prayersRef = new Firebase('https://im-praying.firebaseio.com/prayers');
  return $firebaseArray(prayersRef);
}).factory('Users', function($firebaseArray) {
  var usersRef = new Firebase('https://im-praying.firebaseio.com/users');
  return $firebaseArray(usersRef);
}).service('User', function(ngFB, Users) {
  var User = {};

  // Authenticate with Facebook
  User.login = function() {
    ngFB.login(['public_profile']).then(function(response) {
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
  var currentUser = {};

  // Set the current user to the provided object which either contains properties for the user's id
  // and name or is null to represent an unlogged in
  var setUser = function(user) {
    if (user === null) {
      currentUser.id = null;
      currentUser.name = null;
      currentUser.loggedIn = false;
    } else {
      currentUser.id = user.id;
      currentUser.name = user.name;
      currentUser.loggedIn = true;

      // Add the user to the Users array or update the existng record
      Users.$ref().child(user.id).update({
        name: user.name,
      });
    }
  };

  // Load information about the current user from Facebook
  var loadProfile = function() {
    return ngFB.api({
      path: '/me',
      params: { fields: 'id,name' },
    }).then(function(user) {
      setUser(user);
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
