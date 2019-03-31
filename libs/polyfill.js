var reduce = Function.bind.call(Function.call, Array.prototype.reduce);
var isEnumerable = Function.bind.call(Function.call, Object.prototype.propertyIsEnumerable);
var concat = Function.bind.call(Function.call, Array.prototype.concat);
var keys = Reflect.ownKeys;

if (!Object.values) {
	Object.values = function values(O) {
		return reduce(keys(O), (v, k) => concat(v, typeof k === 'string' && isEnumerable(O, k) ? [O[k]] : []), []);
	};
}

if (!Object.entries) {
	Object.entries = function entries(O) {
		return reduce(keys(O), (e, k) => concat(e, typeof k === 'string' && isEnumerable(O, k) ? [[k, O[k]]] : []), []);
	};
}

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
	Object.keys = (function() {
	  'use strict';
	  var hasOwnProperty = Object.prototype.hasOwnProperty,
		  hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
		  dontEnums = [
			'toString',
			'toLocaleString',
			'valueOf',
			'hasOwnProperty',
			'isPrototypeOf',
			'propertyIsEnumerable',
			'constructor'
		  ],
		  dontEnumsLength = dontEnums.length;
  
	  return function(obj) {
		if (typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
		  throw new TypeError('Object.keys called on non-object');
		}
  
		var result = [], prop, i;
  
		for (prop in obj) {
		  if (hasOwnProperty.call(obj, prop)) {
			result.push(prop);
		  }
		}
  
		if (hasDontEnumBug) {
		  for (i = 0; i < dontEnumsLength; i++) {
			if (hasOwnProperty.call(obj, dontEnums[i])) {
			  result.push(dontEnums[i]);
			}
		  }
		}
		return result;
	  };
	}());
  }