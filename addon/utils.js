export function extend(obj, props) {
  var keys = Ember.keys(props);
  var key;
  for (var i = 0, l = keys.length; i < l; i++) {
    key = keys[i];
    if (!props.hasOwnProperty(key)) { continue; }
    obj[key] = props[key];
  }
}