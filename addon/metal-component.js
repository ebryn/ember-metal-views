import Ember from "ember";
import MetalView from "./metal-view";
import { extend } from "./utils";

var MetalComponent = MetalView.extend();

var MethodsFromEmberComponent = {
  _yield: Ember.Component.proto()._yield,
  sendAction: Ember.Component.proto().sendAction,
  send: Ember.Component.proto().send,
  _setupKeywords: Ember.Component.proto()._setupKeywords
};

var ComponentMixin = Ember.Mixin.create({
  init: function(props) {
    props.context = this;
    props.controller = this;
    this._super(props);
    this._keywords.view = this;
  },

  targetObject: Ember.Component.proto().targetObject
});

ComponentMixin.apply(MetalComponent.prototype);
extend(MetalComponent.prototype, MethodsFromEmberComponent);

export default MetalComponent;
