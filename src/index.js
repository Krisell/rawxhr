import BetterArguments from '@krisell/better-arguments'

/**
 * Simple wrapper for RAW XMLHttpRequest Ajax calls.
 * Martin Krisell 2018
 *
 * Normally, I use a more battle-tested Ajax-library like jQuery or Axios,
 * but sometimes Ajax-calls need to be sent with no additonal headers (e.g. a CSRF-token).
 * This library will send no headers (unless given explicitly) which also prevents
 * unecessary preflights and rejections by APIs.
 */
export default function RawXHR (...specs) {
  const options = BetterArguments.build({
    specs,
    defaultOptions: {
      method: 'get',
      contentType: 'json',
      responseType: 'json'
    },
    namedOptions: ['url', 'method', 'responseType']
  })

  /**
   * Initiate the XHR-object. Works in IE >= 10, which is enough for me.
   */
  const XMLHttpRequest = window.XMLHttpRequest
  const xhr = new XMLHttpRequest()
  xhr.open(options.method, options.url)

  if (options.responseType) {
    xhr.responseType = options.responseType
  }

  this.send = function (data) {
    return new Promise((resolve, reject) => {
      /**
       * Attach listener before the send-event is initiated.
       */
      xhr.onerror = () => reject(new Error('XHR request failed'))
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status >= 200 && xhr.status < 400) {
          let data = xhr.response
          if (options.responseType === 'json') {
            if (typeof data === 'string') {
              data = JSON.parse(data)
            }
          }

          return resolve(data)
        }

        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status >= 400) {
          reject(new Error('XHR request failed'))
        }
      }

      if (options.method.toLowerCase() === 'post') {
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8")
        xhr.send(param(data))
      } else {
        xhr.send()
      }
    })
  }
}

function param (data) {
  let params = []

  function add (key, value) {
    if (typeof value === 'function') {
      value = value()
    }

    if (value == null) { // Or undefined
      value = ''
    }

    params.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
  }

  function buildParams (prefix, obj) {
    var i, len, key;

    if (prefix) {
      if (Array.isArray(obj)) {
        for (i = 0, len = obj.length; i < len; i++) {
            buildParams(
                prefix + '[' + (typeof obj[i] === 'object' && obj[i] ? i : '') + ']',
                obj[i]
            );
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

      return params
  }

  return buildParams('', data).join('&')
}
