"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/* formdata-polyfill. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */

/* global FormData self Blob File */

/* eslint-disable no-inner-declarations */
if (typeof Blob !== 'undefined' && (typeof FormData === 'undefined' || !FormData.prototype.keys)) {
  var ensureArgs = function ensureArgs(args, expected) {
    if (args.length < expected) {
      throw new TypeError("".concat(expected, " argument required, but only ").concat(args.length, " present."));
    }
  };
  /**
   * @param {string} name
   * @param {string | undefined} filename
   * @returns {[string, File|string]}
   */


  var normalizeArgs = function normalizeArgs(name, value, filename) {
    if (value instanceof Blob) {
      filename = filename !== undefined ? String(filename + '') : typeof value.name === 'string' ? value.name : 'blob';

      if (value.name !== filename || Object.prototype.toString.call(value) === '[object Blob]') {
        value = new File([value], filename);
      }

      return [String(name), value];
    }

    return [String(name), String(value)];
  }; // normalize line feeds for textarea
  // https://html.spec.whatwg.org/multipage/form-elements.html#textarea-line-break-normalisation-transformation


  var normalizeLinefeeds = function normalizeLinefeeds(value) {
    return value.replace(/\r?\n|\r/g, '\r\n');
  };
  /**
   * @template T
   * @param {ArrayLike<T>} arr
   * @param {{ (elm: T): void; }} cb
   */


  var each = function each(arr, cb) {
    for (var i = 0; i < arr.length; i++) {
      cb(arr[i]);
    }
  };

  var global = (typeof globalThis === "undefined" ? "undefined" : _typeof(globalThis)) === 'object' ? globalThis : (typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' ? window : (typeof self === "undefined" ? "undefined" : _typeof(self)) === 'object' ? self : void 0; // keep a reference to native implementation

  var _FormData = global.FormData; // To be monkey patched

  var _send = global.XMLHttpRequest && global.XMLHttpRequest.prototype.send;

  var _fetch = global.Request && global.fetch;

  var _sendBeacon = global.navigator && global.navigator.sendBeacon; // Might be a worker thread...


  var _match = global.Element && global.Element.prototype; // Unable to patch Request/Response constructor correctly #109
  // only way is to use ES6 class extend
  // https://github.com/babel/babel/issues/1966


  var stringTag = global.Symbol && Symbol.toStringTag; // Add missing stringTags to blob and files

  if (stringTag) {
    if (!Blob.prototype[stringTag]) {
      Blob.prototype[stringTag] = 'Blob';
    }

    if ('File' in global && !File.prototype[stringTag]) {
      File.prototype[stringTag] = 'File';
    }
  } // Fix so you can construct your own File


  try {
    new File([], ''); // eslint-disable-line
  } catch (a) {
    global.File = function File(b, d, c) {
      var blob = new Blob(b, c || {});
      var t = c && void 0 !== c.lastModified ? new Date(c.lastModified) : new Date();
      Object.defineProperties(blob, {
        name: {
          value: d
        },
        lastModified: {
          value: +t
        },
        toString: {
          value: function value() {
            return '[object File]';
          }
        }
      });

      if (stringTag) {
        Object.defineProperty(blob, stringTag, {
          value: 'File'
        });
      }

      return blob;
    };
  }

  var _escape = function _escape(str) {
    return str.replace(/\n/g, '%0A').replace(/\r/g, '%0D').replace(/"/g, '%22');
  };
  /**
   * @implements {Iterable}
   */


  var FormDataPolyfill =
  /*#__PURE__*/
  function () {
    /**
     * FormData class
     *
     * @param {HTMLFormElement=} form
     */
    function FormDataPolyfill(form) {
      _classCallCheck(this, FormDataPolyfill);

      /** @type {[string, string|File][]} */
      this._data = [];
      var self = this;
      form && each(form.elements, function (
      /** @type {HTMLInputElement} */
      elm) {
        if (!elm.name || elm.disabled || elm.type === 'submit' || elm.type === 'button' || elm.matches('form fieldset[disabled] *')) return;

        if (elm.type === 'file') {
          var files = elm.files && elm.files.length ? elm.files : [new File([], '', {
            type: 'application/octet-stream'
          })]; // #78

          each(files, function (file) {
            self.append(elm.name, file);
          });
        } else if (elm.type === 'select-multiple' || elm.type === 'select-one') {
          each(elm.options, function (opt) {
            !opt.disabled && opt.selected && self.append(elm.name, opt.value);
          });
        } else if (elm.type === 'checkbox' || elm.type === 'radio') {
          if (elm.checked) self.append(elm.name, elm.value);
        } else {
          var value = elm.type === 'textarea' ? normalizeLinefeeds(elm.value) : elm.value;
          self.append(elm.name, value);
        }
      });
    }
    /**
     * Append a field
     *
     * @param   {string}           name      field name
     * @param   {string|Blob|File} value     string / blob / file
     * @param   {string=}          filename  filename to use with blob
     * @return  {undefined}
     */


    _createClass(FormDataPolyfill, [{
      key: "append",
      value: function append(name, value, filename) {
        ensureArgs(arguments, 2);

        this._data.push(normalizeArgs(name, value, filename));
      }
      /**
       * Delete all fields values given name
       *
       * @param   {string}  name  Field name
       * @return  {undefined}
       */

    }, {
      key: "delete",
      value: function _delete(name) {
        ensureArgs(arguments, 1);
        var result = [];
        name = String(name);
        each(this._data, function (entry) {
          entry[0] !== name && result.push(entry);
        });
        this._data = result;
      }
      /**
       * Iterate over all fields as [name, value]
       *
       * @return {Iterator}
       */

    }, {
      key: "entries",
      value:
      /*#__PURE__*/
      regeneratorRuntime.mark(function entries() {
        var i;
        return regeneratorRuntime.wrap(function entries$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                i = 0;

              case 1:
                if (!(i < this._data.length)) {
                  _context.next = 7;
                  break;
                }

                _context.next = 4;
                return this._data[i];

              case 4:
                i++;
                _context.next = 1;
                break;

              case 7:
              case "end":
                return _context.stop();
            }
          }
        }, entries, this);
      })
      /**
       * Iterate over all fields
       *
       * @param   {Function}  callback  Executed for each item with parameters (value, name, thisArg)
       * @param   {Object=}   thisArg   `this` context for callback function
       */

    }, {
      key: "forEach",
      value: function forEach(callback, thisArg) {
        ensureArgs(arguments, 1);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _step$value = _slicedToArray(_step.value, 2),
                name = _step$value[0],
                value = _step$value[1];

            callback.call(thisArg, value, name, this);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
      /**
       * Return first field value given name
       * or null if non existent
       *
       * @param   {string}  name      Field name
       * @return  {string|File|null}  value Fields value
       */

    }, {
      key: "get",
      value: function get(name) {
        ensureArgs(arguments, 1);
        var entries = this._data;
        name = String(name);

        for (var i = 0; i < entries.length; i++) {
          if (entries[i][0] === name) {
            return entries[i][1];
          }
        }

        return null;
      }
      /**
       * Return all fields values given name
       *
       * @param   {string}  name  Fields name
       * @return  {Array}         [{String|File}]
       */

    }, {
      key: "getAll",
      value: function getAll(name) {
        ensureArgs(arguments, 1);
        var result = [];
        name = String(name);
        each(this._data, function (data) {
          data[0] === name && result.push(data[1]);
        });
        return result;
      }
      /**
       * Check for field name existence
       *
       * @param   {string}   name  Field name
       * @return  {boolean}
       */

    }, {
      key: "has",
      value: function has(name) {
        ensureArgs(arguments, 1);
        name = String(name);

        for (var i = 0; i < this._data.length; i++) {
          if (this._data[i][0] === name) {
            return true;
          }
        }

        return false;
      }
      /**
       * Iterate over all fields name
       *
       * @return {Iterator}
       */

    }, {
      key: "keys",
      value:
      /*#__PURE__*/
      regeneratorRuntime.mark(function keys() {
        var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _step2$value, name;

        return regeneratorRuntime.wrap(function keys$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context2.prev = 3;
                _iterator2 = this[Symbol.iterator]();

              case 5:
                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                  _context2.next = 12;
                  break;
                }

                _step2$value = _slicedToArray(_step2.value, 1), name = _step2$value[0];
                _context2.next = 9;
                return name;

              case 9:
                _iteratorNormalCompletion2 = true;
                _context2.next = 5;
                break;

              case 12:
                _context2.next = 18;
                break;

              case 14:
                _context2.prev = 14;
                _context2.t0 = _context2["catch"](3);
                _didIteratorError2 = true;
                _iteratorError2 = _context2.t0;

              case 18:
                _context2.prev = 18;
                _context2.prev = 19;

                if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                  _iterator2["return"]();
                }

              case 21:
                _context2.prev = 21;

                if (!_didIteratorError2) {
                  _context2.next = 24;
                  break;
                }

                throw _iteratorError2;

              case 24:
                return _context2.finish(21);

              case 25:
                return _context2.finish(18);

              case 26:
              case "end":
                return _context2.stop();
            }
          }
        }, keys, this, [[3, 14, 18, 26], [19,, 21, 25]]);
      })
      /**
       * Overwrite all values given name
       *
       * @param   {string}    name      Filed name
       * @param   {string}    value     Field value
       * @param   {string=}   filename  Filename (optional)
       */

    }, {
      key: "set",
      value: function set(name, value, filename) {
        ensureArgs(arguments, 2);
        name = String(name);
        /** @type {[string, string|File][]} */

        var result = [];
        var args = normalizeArgs(name, value, filename);
        var replace = true; // - replace the first occurrence with same name
        // - discards the remaining with same name
        // - while keeping the same order items where added

        each(this._data, function (data) {
          data[0] === name ? replace && (replace = !result.push(args)) : result.push(data);
        });
        replace && result.push(args);
        this._data = result;
      }
      /**
       * Iterate over all fields
       *
       * @return {Iterator}
       */

    }, {
      key: "values",
      value:
      /*#__PURE__*/
      regeneratorRuntime.mark(function values() {
        var _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _step3$value, value;

        return regeneratorRuntime.wrap(function values$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _iteratorNormalCompletion3 = true;
                _didIteratorError3 = false;
                _iteratorError3 = undefined;
                _context3.prev = 3;
                _iterator3 = this[Symbol.iterator]();

              case 5:
                if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                  _context3.next = 12;
                  break;
                }

                _step3$value = _slicedToArray(_step3.value, 2), value = _step3$value[1];
                _context3.next = 9;
                return value;

              case 9:
                _iteratorNormalCompletion3 = true;
                _context3.next = 5;
                break;

              case 12:
                _context3.next = 18;
                break;

              case 14:
                _context3.prev = 14;
                _context3.t0 = _context3["catch"](3);
                _didIteratorError3 = true;
                _iteratorError3 = _context3.t0;

              case 18:
                _context3.prev = 18;
                _context3.prev = 19;

                if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
                  _iterator3["return"]();
                }

              case 21:
                _context3.prev = 21;

                if (!_didIteratorError3) {
                  _context3.next = 24;
                  break;
                }

                throw _iteratorError3;

              case 24:
                return _context3.finish(21);

              case 25:
                return _context3.finish(18);

              case 26:
              case "end":
                return _context3.stop();
            }
          }
        }, values, this, [[3, 14, 18, 26], [19,, 21, 25]]);
      })
      /**
       * Return a native (perhaps degraded) FormData with only a `append` method
       * Can throw if it's not supported
       *
       * @return {FormData}
       */

    }, {
      key: '_asNative',
      value: function _asNative() {
        var fd = new _FormData();
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = this[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _step4$value = _slicedToArray(_step4.value, 2),
                name = _step4$value[0],
                value = _step4$value[1];

            fd.append(name, value);
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
              _iterator4["return"]();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }

        return fd;
      }
      /**
       * [_blob description]
       *
       * @return {Blob} [description]
       */

    }, {
      key: '_blob',
      value: function _blob() {
        var boundary = '----formdata-polyfill-' + Math.random(),
            chunks = [],
            p = "--".concat(boundary, "\r\nContent-Disposition: form-data; name=\"");
        this.forEach(function (value, name) {
          return typeof value == 'string' ? chunks.push(p + _escape(normalizeLinefeeds(name)) + "\"\r\n\r\n".concat(normalizeLinefeeds(value), "\r\n")) : chunks.push(p + _escape(normalizeLinefeeds(name)) + "\"; filename=\"".concat(_escape(value.name), "\"\r\nContent-Type: ").concat(value.type || "application/octet-stream", "\r\n\r\n"), value, "\r\n");
        });
        chunks.push("--".concat(boundary, "--"));
        return new Blob(chunks, {
          type: "multipart/form-data; boundary=" + boundary
        });
      }
      /**
       * The class itself is iterable
       * alias for formdata.entries()
       *
       * @return {Iterator}
       */

    }, {
      key: Symbol.iterator,
      value: function value() {
        return this.entries();
      }
      /**
       * Create the default string description.
       *
       * @return  {string} [object FormData]
       */

    }, {
      key: "toString",
      value: function toString() {
        return '[object FormData]';
      }
    }]);

    return FormDataPolyfill;
  }();

  if (_match && !_match.matches) {
    _match.matches = _match.matchesSelector || _match.mozMatchesSelector || _match.msMatchesSelector || _match.oMatchesSelector || _match.webkitMatchesSelector || function (s) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(s);
      var i = matches.length;

      while (--i >= 0 && matches.item(i) !== this) {}

      return i > -1;
    };
  }

  if (stringTag) {
    /**
     * Create the default string description.
     * It is accessed internally by the Object.prototype.toString().
     */
    FormDataPolyfill.prototype[stringTag] = 'FormData';
  } // Patch xhr's send method to call _blob transparently


  if (_send) {
    var setRequestHeader = global.XMLHttpRequest.prototype.setRequestHeader;

    global.XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
      setRequestHeader.call(this, name, value);
      if (name.toLowerCase() === 'content-type') this._hasContentType = true;
    };

    global.XMLHttpRequest.prototype.send = function (data) {
      // need to patch send b/c old IE don't send blob's type (#44)
      if (data instanceof FormDataPolyfill) {
        var blob = data['_blob']();
        if (!this._hasContentType) this.setRequestHeader('Content-Type', blob.type);

        _send.call(this, blob);
      } else {
        _send.call(this, data);
      }
    };
  } // Patch fetch's function to call _blob transparently


  if (_fetch) {
    global.fetch = function (input, init) {
      if (init && init.body && init.body instanceof FormDataPolyfill) {
        init.body = init.body['_blob']();
      }

      return _fetch.call(this, input, init);
    };
  } // Patch navigator.sendBeacon to use native FormData


  if (_sendBeacon) {
    global.navigator.sendBeacon = function (url, data) {
      if (data instanceof FormDataPolyfill) {
        data = data['_asNative']();
      }

      return _sendBeacon.call(this, url, data);
    };
  }

  global['FormData'] = FormDataPolyfill;
}