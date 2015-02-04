import Ember from "ember";
import MetalView from "./metal-view";
import { extend } from "./utils";

var MetalComponent = MetalView.extend();

var MethodsFromEmberComponent = {
  _yield: Ember.Component.proto()._yield
};

var ComponentMixin = Ember.Mixin.create({
  init: function(props) {
    props.context = this;
    props.controller = this;
    this._super(props);
    this._keywords.view = this;
  }
});

ComponentMixin.apply(MetalComponent.prototype);
extend(MetalComponent.prototype, MethodsFromEmberComponent);

export default MetalComponent;
