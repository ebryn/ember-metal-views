/* jshint proto: true */
/* global CoreObject */

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

var metaFor = Ember.meta;
var finishPartial = Ember.Mixin.finishPartial;
var IS_BINDING = Ember.IS_BINDING;
var computed = Ember.computed;
var get = Ember.get;

CoreObject.create = function(props) {
  return new this(props);
};

CoreObject.reopenClass = function(props) {
  extend(this, props);
};

var isBindingCache = Object.create(null);

function isBinding(key) {
  if (isBindingCache[key]) { return true; }
  if (IS_BINDING.test(key)) {
    isBindingCache[key] = 1;
    return true;
  }
  return false;
}

var MetalView = CoreObject.extend({
  init: function(props) {
    this.isView = true;
    this.tagName = props.tagName || this.tagName /* FIXME: read off prototype */ || null;
    this.isVirtual = false;
    this.elementId = null;

    var meta = metaFor(this); // FIXME
    var proto = meta.proto;
    meta.proto = this; // Secret handshake to prevent observers firing during init

    var bindings = meta.bindings = meta.bindings || {};
    var possibleDesc;
    var desc;
    var keys = Object.keys(props);
    var key;
    for (var i = 0, l = keys.length; i < l; i++) {
      key = keys[i];
      if (isBinding(key)) {
        bindings[key] = props[key];
      } else {
        possibleDesc = this[key];
        desc = (possibleDesc !== null && typeof possibleDesc === 'object' && possibleDesc.isDescriptor) ? possibleDesc : undefined;
        if (desc) {
          desc.set(this, key, props[key]);
        } else {
          this[key] = props[key];
        }
      }
    }

    if (!this.isVirtual && !this.elementId) {
      this.elementId = Ember.guidFor(this);
    }

    finishPartial(this, meta);
    meta.proto = proto;
  }
});

MetalView.prototype.__ember_meta__ = metaFor(MetalView.prototype);
MetalView.prototype.__ember_meta__.proto = MetalView.prototype;

Ember.defineProperty(MetalView.prototype, 'parentView', computed('_parentView', function() {
  var parent = this._parentView;

  if (parent && parent.isVirtual) {
    return get(parent, 'parentView');
  } else {
    return parent;
  }
}));

function noop() {}

extend(MetalView.prototype, {

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

      if (view.propertyDidChange !== noop) { view.propertyDidChange('childViews'); }

      return childView;
    },

    invokeObserver: function(target, observer) {
      observer.call(target);
    }
  },

  propertyDidChange: noop,

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
  },

  __defineNonEnumerable: function(property) {
    this[property.name] = property.descriptor.value;
  },

  _wrapAsScheduled: Ember.View.proto()._wrapAsScheduled
});

var EmberViewModule = Ember.__loader.require('ember-views/views/view');

EmberViewModule.ViewKeywordSupport.apply(MetalView.prototype);
EmberViewModule.ViewStreamSupport.apply(MetalView.prototype);
EmberViewModule.ViewChildViewsSupport.apply(MetalView.prototype);
EmberViewModule.ViewContextSupport.apply(MetalView.prototype);
EmberViewModule.TemplateRenderingSupport.apply(MetalView.prototype);

var Evented = Ember.__loader.require('ember-runtime/mixins/evented')['default'];
Evented.apply(MetalView.prototype);

extend(MetalView, {
  classProps: ['classProps', 'isClass', 'isViewClass', 'isMethod', 'proto', 'create', 'extend', 'reopenClass'],
  isClass: true,
  isViewClass: true,
  isMethod: false,

  proto: function() {
    return MetalView.prototype;
  },

  // create: function(props) {
  //   return new this(props);
  // },

  extend: function(props) {
    var ParentClass = this.__proto__;
    var originalExtend = ParentClass.extend;
    var Subclass = originalExtend.call(this, props);
    var classProps = this.classProps;
    var key;
    for (var i = 0, l = classProps.length; i < l; i++) {
      key = classProps[i];
      Subclass[key] = this[key];
    }
    // Subclass.prototype = Ember.create(this.prototype);
    // if (props) { extend(Subclass.prototype, props); }
    return Subclass;
  },

  // reopenClass: function(props) {
  //   extend(this, props);
  // }
});

export default MetalView;
