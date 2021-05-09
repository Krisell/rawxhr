"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = RawXHR;

var _betterArguments = _interopRequireDefault(require("@krisell/better-arguments"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * Simple wrapper for RAW XMLHttpRequest Ajax calls.
 * Martin Krisell 2018
 *
 * Normally, I use a more battle-tested Ajax-library like jQuery or Axios,
 * but sometimes Ajax-calls need to be sent with no additonal headers (e.g. a CSRF-token).
 * This library will send no headers (unless given explicitly) which also prevents
 * unecessary preflights and rejections by APIs.
 */
function RawXHR() {
  for (var _len = arguments.length, specs = new Array(_len), _key = 0; _key < _len; _key++) {
    specs[_key] = arguments[_key];
  }

  var options = _betterArguments["default"].build({
    specs: specs,
    defaultOptions: {
      method: 'get',
      contentType: 'json',
      responseType: 'json'
    },
    namedOptions: ['url', 'method', 'responseType']
  });
  /**
   * Initiate the XHR-object. Works in IE >= 10, which is enough for me.
   */


  var XMLHttpRequest = window.XMLHttpRequest;
  var xhr = new XMLHttpRequest();
  xhr.open(options.method, options.url);

  if (options.responseType) {
    xhr.responseType = options.responseType;
  }

  this.send = function (data) {
    return new Promise(function (resolve, reject) {
      /**
       * Attach listener before the send-event is initiated.
       */
      xhr.onerror = function () {
        return reject(new Error('XHR request failed'));
      };

      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status >= 200 && xhr.status < 400) {
          var _data = xhr.response;

          if (options.responseType === 'json') {
            if (typeof _data === 'string') {
              _data = JSON.parse(_data);
            }
          }

          return resolve(_data);
        }

        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status >= 400) {
          reject(new Error('XHR request failed'));
        }
      };

      if (options.method.toLowerCase() === 'post') {
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
        xhr.send(param(data));
      } else {
        xhr.send();
      }
    });
  };
}

function param(data) {
  var params = [];

  function add(key, value) {
    if (typeof value === 'function') {
      value = value();
    }

    if (value == null) {
      // Or undefined
      value = '';
    }

    params.push("".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(value)));
  }

  function buildParams(prefix, obj) {
    var i, len, key;

    if (prefix) {
      if (Array.isArray(obj)) {
        for (i = 0, len = obj.length; i < len; i++) {
          buildParams(prefix + '[' + (_typeof(obj[i]) === 'object' && obj[i] ? i : '') + ']', obj[i]);
        }
      } else if (String(obj) === '[object Object]') {
        for (key in obj) {
          buildParams(prefix + '[' + key + ']', obj[key]);
        }
      } else {
        add(prefix, obj);
      }
    } else if (Array.isArray(obj)) {
      for (i = 0, len = obj.length; i < len; i++) {
        add(obj[i].name, obj[i].value);
      }
    } else {
      for (key in obj) {
        buildParams(key, obj[key]);
      }
    }

    return params;
  }

  return buildParams('', data).join('&');
}