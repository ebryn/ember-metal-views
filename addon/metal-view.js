import Ember from 'ember';
import { extend } from './utils';

function detect(obj) {
  return obj.isViewClass || this._super(obj);
}

Ember.CoreView.reopenClass({
  detect: detect
});

Ember.View.reopenClass({
  detect: detect
});

function MetalView(props) {
  extend(this, {
    tagName: null
  });
  extend(this, props);
  console.log(this);
}

extend(MetalView.prototype, {
  isView: true,
  _childViews: [],

  // TODO: remove this
  currentState: {
    appendChild: function(view, childView, options) {
      var buffer = view.buffer;
      var _childViews = view._childViews;

      childView = view.createChildView(childView, options);
      if (!_childViews.length) { _childViews = view._childViews = _childViews.slice(); }
      _childViews.push(childView);

      if (!childView._morph) {
        buffer.pushChildView(childView);
      }

      view.propertyDidChange('childViews');

      return childView;
    },

    invokeObserver: function(target, observer) {
      observer.call(target);
    }
  },

  propertyDidChange: function() {},

  destroy: function() {
    // TODO: EmberObject#destroy stuff?

    if (!this.removedFromDOM && this._renderer) {
      this._renderer.remove(this, true);
    }

    // remove from parent if found. Don't call removeFromParent,
    // as removeFromParent will try to remove the element from
    // the DOM again.
    var parent = this._parentView;
    if (parent) { parent.removeChild(this); }

    this._transitionTo('destroying', false);

    return this;
  },

  destroyElement: function() {
    var state = this._state;
    if (state === 'destroying') {
      throw 'destroyElement'; // TODO
    }
    if (this._renderer) {
      this._renderer.remove(this, false);
    }
    return this;
  },

  _transitionTo: function(state) {
    this._state = state;
  }
});

var EmberViewPrototype = Ember.View.proto();
var MethodsFromEmberViewMixin = {
  render: EmberViewPrototype.render,
  appendChild: EmberViewPrototype.appendChild,
  createChildView: EmberViewPrototype.createChildView,
  _wrapAsScheduled: EmberViewPrototype._wrapAsScheduled,
  remove: EmberViewPrototype.remove,
};
extend(MetalView.prototype, MethodsFromEmberViewMixin);

extend(MetalView, {
  classProps: ['classProps', 'isViewClass', 'proto', 'create', 'extend', 'reopenClass'],
  isViewClass: true,

  proto: function() {
    return MetalView.prototype;
  },

  create: function(props) {
    return new this(props);
  },

  extend: function(props) {
    var ParentClass = this;
    var Subclass = function(props) { ParentClass.call(this, props); };
    Subclass.superclass = ParentClass;
    var classProps = ParentClass.classProps;
    var key;
    for (var i = 0, l = classProps.length; i < l; i++) {
      key = classProps[i];
      Subclass[key] = this[key];
    }
    Subclass.prototype = Ember.create(this.prototype);
    if (props) { extend(Subclass.prototype, props); }
    return Subclass;
  },

  reopenClass: function(props) {
    extend(this, props);
  }
});

export default MetalView;