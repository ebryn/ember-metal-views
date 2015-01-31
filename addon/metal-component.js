import Ember from "ember";
import MetalView from "./metal-view";
import { extend } from "./utils";

var MetalComponent = MetalView.extend();

var MethodsFromEmberComponent = {
  _yield: Ember.Component.proto()._yield
};
extend(MetalComponent.prototype, MethodsFromEmberComponent);

export default MetalComponent;