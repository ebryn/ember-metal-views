import Ember from 'ember';

export default Ember.Controller.extend({
  showTable: false,

  actions: {
    toggleTable: function() {
      this.toggleProperty('showTable');
    }
  }
});
