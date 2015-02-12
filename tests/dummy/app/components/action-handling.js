import MetalComponent from 'ember-metal-views/metal-component';

export default MetalComponent.extend({
  didInsertElement: function() {
    console.log('didInsertElement!');
  },

  actions: {
    derp: function() {
      alert('you win!');
    },
    outsideAction: function() {
      this.sendAction('outsideAction');
    }
  }
});
