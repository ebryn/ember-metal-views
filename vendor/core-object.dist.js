(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var CoreObject = require('./core-object');

window.CoreObject = CoreObject;

},{"./core-object":2}],2:[function(require,module,exports){
'use strict';

var assignProperties = require('./lib/assign-properties');

function CoreObject(options) {
  this.init(options);
}

CoreObject.prototype.init = function(options) {
  if (options) {
    for (var key in options) {
      this[key] = options[key];
    }
  }
};

module.exports = CoreObject;

CoreObject.extend = function(options) {
  var constructor = this;

  function Class() {
    var length = arguments.length;

    if (length === 0)      this.init();
    else if (length === 1) this.init(arguments[0]);
    else                   this.init.apply(this, arguments);
  }

  Class.__proto__ = CoreObject;

  Class.prototype = Object.create(constructor.prototype);
  if (options) assignProperties(Class.prototype, options);

  return Class;
};

},{"./lib/assign-properties":3}],3:[function(require,module,exports){
function giveMethodSuper(target, fn) {
  return function() {
    var previous = this._super;
    this._super = target;
    var ret;
    if (arguments.length === 0) {
      ret = fn.call(this);
    } else if (arguments.length === 1) {
      ret = fn.call(this, arguments[0]);
    } else {
      ret = fn.apply(this, arguments);
    }
    this._super = previous;
    return ret;
  };
}

var sourceAvailable = (function() {
  return this;
}).toString().indexOf('return this;') > -1;

var hasSuper;
if (sourceAvailable) {
  hasSuper = function(fn) {
    if (fn.__hasSuper === undefined) {
     return fn.__hasSuper = fn.toString().indexOf('_super') > -1;
    } else {
     return fn.__hasSuper;
    }
  }
} else {
  hasSuper = function(target, fn) {
    return true;
  }
}

function assignProperties(target, options) {
  var value;

  for (var key in options) {
    value = options[key];

    if (typeof value === 'function' &&
        hasSuper(value)) {
      if (typeof target[key] === 'function') {
        target[key] = giveMethodSuper(target[key], value);
      } else {
        target[key] = giveMethodSuper(function() { }, value);
      }
    } else {
      target[key] = value;
    }
  }
}

module.exports = assignProperties;

},{}]},{},[1]);
