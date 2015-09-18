angular.module('services', []).factory('Prayers', function($firebaseArray) {
  var prayersRef = new Firebase('https://im-praying.firebaseio.com/prayers');
  return $firebaseArray(prayersRef);
});
