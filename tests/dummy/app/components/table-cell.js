import MetalComponent from 'ember-metal-views/metal-component';

export default MetalComponent.extend({
  tagName: 'td',
  classNames: ['table-cell'],
  classNameBindings: ['isTableCell'],
  isTableCell: true
});
