export default Ember.Route.extend({
  model: function() {
    var rows = [];
    for (var i = 0, l = 10000; i < l; i++) {
      rows[i] = {name: "Row #" + (i+1)};
    }

    console.profile();

    return {
      boundThree: 3,
      rows: rows
    };
  }
})
