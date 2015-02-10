import MetalComponent from 'ember-metal-views/metal-component';

export default MetalComponent.extend({
  actions: {
    derp: function() {
      alert('you win!');
    }
  }
});
