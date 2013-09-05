/**
 * @license  OpenTok JavaScript Library @version@
 * http://www.tokbox.com/
 *
 * Copyright (c) 2013 TokBox, Inc.
 *
 * Date: @build_time@
 */

(function(window) {
if (!window.OT) window.OT = {};

OT.properties = {
  version: "v2.0.13.1",         // The current version (eg. v2.0.4) (This is replaced by gradle)
  build: "21a8a64",    // The current build hash (This is replaced by gradle)
  debug: "false",      // Whether or not to turn on debug logging by default
  websiteURL: "http://www.tokbox.com",      // The URL of the tokbox website

  cdnURL: "http://static.opentok.com",        // The URL of the CDN
  loggingURL: "http://hlg.tokbox.com/prod",   // The URL to use for logging
  apiURL: "http://anvil.opentok.com",          // The anvil API URL
  
  messagingProtocol: "wss",         // What protocol to use when connecting to the rumor web socket
  messagingPort: 443,               // What port to use when connection to the rumor web socket

  supportSSL: "true",           // If this environment supports SSL
  cdnURLSSL: "https://swww.tokbox.com",         // The CDN to use if we're using SSL
  loggingURLSSL: "https://hlg.tokbox.com/prod",    // The loggging URL to use if we're using SSL
  apiURLSSL: "https://anvil.opentok.com"             // The anvil API URL to use if we're using SSL
};

})(window);
/*!
 *  This is a modified version of Robert Kieffer awesome uuid.js library.
 *  The only modifications we've made are to remove the Node.js specific
 *  parts of the code and the UUID version 1 generator (which we don't
 *  use). The original copyright notice is below.
 *
 *     node-uuid/uuid.js
 *
 *     Copyright (c) 2010 Robert Kieffer
 *     Dual licensed under the MIT and GPL licenses.
 *     Documentation and details at https://github.com/broofa/node-uuid
 */
(function() {
  var _global = this;

  // Unique ID creation requires a high quality random # generator, but
  // Math.random() does not guarantee "cryptographic quality".  So we feature
  // detect for more robust APIs, normalizing each method to return 128-bits
  // (16 bytes) of random data.
  var mathRNG, whatwgRNG;

  // Math.random()-based RNG.  All platforms, very fast, unknown quality
  var _rndBytes = new Array(16);
  mathRNG = function() {
    var r, b = _rndBytes, i = 0;

    for (i = 0; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      b[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return b;
  };

  // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
  // WebKit only (currently), moderately fast, high quality
  if (_global.crypto && crypto.getRandomValues) {
    var _rnds = new Uint32Array(4);
    whatwgRNG = function() {
      crypto.getRandomValues(_rnds);

      for (var c = 0 ; c < 16; c++) {
        _rndBytes[c] = _rnds[c >> 2] >>> ((c & 0x03) * 8) & 0xff;
      }
      return _rndBytes;
    };
  }

  // Select RNG with best quality
  var _rng = whatwgRNG || mathRNG;

  // Buffer class to use
  var BufferClass = typeof(Buffer) == 'function' ? Buffer : Array;

  // Maps for number <-> hex string conversion
  var _byteToHex = [];
  var _hexToByte = {};
  for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
  }

  // **`parse()` - Parse a UUID into it's component bytes**
  function parse(s, buf, offset) {
    var i = (buf && offset) || 0, ii = 0;

    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
      if (ii < 16) { // Don't overflow!
        buf[i + ii++] = _hexToByte[oct];
      }
    });

    // Zero out remaining bytes if string was short
    while (ii < 16) {
      buf[i + ii++] = 0;
    }

    return buf;
  }

  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
  function unparse(buf, offset) {
    var i = offset || 0, bth = _byteToHex;
    return  bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]];
  }

  // **`v4()` - Generate random UUID**

  // See https://github.com/broofa/node-uuid for API details
  function v4(options, buf, offset) {
    // Deprecated - 'format' argument, as supported in v1.2
    var i = buf && offset || 0;

    if (typeof(options) == 'string') {
      buf = options == 'binary' ? new BufferClass(16) : null;
      options = null;
    }
    options = options || {};

    var rnds = options.random || (options.rng || _rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ii++) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || unparse(rnds);
  }

  // Export public API
  var uuid = v4;
  uuid.v4 = v4;
  uuid.parse = parse;
  uuid.unparse = unparse;
  uuid.BufferClass = BufferClass;

  // Export RNG options
  uuid.mathRNG = mathRNG;
  uuid.whatwgRNG = whatwgRNG;

  // Play nice with browsers
  var _previousRoot = _global.uuid;

  // **`noConflict()` - (browser only) to reset global 'uuid' var**
  uuid.noConflict = function() {
    _global.uuid = _previousRoot;
    return uuid;
  };
  _global.uuid = uuid;
}());
// OT Helper Methods
//
// helpers.js                           <- the root file
// helpers/lib/{helper topic}.js        <- specialised helpers for specific tasks/topics
//                                          (i.e. video, dom, etc)
//
// @example Getting a DOM element by it's id
//  var element = OT.$('domId');
//
// @example Testing for web socket support
//  if (OT.supportsWebSockets()) {
//      // do some stuff with websockets
//  }
//
!(function(window) {

if (!window.OT) window.OT = {};


OT.$ = function(domId) {
    return document.getElementById(domId);
};


OT.$.isEmpty = function(obj) {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof(obj) === 'string') return obj.length === 0;

  // Objects without enumerable owned properties are empty.
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }

  return true;
};


OT.$.isObject = function(obj) {
  return obj === Object(obj);
};


OT.$.isFunction = function(obj) {
    return typeof obj === 'function';
};

// Extend a target object with the properties from one or
// more source objects
//
// @example:
//    dest = OT.$.extend(dest, source1, source2, source3);
//
OT.$.extend = function(/* dest, source1[, source2, ..., , sourceN]*/) {
    var sources = Array.prototype.slice.call(arguments),
        dest = sources.shift();

    sources.forEach(function(source) {
        for (var key in source) {
            dest[key] = source[key];
        }
    });

    return dest;
};

// Ensures that the target object contains certain defaults.
//
// @example
//   var options = OT.$.defaults(options, {
//     loading: true     // loading by default
//   });
//
OT.$.defaults = function(/* dest, defaults1[, defaults2, ..., , defaultsN]*/) {
    var sources = Array.prototype.slice.call(arguments),
        dest = sources.shift();

    sources.forEach(function(source) {
        for (var key in source) {
            if (dest[key] === void 0) dest[key] = source[key];
        }
    });

    return dest;
};

//
OT.$.clone = function(obj) {
    if (!OT.$.isObject(obj)) return obj;
    return Array.isArray(obj) ? obj.slice() : OT.$.extend({}, obj);
};



// Handy do nothing function
OT.$.noop = function() {};

// Returns true if the client supports WebSockets, false otherwise.
OT.$.supportsWebSockets = function() {
    return 'WebSocket' in window;
};

// Returns the number of millisceonds since the the UNIX epoch, this is functionally
// equivalent to executing new Date().getTime().
//
// Where available, we use 'performance.now' which is more accurate and reliable,
// otherwise we default to new Date().getTime().
OT.$.now = (function() {
    var performance = window.performance || {},
        navigationStart,
        now =  performance.now       ||
               performance.mozNow    ||
               performance.msNow     ||
               performance.oNow      ||
               performance.webkitNow;

    if (now) {
        now = now.bind(performance);
        navigationStart = performance.timing.navigationStart;

        return  function() { return navigationStart + now(); };
    }
    else {
        return function() { return new Date().getTime(); };
    }
})();

OT.$.browser = function() {
    var userAgent = window.navigator.userAgent.toLowerCase(),
        navigatorVendor,
        browser = 'Unknown';

    if (userAgent.indexOf('firefox') > -1)   {
        browser = 'Firefox';
    }
    if (userAgent.indexOf('opera') > -1)   {
        browser = 'Opera';
    }
    else if (userAgent.indexOf("msie") > -1) {
        browser = "IE";
    }
    else if (userAgent.indexOf("chrome") > -1) {
        browser = "Chrome";
    }

    if ((navigatorVendor = window.navigator.vendor) && navigatorVendor.toLowerCase().indexOf("apple") > -1) {
        browser = "Safari";
    }

    userAgent = null;
    OT.$.browser = function() { return browser; };
    return browser;
};


OT.$.canDefineProperty = true;

try {
    Object.defineProperty({}, 'x', {});
} catch (err) {
    OT.$.canDefineProperty = false;
}


// Polyfill Object.create for IE8
//
// See https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/create
//
if (!Object.create) {
    Object.create = function (o) {
        if (arguments.length > 1) {
            throw new Error('Object.create implementation only accepts the first parameter.');
        }
        function F() {}
        F.prototype = o;
        return new F();
    };
}


/// Stolen from Underscore, this needs replacing


  // Invert the keys and values of an object. The values must be serializable.
  OT.$.invert = function(obj) {
    var result = {};
    for (var key in obj) if (obj.hasOwnProperty(key)) result[obj[key]] = key;
    return result;
  };


  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = OT.$.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + Object.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + Object.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  ['escape', 'unescape'].forEach(function(method) {
    OT.$[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

// By default, Underscore uses ERB-style template delimiters, change the
// following template settings to use alternative delimiters.
OT.$.templateSettings = {
  evaluate    : /<%%([\s\S]+?)%>/g,
  interpolate : /<%%=([\s\S]+?)%>/g,
  escape      : /<%%-([\s\S]+?)%>/g
};

// When customizing `templateSettings`, if you don't want to define an
// interpolation, evaluation or escaping regex, we need one that is
// guaranteed not to match.
var noMatch = /(.)^/;

// Certain characters need to be escaped so that they can be put into a
// string literal.
var escapes = {
  "'":      "'",
  '\\':     '\\',
  '\r':     'r',
  '\n':     'n',
  '\t':     't',
  '\u2028': 'u2028',
  '\u2029': 'u2029'
};

var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

// JavaScript micro-templating, similar to John Resig's implementation.
// Underscore templating handles arbitrary delimiters, preserves whitespace,
// and correctly escapes quotes within interpolated code.
OT.$.template = function(text, data, settings) {
  var render;
  settings = OT.$.defaults({}, settings, OT.$.templateSettings);

  // Combine delimiters into one regular expression via alternation.
  var matcher = new RegExp([
    (settings.escape || noMatch).source,
    (settings.interpolate || noMatch).source,
    (settings.evaluate || noMatch).source
  ].join('|') + '|$', 'g');

  // Compile the template source, escaping string literals appropriately.
  var index = 0;
  var source = "__p+='";
  text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
    source += text.slice(index, offset)
      .replace(escaper, function(match) { return '\\' + escapes[match]; });

    if (escape) {
      source += "'+\n((__t=(" + escape + "))==null?'':OT.$.escape(__t))+\n'";
    }
    if (interpolate) {
      source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
    }
    if (evaluate) {
      source += "';\n" + evaluate + "\n__p+='";
    }
    index = offset + match.length;
    return match;
  });
  source += "';\n";

  // If a variable is not specified, place data values in local scope.
  if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

  source = "var __t,__p='',__j=Array.prototype.join," +
    "print=function(){__p+=__j.call(arguments,'');};\n" +
    source + "return __p;\n";


  try {
    render = new Function(settings.variable || 'obj', source);
  } catch (e) {
    e.source = source;
    throw e;
  }

  if (data) return render(data);
  var template = function(data) {
    return render.call(this, data);
  };

  // Provide the compiled function source as a convenience for precompilation.
  template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

  return template;
};

})(window);
(function(window) {

// IMPORTANT This file should be included straight after helpers.js
if (!window.OT) window.OT = {};

if (!OT.properties) {
	throw new Error("OT.properties does not exist, please ensure that you include a valid properties file.");
}

// Consumes and overwrites OT.properties. Makes it better and stronger!
OT.properties = function(properties) {
    var props = OT.$.clone(properties);

    props.debug = properties.debug === 'true' || properties.debug === true;
    props.supportSSL = properties.supportSSL === 'true' || properties.supportSSL === true;

    if (props.supportSSL && (window.location.protocol.indexOf("https") >= 0 || window.location.protocol.indexOf("chrome-extension") >= 0)) {
        props.assetURL = props.cdnURLSSL + "/webrtc/" + props.version;
        props.loggingURL = props.loggingURLSSL;
        props.apiURL = props.apiURLSSL;
    } else {
        props.assetURL = props.cdnURL + "/webrtc/" + props.version;
    }

    props.configURL = props.assetURL + "/js/dynamic_config.min.js";
    props.cssURL = props.assetURL + "/css/ot.min.css";

    return props;
}(OT.properties);

})(window);
(function(window) {

var timeouts = [],
    messageName = "OT.$.zero-timeout";


var handleMessage = function(event) {
    if (event.source == window && event.data == messageName) {
        event.stopPropagation();
        if (timeouts.length > 0) {
            var args = timeouts.shift(),
                fn = args.shift();

            fn.apply(null, args);
        }
    }
}

window.addEventListener("message", handleMessage, true);

// Calls the function +fn+ asynchronously with the current execution.
// This is most commonly used to execute something straight after
// the current function.
//
// Any arguments in addition to +fn+ will be passed to +fn+ when it's
// called.
//
// You would use this inplace of setTimeout(fn, 0) type constructs. callAsync
// is preferable as it executes in a much more predictable time window,
// unlike setTimeout which could execute anywhere from 2ms to several thousand
// depending on the browser/context.
//
OT.$.callAsync = function (/* fn, [arg1, arg2, ..., argN] */) {
    timeouts.push(Array.prototype.slice.call(arguments));
    window.postMessage(messageName, "*");
};


// Wraps +handler+ in a function that will execute it asynchronously
// so that it doesn't interfere with it's exceution context if it raises
// an exception.
OT.$.createAsyncHandler = function(handler) {
    return function() {
        var args = Array.prototype.slice.call(arguments);

        OT.$.callAsync(function() {
          handler.apply(null, args);
        });
    };
};

})(window);
(function(window) {

/**
* This base class defines the <code>addEventListener()</code>, <code>removeEventListener()</code>,
* <code>on</code>, and <code>off</code> methods
* of objects that can dispatch events.
*
* @class EventDispatcher
*/
OT.$.eventing = function(self) {
  var _events = {};


  // Call the defaultAction, passing args
  function executeDefaultAction(defaultAction, args) {
    if (!defaultAction) return;

    defaultAction.apply(null, args.slice());
  }

  // Execute each handler in +listeners+ with +args+.
  //
  // Each handler will be executed async. On completion the defaultAction
  // handler will be executed with the args.
  //
  // @param [Array] listeners
  //    An array of functions to execute. Each will be passed args.
  //
  // @param [Array] args
  //    An array of arguments to execute each function in  +listeners+ with.
  //
  // @param [String] name
  //    The name of this event.
  //
  // @param [Function, Null, Undefined] defaultAction
  //    An optional function to execute after every other handler. This will execute even
  //    if +listeners+ is empty. +defaultAction+ will be passed args as a normal
  //    handler would.
  //
  // @return Undefined
  //
  function executeListeners(args, name, defaultAction) {
    var listeners = _events[name];
    if (!listeners || listeners.length === 0) return;

    var listenerAcks = listeners.length;

    listeners.forEach(function(listener, index) {
      function filterHandlerAndContext(_listener) {
        return _listener.context === listener.context && _listener.handler === listener.handler
      }

      // We run this asynchronously so that it doesn't interfere with execution if an error happens
      OT.$.callAsync(function() {
        try {
          // have to check if the listener has not been removed
          if (_events[name] && _events[name].some(filterHandlerAndContext)) {
            (listener.closure || listener.handler).apply(listener.context || null, args);
          }
        }
        finally {
          listenerAcks--;

          if (listenerAcks === 0) {
            executeDefaultAction(defaultAction, args);
          }
        }
      });
    });
  }

  var removeAllListenersNamed = function (eventName, context) {
    if (_events[eventName]) {
      if (context) {
        // We are removing by context, get only events that don't
        // match that context
        _events[eventName] = _events[eventName].filter(function(listener){
          return listener.context !== context;
        });
      }
      else {
        delete _events[eventName];
      }
    }
  }

  var addListeners = function (eventNames, handler, context, closure) {
    var listener = {handler: handler};
    if (context) listener.context = context;
    if (closure) listener.closure = closure;

    eventNames.forEach(function(name) {
      if (!_events[name]) _events[name] = [];
      _events[name].push(listener);
    });
  }.bind(self);


  var removeListeners = function (eventNames, handler, context) {
    function filterHandlerAndContext(listener) {
      return !(listener.handler === handler && listener.context === context);
    }

    eventNames.forEach(function(name) {
      if (_events[name]) {
        _events[name] = _events[name].filter(filterHandlerAndContext);
        if (_events[name].length === 0) delete _events[name];
      }
    });
  }.bind(self);


  // Execute any listeners bound to the +event+ Event.
  //
  // Each handler will be executed async. On completion the defaultAction
  // handler will be executed with the args.
  //
  // @param [Event] event
  //    An Event object.
  //
  // @param [Function, Null, Undefined] defaultAction
  //    An optional function to execute after every other handler. This will execute even
  //    if there are listeners bound to this event. +defaultAction+ will be passed
  //    args as a normal handler would.
  //
  // @return this
  //
  self.dispatchEvent = function(event, defaultAction) {
    if (!event.type) {
      OT.error("OT.Eventing.dispatchEvent: Event has no type");
      OT.error(event);

      throw new Error("OT.Eventing.dispatchEvent: Event has no type");
    }

    if (!event.target) {
      event.target = this;
    }

    if (!_events[event.type] || _events[event.type].length === 0) {
      executeDefaultAction(defaultAction, [event]);
      return;
    }

    executeListeners([event], event.type, defaultAction);

    return this;
  };

  // Execute each handler for the event called +name+.
  //
  // Each handler will be executed async, and any exceptions that they throw will
  // be caught and logged
  //
  // How to pass these?
  //  * defaultAction
  //
  // @example
  //  foo.on('bar', function(name, message) {
  //    alert("Hello " + name + ": " + message);
  //  });
  //
  //  foo.trigger('OpenTok', 'asdf');     // -> Hello OpenTok: asdf
  //
  //
  // @param [String] eventName
  //    The name of this event.
  //
  // @param [Array] arguments
  //    Any additional arguments beyond +eventName+ will be passed to the handlers.
  //
  // @return this
  //
  self.trigger = function(eventName) {
    if (!_events[eventName] || _events[eventName].length === 0) {
      return;
    }

    var args = Array.prototype.slice.call(arguments);

    // Remove the eventName arg
    args.shift();

    executeListeners(args, eventName);

    return this;
  };

  // Binds one or more event handlers to events.
  //
  // @example bind a single handler to the 'foo' event
  //
  //   var eventedObj = new EventedObj();
  //   eventedObj.on('foo', function() {
  //     alert('foo event triggered');
  //   });
  //
  //
  // @example bind multiple event handlers at once
  //
  //   var eventedObj = new EventedObj();
  //   eventedObj.on({
  //     foo: function() { alert('foo event triggered'); },
  //     bar: function() { alert('bar event triggered'); }
  //   });
  //
  //
  // @example bind a single handler to a specific 'this'
  //
  //   var eventedObj = new EventedObj();
  //   eventedObj.on('foo', function() {
  //      this.doSomething();
  //   }, this);
  //
  //
  // @example bind multiple event handlers at once to a specific 'this'
  //
  //   var eventedObj = new EventedObj();
  //   eventedObj.on({
  //     foo: function() { alert('foo event triggered'); },
  //     bar: function() { alert('bar event triggered'); }
  //   }, this);
  //
  //
  // @param [String, Object] eventNames
  //    The name of this event, or a Hash of event names to handlers.
  //
  // @param [Function, Object] handler_or_context
  //    The function to be called when +eventNames+ is triggered if +eventNames+
  //    is a string representing an event, if the first parameter is a Hash
  //    then this parameter will be used at the value of 'this' when triggering
  //    the callbacks.
  //
  // @param [Object] context
  //    When providing an +eventNames+ and +handler+ context will become the value
  //    of this when executing handlers. This parameter is optional.
  //
  // @return this
  //
  self.on = function(eventNames, handler_or_context, context) {
    if (typeof(eventNames) === "string" && handler_or_context) {
      addListeners(eventNames.split(' '), handler_or_context, context);
    }
    else {
      for (var name in eventNames) {
        if (eventNames.hasOwnProperty(name)) {
          addListeners([name], eventNames[name], handler_or_context);
        }
      }
    }

    return this;
  };

  // Unbinds one or event handlers to events.
  //
  // @example unbind a single handler from the 'foo' event
  //
  //  var fooEvent = function() {
  //    alert('foo event triggered');
  //  };
  //
  //  eventedObj.off('foo', fooEvent);
  //
  // @example unbinds multiple event handlers at once
  //
  //  var fooHandler = function() { alert('foo event triggered'); };
  //  var barHandler = function() { alert('bar event triggered'); };
  //
  //  eventedObj.off({
  //    foo: fooHandler,
  //    bar: barHandler
  //  });
  //
  // @example unbind all handlers for event 'foo'
  //
  //  eventedObj.off('foo');
  //
  //
  // @param [String, Object] eventNames
  //    The name of this event that we wish to unbind, or a Hash of event names
  //    to handlers, each of which will be unbound.
  //
  // @param [Function] handler_or_context
  //    The function that would have been called when +eventNames+ was triggered
  //    if +eventNames+ is a string representing an event, if the first parameter
  //    is a Hash then this parameter is ignored.
  //
  //
  // It's important to ensure that when passing handlers (either via +handler+ or
  // via a hash of names to handlers) that the handlers are exactly the same as
  // the original handler bound with #on. Be especially careful with helpers like
  // bind which return a new function everytime they are called.
  //
  // Similarly, the context must also be the same used in the original on call.
  //
  // @return this
  //
  self.off = function(eventNames, handler_or_context, context) {
    if (typeof(eventNames) === "string") {
      if (handler_or_context && OT.$.isFunction(handler_or_context)) {
        removeListeners(eventNames.split(' '), handler_or_context, context);
      }
      else {
        eventNames.split(' ').forEach(function(name) {
          removeAllListenersNamed(name, handler_or_context);
        }, this);
      }
    }
    else if (!eventNames) {
      // remove all bound events
      _events = {};
    }
    else {
      for (var name in eventNames) {
        if (eventNames.hasOwnProperty(name)) {
          removeListeners([name], eventNames[name], handler_or_context);
        }
      }
    }

    return this;
  };


  self.once = function(eventNames, handler, context) {
    var names = eventNames.split(' '),
        fun = function() {
          var result = handler.apply(context || null, arguments);
          removeListeners(names, handler, context);

          return result;
        }.bind(this);

    addListeners(names, handler, context, fun);
  };


  /**
  * Registers a method as an event listener for a specific event.
  *
  * <p>
  * 	If a handler is not registered for an event, the event is ignored locally. If the event listener function does not exist,
  * 	the event is ignored locally.
  * </p>
  * <p>
  * 	Throws an exception if the <code>listener</code> name is invalid.
  * </p>
  *
  * @param {String} type The string identifying the type of event.
  *
  * @param {Function} listener The function to be invoked when the object dispatches the event.
  *
  * @param {Object} context The value of 'this' to use when executing +handler+
  *
  * @memberOf EventDispatcher
  * @method #addEventListener
  */
  // See 'on' for usage.
  // @depreciated will become a private helper function in the future.
  self.addEventListener = function(eventName, handler, context) {
    addListeners([eventName], handler, context);
  };


  /**
  * Removes an event listener for a specific event.
  *
  * <p>
  * 	Throws an exception if the <code>listener</code> name is invalid.
  * </p>
  *
  * @param {String} type The string identifying the type of event.
  *
  * @param {Function} listener The event listener function to remove.
  *
  * @param {Object} context The value of 'this' that +handler+ was bound to.
  *
  * @memberOf EventDispatcher
  * @method #removeEventListener
  */
  // See 'off' for usage.
  // @depreciated will become a private helper function in the future.
  self.removeEventListener = function(eventName, handler, context) {
    removeListeners([eventName], handler, context);
  };





  return self;
};

// Allow events to be bound to OT
OT.$.eventing(OT);

})(window);
(function(window) {

//--------------------------------------
// JS Dynamic Config
//--------------------------------------


OT.Config = (function() {
    var _loaded = false,
        _global = {},
        _partners = {},
        _script,
        _head = document.head || document.getElementsByTagName('head')[0],
        _loadTimer,

        _clearTimeout = function() {
            if (_loadTimer) {
                clearTimeout(_loadTimer);
                _loadTimer = null;
            }
        },

        _cleanup = function() {
            _clearTimeout();

            if (_script) {
                _script.onload = _script.onreadystatechange = null;

                if ( _head && _script.parentNode ) {
                    _head.removeChild( _script );
                }

                _script = undefined;
            }
        },

        _onLoad = function() {
            // Only IE and Opera actually support readyState on Script elements.
            if (_script.readyState && !/loaded|complete/.test( _script.readyState )) {
                // Yeah, we're not ready yet...
                return;
            }

            _clearTimeout();

            if (!_loaded) {
                // Our config script is loaded but there is not config (as
                // replaceWith wasn't called). Something went wrong. Possibly
                // the file we loaded wasn't actually a valid config file.
                _this._onLoadTimeout();
            }
        },

        _getModule = function(moduleName, apiKey) {
            if (apiKey && _partners[apiKey] && _partners[apiKey][moduleName]) {
                return _partners[apiKey][moduleName];
            }

            return _global[moduleName];
        },

        _this = {
            // In ms
            loadTimeout: 4000,

            load: function(configUrl) {
                if (!configUrl) throw new Error("You must pass a valid configUrl to Config.load");

                _loaded = false;

                setTimeout(function() {
                    _script = document.createElement( "script" );
                    _script.async = "async";
                    _script.src = configUrl;
                    _script.onload = _script.onreadystatechange = _onLoad.bind(this);
                    _head.appendChild(_script);
                },1);

                _loadTimer = setTimeout(function() {
                    _this._onLoadTimeout();
                }, this.loadTimeout);
            },

            _onLoadTimeout: function() {
                _cleanup();

                OT.warn("TB DynamicConfig failed to load in " + _this.loadTimeout + " ms");
                this.trigger('dynamicConfigLoadFailed');
            },

            isLoaded: function() {
                return _loaded;
            },

            reset: function() {
                _cleanup();
                _loaded = false;
                _global = {};
                _partners = {};
            },

            // This is public so that the dynamic config file can load itself.
            // Using it for other purposes is discouraged, but not forbidden.
            replaceWith: function(config) {
                _cleanup();

                if (!config) config = {};

                _global = config.global || {};
                _partners = config.partners || {};

                if (!_loaded) _loaded = true;
                this.trigger('dynamicConfigChanged');
            },

            // @example Get the value that indicates whether exceptionLogging is enabled
            //  OT.Config.get('exceptionLogging', 'enabled');
            //
            // @example Get a key for a specific partner, fallback to the default if there is
            // no key for that partner
            //  OT.Config.get('exceptionLogging', 'enabled', 'apiKey');
            //
            get: function(moduleName, key, apiKey) {
                var module = _getModule(moduleName, apiKey);
                return module ? module[key] : null;
            }
        };

    OT.$.eventing(_this);

    return _this;
})();

})(window);
(function(window) {

// Log levels for OT.setLogLevel
OT.DEBUG    = 5;
OT.LOG      = 4;
OT.INFO     = 3;
OT.WARN     = 2;
OT.ERROR    = 1;
OT.NONE     = 0;


var _logLevel = OT.NONE,
    _logs = [],
    _debugHeaderLogged = false;


// Generates a logging method for a particular method and log level.
//
// Attempts to handle the following cases:
// * the desired log method doesn't exist, call fallback (if available) instead
// * the console functionality isn't available because the developer tools (in IE)
// aren't open, call fallback (if available)
// * attempt to deal with weird IE hosted logging methods as best we can.
//
function generateLoggingMethod(method, level, fallback) {
    return function() {
        if (shouldLog(level)) {
            var cons = window.console;

            // In IE, window.console may not exist if the developer tools aren't open
            if (cons && cons[method]) {
                // the desired console method isn't a real object, which means
                // that we can't use apply on it. We force it to be a real object
                // using Function.bind, assuming that's available.
                if (cons[method].apply || Function.prototype.bind) {
                    if (!cons[method].apply) {
                        cons[method] = Function.prototype.bind.call(cons[method], cons);
                    }

                    cons[method].apply(cons, arguments);
                }
                else {
                    // This isn't the same result as the above, but it's better
                    // than nothing.
                    cons[method](
                        Array.prototype.slice.apply(arguments).join(' ')
                    );
                }
            }
            else if (fallback) {
                fallback.apply(OT, arguments);
            }

            appendToLogs(method, arguments);
        }
    };
}

/**
* Sends a string to the the debugger console (such as Firebug), if one exists. However, the function
* only logs to the console if you have set the log level to <code>TB.LOG</code> or <code>TB.DEBUG</code>,
* by calling <code>TB.setLogLevel(TB.LOG)</code> or <code>TB.setLogLevel(TB.DEBUG)</code>.
*
* @param {String} message The string to log.
*
* @name TB.log
* @memberof TB
* @function
* @see <a href="#setLogLevel">TB.setLogLevel()</a>
*/
OT.log = generateLoggingMethod('log', OT.LOG);

// Generate debug, info, warn, and error logging methods, these all fallback to OT.log
OT.debug = generateLoggingMethod('debug', OT.DEBUG, OT.log);
OT.info = generateLoggingMethod('info', OT.INFO, OT.log);
OT.warn = generateLoggingMethod('warn', OT.WARN, OT.log);
OT.error = generateLoggingMethod('error', OT.ERROR, OT.log);


/**
* Sets the API log level.
* <p>
* Calling <code>TB.setLogLevel()</code> sets the log level for runtime log messages that are the OpenTok library generates.
* The default value for the log level is <code>TB.ERROR</code>.
* </p>
* <p>
* The OpenTok JavaScript library displays log messages in the debugger console (such as Firebug), if one exists.
* </p>
* <p>
* The following example logs the session ID to the console, by calling <code>TB.log()</code>. The code also logs
* an error message when it attempts to publish a stream before the Session object dispatches a
* <code>sessionConnected</code> event.
* </p>
* <pre>
* TB.setLogLevel(TB.LOG);
* session = TB.initSession(sessionId);
* TB.log(sessionId);
* publisher = TB.initPublisher(API_KEY, "publishContainer");
* session.publish(publisher);
* </pre>
*
* @param {Number} logLevel The degree of logging desired by the developer:
*
* <p>
* <ul>
* 	<li>
* 		<code>TB.NONE</code> &#151; API logging is disabled.
* 	</li>
* 	<li>
* 		<code>TB.ERROR</code> &#151; Logging of errors only.
* 	</li>
* 	<li>
* 		<code>TB.WARN</code> &#151; Logging of warnings and errors.
* 	</li>
* 	<li>
* 		<code>TB.INFO</code> &#151; Logging of other useful information, in addition to warnings and errors.
* 	</li>
* 	<li>
* 		<code>TB.LOG</code> &#151; Logging of <code>TB.log()</code> messages, in addition to OpenTok info, warning,
* 		and error messages.
* 	</li>
* 	<li>
* 		<code>TB.DEBUG</code> &#151; Fine-grained logging of all API actions, as well as <code>TB.log()</code> messages.
* 	</li>
* </ul>
* </p>
*
* @name TB.setLogLevel
* @memberof TB
* @function
* @see <a href="#log">TB.log()</a>
*/
OT.setLogLevel = function(level) {
    _logLevel = typeof(level) === 'number' ? level : 0;

    if (shouldLog(OT.DEBUG) && !_debugHeaderLogged) {
        OT.debug("OpenTok JavaScript library " + OT.properties.version);
        OT.debug("Release notes: " + OT.properties.websiteURL  +"/opentok/webrtc/docs/js/release-notes.html");
        OT.debug("Known issues: " + OT.properties.websiteURL + "/opentok/webrtc/docs/js/release-notes.html#knownIssues");
        _debugHeaderLogged = true;
    }

    OT.debug("TB.setLogLevel(" + _logLevel + ")");

    return _logLevel;
};

OT.getLogs = function() {
    return _logs;
};


// Determine if the level is visible given the current logLevel.
function shouldLog(level) {
    return _logLevel >= level;
}

// Format the current time nicely for logging. Returns the current
// local time.
function formatDateStamp() {
    var now = new Date();
    return now.toLocaleTimeString() + now.getMilliseconds();
}


// Append +args+ to logs, along with the current log level and the a date stamp.
function appendToLogs(level, args) {
    if (!args) return;

    var message;

    try {
        message = JSON.stringify(args);
    } catch(e) {
        message = args.toString();
    }

    if (message.length <= 2) return;

    _logs.push(
        [level, formatDateStamp(), message]
    );
}

// Set the default
OT.setLogLevel(OT.properties.debug ? OT.DEBUG : OT.ERROR);

})(window);
// Casting helpers
(function(window) {

OT.$.castToBoolean = function(value, defaultValue) {
    if (value === undefined) return defaultValue;
    return value === 'true' || value === true;
};

OT.$.roundFloat = function(value, places) {
    return parseInt(Math.round(value*Math.pow(10, places)), 10)/Math.pow(10, places);
};

})(window);
// DOM helpers
(function(window) {

// Returns true if the client supports element.classList
OT.$.supportsClassList = function() {
    var hasSupport = typeof(document !== "undefined") && ("classList" in document.createElement("a"));
    OT.$.supportsClassList = function() { return hasSupport; };

    return hasSupport;
};

OT.$.removeElement = function(element) {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
};

OT.$.removeElementById = function(elementId) {
    this.removeElement(OT.$(elementId));
};

OT.$.removeElementsByType = function(parentElem, type) {
    if (!parentElem) return;

    var elements = parentElem.getElementsByTagName(type);

    // elements is a "live" NodesList collection. Meaning that the collection
    // itself will be mutated as we remove elements from the DOM. This means
    // that "while there are still elements" is safer than "iterate over each
    // element" as the collection length and the elements indices will be modified
    // with each iteration.
    while (elements.length) {
        parentElem.removeChild(elements[0]);
    }
};

OT.$.emptyElement = function(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }

    return element;
};

OT.$.createElement = function(nodeName, attributes, innerHTML) {
    var element = document.createElement(nodeName);

    if (attributes) {
        for (var name in attributes) {
            if (typeof(attributes[name]) === 'object') {
                if (!element[name]) element[name] = {};

                var subAttrs = attributes[name];
                for (var n in subAttrs) {
                    element[name][n] = subAttrs[n];
                }
            }
            else if (name === 'className') {
                element.className = attributes[name];
            }
            else {
                element.setAttribute(name, attributes[name]);
            }
        }
    }

    if (innerHTML) {
        element.innerHTML = innerHTML;
    }

    return element;
};

OT.$.createButton = function(innerHTML, attributes, events) {
    var button = OT.$.createElement('button', attributes, innerHTML);

    if (events) {
        for (var name in events) {
            if (events.hasOwnProperty(name)) {
                OT.$.on(button, name, events[name]);
            }
        }

        button._boundEvents = events;
    }

    return button;
};

// Helper function for adding event listeners to dom elements.
// WARNING: This doesn't preserve event types, your handler could be getting all kinds of different
// parameters depending on the browser. You also may have different scopes depending on the browser
// and bubbling and cancelable are not supported.
OT.$.on = function(element, eventName,  handler) {
    if (element.addEventListener) {
        element.addEventListener(eventName, handler, false);
    } else if (element.attachEvent) {
        element.attachEvent("on" + eventName, handler);
    } else {
        var oldHandler = element["on"+eventName];
        element["on"+eventName] = function() {
          handler.apply(this, arguments);
          if (oldHandler) oldHandler.apply(this, arguments);
        };
    }
};

// Helper function for removing event listeners from dom elements.
OT.$.off = function(element, eventName, handler) {
    if (element.removeEventListener) {
        element.removeEventListener (eventName, handler,false);
    }
    else if (element.detachEvent) {
        element.detachEvent("on" + eventName, handler);
    }
};


// Detects when an element is not part of the document flow because it or one of it's ancesters has display:none.
OT.$.isDisplayNone = function(element) {
    if ( (element.offsetWidth == 0 || element.offsetHeight === 0) && OT.$.css(element, 'display') === 'none') return true;
    if (element.parentNode && element.parentNode.style) return OT.$.isDisplayNone(element.parentNode);
    return false;
};

OT.$.findElementWithDisplayNone = function(element) {
    if ( (element.offsetWidth == 0 || element.offsetHeight === 0) && OT.$.css(element, 'display') === 'none') return element;
    if (element.parentNode && element.parentNode.style) return OT.$.findElementWithDisplayNone(element.parentNode);
    return null;
};

function objectHasProperties(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) return true;
    }
    return false;
}


// Allows an +onChange+ callback to be triggered when specific style properties
// of +element+ are notified. The callback accepts a single parameter, which is
// a hash where the keys are the style property that changed and the values are
// an array containing the old and new values ([oldValue, newValue]).
//
// This function returns the MutationObserver itself. Once you no longer wish
// to observe the element you should call disconnect on the observer.
//
// Observing changes:
//  // observe changings to the width and height of object
//  dimensionsObserver = OT.$.observeStyleChanges(object, ['width', 'height'], function(changeSet) {
//      OT.debug("The new width and height are " + changeSet.width[1] + ',' + changeSet.height[1]);
//  });
//
// Cleaning up
//  // stop observing changes
//  dimensionsObserver.disconnect();
//  dimensionsObserver = null;
//
OT.$.observeStyleChanges = function(element, stylesToObserve, onChange) {
    var oldStyles = {};

    var getStyle = function getStyle(style) {
            switch (style) {
            case 'width':
                return OT.$.width(element);
                break;

            case 'height':
                return OT.$.height(element);
                break;

            default:
                return OT.$.css(element);
            }
        };

    // get the inital values
    stylesToObserve.forEach(function(style) {
        oldStyles[style] = getStyle(style);
    });

    observer = new MutationObserver(function(mutations) {
        var changeSet = {};

        mutations.forEach(function(mutation) {
            if (mutation.attributeName !== 'style') return;

            stylesToObserve.forEach(function(style) {
                var newValue = getStyle(style);

                if (newValue !== oldStyles[style]) {
                    // OT.debug("CHANGED " + style + ": " + oldStyles[style] + " -> " + newValue);

                    changeSet[style] = [oldStyles[style], newValue];
                    oldStyles[style] = newValue;
                }
            });
        });

        if (objectHasProperties(changeSet)) {
            // Do this after so as to help avoid infinite loops of mutations.
            OT.$.callAsync(function() {
                onChange.call(null, changeSet);
            });
        }
    });

    observer.observe(element, {
        attributes:true,
        attributeFilter: ['style'],
        childList:false,
        characterData:false,
        subtree:false
    });

    return observer;
};


// trigger the +onChange+ callback whenever
// 1. +element+ is removed
// 2. or an immediate child of +element+ is removed.
//
// This function returns the MutationObserver itself. Once you no longer wish
// to observe the element you should call disconnect on the observer.
//
// Observing changes:
//  // observe changings to the width and height of object
//  nodeObserver = OT.$.observeNodeOrChildNodeRemoval(object, function(removedNodes) {
//      OT.debug("Some child nodes were removed");
//      removedNodes.forEach(function(node) {
//          OT.debug(node);
//      });
//  });
//
// Cleaning up
//  // stop observing changes
//  nodeObserver.disconnect();
//  nodeObserver = null;
//
OT.$.observeNodeOrChildNodeRemoval = function(element, onChange) {
    observer = new MutationObserver(function(mutations) {
        var removedNodes = [];

        mutations.forEach(function(mutation) {
            if (mutation.removedNodes.length) {
                removedNodes = removedNodes.concat(Array.prototype.slice.call(mutation.removedNodes));
            }
        });

        if (removedNodes.length) {
            // Do this after so as to help avoid infinite loops of mutations.
            OT.$.callAsync(function() {
                onChange(removedNodes);
            });
        }
    });

    observer.observe(element, {
        attributes:false,
        childList:true,
        characterData:false,
        subtree:true
    });

    return observer;
};

})(window);
// DOM Attribute helpers helpers
(function(window) {

OT.$.addClass = function(element, value) {
    // Only bother targeting Element nodes, ignore Text Nodes, CDATA, etc
    if (element.nodeType !== 1) {
        return;
    }

    var classNames = value.trim().split(/\s+/),
        i;

    if (OT.$.supportsClassList()) {
        for (i=0, l=classNames.length; i<l; ++i) {
            element.classList.add(classNames[i]);
        }

        return;
    }

    // Here's our fallback to browsers that don't support element.classList

    if (!element.className && classNames.length === 1) {
        element.className = value;
    }
    else {
        var setClass = " " + element.className + " ";

        for (i=0, l=classNames.length; i<l; ++i) {
            if ( !~setClass.indexOf( " " + classNames[i] + " ")) {
                setClass += classNames[i] + " ";
            }
        }

        element.className = setClass.trim();
    }

    return this;
};

OT.$.removeClass = function(element, value) {
    if (!value) return;

    // Only bother targeting Element nodes, ignore Text Nodes, CDATA, etc
    if (element.nodeType !== 1) {
        return;
    }

    var newClasses = value.trim().split(/\s+/),
        i;

    if (OT.$.supportsClassList()) {
        for (i=0, l=newClasses.length; i<l; ++i) {
            element.classList.remove(newClasses[i]);
        }

        return;
    }

    var className = (" " + element.className + " ").replace(/[\s+]/, ' ');

    for (i=0,l=newClasses.length; i<l; ++i) {
        className = className.replace(' ' + newClasses[i] + ' ', ' ');
    }

    element.className = className.trim();

    return this;
};


/**
 * Methods to calculate element widths and heights.
 */

var _width = function(element) {
        if (element.offsetWidth > 0) {
            return element.offsetWidth + 'px';
        }

        return OT.$.css(element, 'width');
    },

    _height = function(element) {
        if (element.offsetHeight > 0) {
            return element.offsetHeight + 'px';
        }

        return OT.$.css(element, 'height');
    };

OT.$.width = function(element, newWidth) {
    if (newWidth) {
        OT.$.css(element, 'width', newWidth);
        return this;
    }
    else {
        if (OT.$.isDisplayNone(element)) {
            // We can't get the width, probably since the element is hidden.
            return OT.$.makeVisibleAndYield(element, function() {
                return _width(element);
            });
        }
        else {
            return _width(element);
        }
    }
};

OT.$.height = function(element, newHeight) {
    if (newHeight) {
        OT.$.css(element, 'height', newHeight);
        return this;
    }
    else {
        if (OT.$.isDisplayNone(element)) {
            // We can't get the height, probably since the element is hidden.
            return OT.$.makeVisibleAndYield(element, function() {
                return _height(element);
            });
        }
        else {
            return _height(element);
        }
    }
};

// Centers +element+ within the window. You can pass through the width and height
// if you know it, if you don't they will be calculated for you.
OT.$.centerElement = function(element, width, height) {
    if (!width) width = parseInt(OT.$.width(element), 10);
    if (!height) height = parseInt(OT.$.height(element), 10);

    var marginLeft = -0.5 * width + "px";
    var marginTop = -0.5 * height + "px";
    OT.$.css(element, "margin", marginTop + " 0 0 " + marginLeft);
    OT.$.addClass(element, "OT_centered");
};

})(window);
// CSS helpers helpers
(function(window) {

var displayStateCache = {},
    defaultDisplays = {};

var defaultDisplayValueForElement = function(element) {
    if (defaultDisplays[element.ownerDocument] && defaultDisplays[element.ownerDocument][element.nodeName]) {
        return defaultDisplays[element.ownerDocument][element.nodeName];
    }

    if (!defaultDisplays[element.ownerDocument]) defaultDisplays[element.ownerDocument] = {};
    
    // We need to know what display value to use for this node. The easiest way
    // is to actually create a node and read it out.
    var testNode = element.ownerDocument.createElement(element.nodeName),
        defaultDisplay;

    element.ownerDocument.body.appendChild(testNode);
    defaultDisplay = defaultDisplays[element.ownerDocument][element.nodeName] = OT.$.css(testNode, 'display');

    OT.$.removeElement(testNode);
    testNode = null;

    return defaultDisplay;
};

var isHidden = function(element) {
    var computedStyle = element.ownerDocument.defaultView.getComputedStyle(element, null);
    return computedStyle.getPropertyValue('display') === 'none';
};

OT.$.show = function(element) {
    var display = element.style.display,
        computedStyle = element.ownerDocument.defaultView.getComputedStyle(element, null),
        computedDisplay = computedStyle.getPropertyValue('display');

    if (display === '' || display === 'none') {
        element.style.display = displayStateCache[element] || '';
        delete displayStateCache[element];
    }

    if (isHidden(element)) {
        // It's still hidden so there's probably a stylesheet that declares this 
        // element as display:none;
        displayStateCache[element] = 'none';

        element.style.display = defaultDisplayValueForElement(element);
    }

    return this;
};

OT.$.hide = function(element) {
    if (element.style.display === 'none') return;

    displayStateCache[element] = element.style.display;
    element.style.display = 'none';

    return this;
};

OT.$.css = function(element, nameOrHash, value) {
    if (typeof(nameOrHash) !== 'string') {
        var style = element.style;

        for (var cssName in nameOrHash) {
            style[cssName] = nameOrHash[cssName];
        }

        return this;
    }
    else if (value !== undefined) {
        element.style[nameOrHash] = value;
        return this;
    }
    else {
        // Normalise vendor prefixes from the form MozTranform to -moz-transform
        // except for ms extensions, which are weird...
        var name = nameOrHash.replace( /([A-Z]|^ms)/g, "-$1" ).toLowerCase(),
            computedStyle = element.ownerDocument.defaultView.getComputedStyle(element, null),
            currentValue = computedStyle.getPropertyValue(name);

        if (currentValue === '') {
            currentValue = element.style[name];
        }

        return currentValue;
    }
};


// Apply +styles+ to +element+ while executing +callback+, restoring the previous
// styles after the callback executes.
OT.$.applyCSS = function(element, styles, callback) {
    var oldStyles = {},
        name,
        ret;

    // Backup the old styles
    for (name in styles) {
        if (styles.hasOwnProperty(name)) {
            // We intentionally read out of style here, instead of using the css
            // helper. This is because the css helper uses querySelector and we
            // only want to pull values out of the style (domeElement.style) hash.
            oldStyles[name] = element.style[name];

            OT.$.css(element, name, styles[name]);
        }
    }

    ret = callback();

    // Restore the old styles
    for (name in styles) {
        if (styles.hasOwnProperty(name)) {
            OT.$.css(element, name, oldStyles[name] || '');
        }
    }

    return ret;
};

// Make +element+ visible while executing +callback+.
OT.$.makeVisibleAndYield = function(element, callback) {
    // find whether it's the element or an ancester that's display none and 
    // then apply to whichever it is
    var targetElement = OT.$.findElementWithDisplayNone(element);
    if (!targetElement) return;

    return OT.$.applyCSS(targetElement, {
            display: "block",
            visibility: "hidden"
        },
        callback
    );
};

})(window);
// AJAX helpers
(function(window) {

// Shim up XML support for IE8
function shimXMLForIE8(xml) {
    // https://developer.mozilla.org/en/DOM/Element.firstElementChild
    Object.defineProperty(xml.prototype, "firstElementChild", {
        "get" : function() {
            var node = this;
            node = node.firstChild;
            while(node && node.nodeType != 1) node = node.nextSibling;
            return node;
        }
    });

    // https://developer.mozilla.org/En/DOM/Element.lastElementChild
    Object.defineProperty(xml.prototype, "lastElementChild", {
        "get" : function() {
            var node = this;
            node = node.lastChild;
            while(node && node.nodeType != 1) node = node.previousSibling;
            return node;
        }
    });

    // https://developer.mozilla.org/En/DOM/Element.nextElementSibling
    Object.defineProperty(xml.prototype, "nextElementSibling", {
        "get" : function() {
            var node = this;
            while(node = node.nextSibling) {
                if(node.nodeType == 1) break;
            }

            return node;
        }
    });

    // https://developer.mozilla.org/En/DOM/Element.previousElementSibling
    Object.defineProperty(xml.prototype, "previousElementSibling", {
        "get" : function() {
            var node = this;
            while(node = node.previousSibling) {
                if(node.nodeType == 1) break;
            }
            return node;
        }
    });
}

OT.$.parseXML = function(xmlString) {
    var root, xml;

    if (window.DOMParser) { // Standard IE9 + everyone else
        xml = (new DOMParser()).parseFromString(xmlString, "text/xml");
    } else { // <= IE8
        xml = new ActiveXObject("Microsoft.XMLDOM");
        xml.async = "false";
        xml.loadXML(xmlString);

        shimXMLForIE8(xml);
    }

    root = xml.documentElement;

    if (!root || !root.nodeName || root.nodeName === "parsererror") {
        // Badly formed XML
        return null;
    }

    return xml;
};

})(window);
// AJAX helpers
(function(window) {

function formatPostData(data, contentType) {
    // If it's a string, we assume it's properly encoded
    if (typeof(data) === 'string') return data;

    var queryString = [];

    for (var key in data) {
        queryString.push(
            encodeURIComponent(key) + '=' + encodeURIComponent(data[key])
        );
    }

    return queryString.join('&').replace(/\+/g, "%20");
}

OT.$.getXML = function(url, options) {
    var callerSuccessCb = options && options.success,

        isValidXMLDocument = function(xmlDocument) {
            var root;

            if (!xmlDocument) {
                // Badly formed XML
                return false;
            }

            // If we got some XML back, attempt to infer if the XML is badly formed
            root = xmlDocument.documentElement;

            if (!root || !root.nodeName || root.nodeName === "parsererror") {
                // Badly formed XML
                return false;
            }

            return true;
        },

        onSuccess = function(event) {
            var response = event.target.responseXML,
                root;

            if (isValidXMLDocument(response)) {
                if (callerSuccessCb) callerSuccessCb(response, event, event.target);
            }
            else if (options && options.error) {
                options.error(event, event.target);
            }
        };

    var extendedHeaders = OT.$.extend(options.headers || {}, {
            'Content-Type': 'application/xml'
        });

    OT.$.get(url, OT.$.extend(options || {}, {
        success: onSuccess,
        headers: extendedHeaders
    }));
};

OT.$.getJSON = function(url, options) {
    var callerSuccessCb = options && options.success,
        onSuccess = function(event) {
            var response;

            try {
                response = JSON.parse(event.target.responseText);
            } catch(e) {
                // Badly formed JSON
                if (options && options.error) options.error(event, event.target);
                return;
            }

            if (callerSuccessCb) callerSuccessCb(response, event, event.target);
        };

    OT.$.get(url, OT.$.extend(options || {}, {
        success: onSuccess,
        headers: {
            'Content-Type': 'application/json'
        }
    }));
};

OT.$.get = function(url, options) {
    var request = new XMLHttpRequest(),
        _options = options || {};

    bindToSuccessAndErrorCallbacks(request, _options.success, _options.error);
    if (_options.process) request.addEventListener("progress", _options.progress, false);
    if (_options.cancelled) request.addEventListener("abort", _options.cancelled, false);


    request.open('GET', url, true);

    if (!_options.headers) _options.headers = {};

    for (var name in _options.headers) {
        request.setRequestHeader(name, _options.headers[name]);
    }

    request.send();
};

OT.$.post = function(url, options) {
    var request = new XMLHttpRequest(),
        _options = options || {};

    bindToSuccessAndErrorCallbacks(request, _options.success, _options.error);

    if (_options.process) request.addEventListener("progress", _options.progress, false);
    if (_options.cancelled) request.addEventListener("abort", _options.cancelled, false);

    request.open('POST', url, true);

    if (!_options.headers) _options.headers = {};

    for (var name in _options.headers) {
        request.setRequestHeader(name, _options.headers[name]);
    }

    request.send(formatPostData(_options.data));
};

OT.$.postFormData = function(url, data, options) {
    if (!data) {
        throw new Error("OT.$.postFormData must be passed a data options.");
    }

    var formData = new FormData();

    for (var key in data) {
        formData.append(key, data[key]);
    }

    OT.$.post(url, OT.$.extend(options || {}, {
        data: formData
    }));
};


// Make a GET request via JSONP.
//
// @example Make a request to 'http://tokbox.com:9999/session/foo' with success and error callbacks
//
//  OT.$.getJSONP('http://tokbox.com:9999/session/foo', {
//      success: successCallback,
//      error: errorCallback
//  });
//
OT.$.getJSONP = function(url, options) {
    var _loadTimeout = 30000,
        _script,
        _head = document.head || document.getElementsByTagName('head')[0],
        _waitUntilTimeout,
        _urlWithCallback = url,
        _options = OT.$.extend(options || {}, {
            callbackParameter: 'callback'
        }),

        _clearTimeout = function() {
            if (_waitUntilTimeout) {
                clearTimeout(_waitUntilTimeout);
                _waitUntilTimeout = null;
            }
        },

        _cleanup = function() {
            _clearTimeout();

            if (_script) {
                _script.onload = _script.onreadystatechange = null;

                OT.$.removeElement( _script );

                _script = undefined;
            }
        },

        _onLoad = function() {
            if (_script.readyState && !/loaded|complete/.test( _script.readyState )) {
                // Yeah, we're not ready yet...
                return;
            }

            _clearTimeout();
        },

        _onLoadTimeout = function() {
            _cleanup();

            OT.error("The JSONP request to " + _urlWithCallback + " timed out after " + _loadTimeout + "ms.");
            if (_options.error) _options.error("The JSONP request to " + url + " timed out after " + _loadTimeout + "ms.", _urlWithCallback,  _options);
        },

        _generateCallbackName = function() {
            return 'jsonp_callback_' + (+new Date());
        };


    _options.callbackName = _generateCallbackName();
    this.jsonp_callbacks[_options.callbackName] = function(response) {
        _cleanup();

        if (_options.success) _options.success(response);
    };

    // This doesn't handle URLs like "http://www.google.com?blah=1#something". The callback name
    // will be incorrectly appended after the #.
    _urlWithCallback += ((/\?/).test(_urlWithCallback) ? "&" : "?") + _options.callbackParameter + '=' + _options.callbackName;

    _script = OT.$.createElement('script', {
        async: 'async',
        src: _urlWithCallback,
        onload: _onLoad,
        onreadystatechange: _onLoad
    });
    _head.appendChild(_script);

    _waitUntilTimeout = setTimeout(function() { _this._onLoadTimeout(); }, _loadTimeout);
};

// Private helper method used (by OT.$.get and OT.$.post among others) to setup
// callbacks to correctly respond to success and error callbacks. This includes
// interpreting the responses HTTP status, which XmlHttpRequest seems to ignore
// by default.
var bindToSuccessAndErrorCallbacks = function(request, success, error) {
    request.addEventListener("load", function(event) {
        var status = event.target.status;

        // We need to detect things that XMLHttpRequest considers a success,
        // but we consider to be failures.
        if ( status >= 200 && status < 300 || status === 304 ) {
            if (success) success.apply(null, arguments);
        }
        else if (error) {
            error(event);
        }
    }, false);


    if (error) {
        request.addEventListener("error", error, false);
    }
};

})(window);
(function(window) {

var defaultAspectRatio = 4.0/3.0;
// This code positions the video element so that we don't get any letterboxing.
// It will take into consideration aspect ratios other than 4/3 but only when
// the video element is first created. If the aspect ratio changes at a later point
// this calculation will become incorrect.
function fixAspectRatio(element, width, height, desiredAspectRatio) {
    if (!width) width = parseInt(OT.$.width(element.parentNode), 10);
    else width = parseInt(width, 10);

    if (!height) height = parseInt(OT.$.height(element.parentNode), 10);
    else height = parseInt(height, 10);

    if (width === 0 || height === 0) return;

    if (!desiredAspectRatio) desiredAspectRatio = defaultAspectRatio;

    var actualRatio = (width + 0.0)/height,
        props = {
            width: '100%',
            height: '100%',
            left: 0,
            top: 0
        };

    if (actualRatio > desiredAspectRatio) {
        // Width is largest so we blow up the height so we don't have letterboxing
        var newHeight = (actualRatio / desiredAspectRatio) * 100;

        props.height = newHeight + '%';
        props.top = '-' + ((newHeight - 100) / 2) + '%';
    } else if (actualRatio < desiredAspectRatio) {
        // Height is largest, blow up the width
        var newWidth = (desiredAspectRatio / actualRatio) * 100;

        props.width = newWidth + '%';
        props.left = '-' + ((newWidth - 100) / 2) + '%';
    }

    OT.$.css(element, props);
}

var getOrCreateContainer = function getOrCreateContainer(elementOrDomId) {
    var container,
        domId;

    if (elementOrDomId && elementOrDomId.nodeName) {
        // It looks like we were given a DOM element. Grab the id or generate
        // one if it doesn't have one.
        container = elementOrDomId;
        if (!container.getAttribute('id') || container.getAttribute('id').length === 0) {
            container.setAttribute('id', 'OT_' + uuid());
        }

        domId = container.getAttribute('id');
    }
    else {
        // We may have got an id, try and get it's DOM element.
        container = OT.$(elementOrDomId);
        domId = elementOrDomId || ('OT_' + uuid());
    }

    if (!container) {
        container = OT.$.createElement('div', {id: domId});
        container.style.backgroundColor = "#000000";
        document.body.appendChild(container);
    }
    else {
        OT.$.emptyElement(container);
    }

    return container;
};

// Creates the standard container that the Subscriber and Publisher use to hold
// their video element and other chrome.
OT.WidgetView = function(domId, properties) {
    var container = getOrCreateContainer(domId),
        videoContainer = document.createElement('div'),
        oldContainerStyles = {},
        dimensionsObserver,
        videoElement,
        videoObserver,
        posterContainer,
        loadingContainer,
        loading = true;

    if (properties) {
        width = properties.width;
        height = properties.height;

        if (width) {
            if (typeof(width) == "number") {
                width = width + "px";
            }
        }

        if (height) {
            if (typeof(height) == "number") {
                height = height + "px";
            }
        }

        container.style.width = width ? width : "264px";
        container.style.height = height ? height : "198px";
        container.style.overflow = "hidden";

        if (properties.mirror === undefined || properties.mirror) OT.$.addClass(container, 'OT_mirrored');
    }

    if (properties.classNames) OT.$.addClass(container, properties.classNames);
    OT.$.addClass(container, 'OT_loading');


    OT.$.addClass(videoContainer, 'OT_video-container');
    videoContainer.style.width = container.style.width;
    videoContainer.style.height = container.style.height;
    container.appendChild(videoContainer);
    fixAspectRatio(videoContainer, container.offsetWidth, container.offsetHeight);

    loadingContainer = document.createElement("div");
    OT.$.addClass(loadingContainer, "OT_video-loading");
    videoContainer.appendChild(loadingContainer);

    posterContainer = document.createElement("div");
    OT.$.addClass(posterContainer, "OT_video-poster");
    videoContainer.appendChild(posterContainer);

    oldContainerStyles.width = container.offsetWidth;
    oldContainerStyles.height = container.offsetHeight;

    // Observe changes to the width and height and update the aspect ratio
    dimensionsObserver = OT.$.observeStyleChanges(container, ['width', 'height'], function(changeSet) {
        var width = changeSet.width ? changeSet.width[1] : container.offsetWidth,
            height = changeSet.height ? changeSet.height[1] : container.offsetHeight;

        fixAspectRatio(videoContainer, width, height, videoElement ? videoElement.aspectRatio : null);
    });


    // @todo observe if the video container or the video element get removed, if they do we should do some cleanup
    videoObserver = OT.$.observeNodeOrChildNodeRemoval(container, function(removedNodes) {
        if (!videoElement) return;

        // This assumes a video element being removed is the main video element. This may
        // not be the case.
        var videoRemoved = removedNodes.some(function(node) { return node === videoContainer || node.nodeName === 'VIDEO'; });

        if (videoRemoved) {
            videoElement.destroy();
            videoElement = null;
        }

        if (videoContainer) {
            OT.$.removeElement(videoContainer);
            videoContainer = null;
        }
    });

    this.destroy = function() {
        if (dimensionsObserver) {
            dimensionsObserver.disconnect();
            dimensionsObserver = null;
        }

        if (videoObserver) {
            videoObserver.disconnect();
            videoObserver = null;
        }

        if (videoElement) {
            videoElement.destroy();
            videoElement = null;
        }

        if (container) {
            OT.$.removeElement(container);
            container = null;
        }
    };

    Object.defineProperties(this, {

        showPoster: {
            get: function() {
                return !OT.$.isDisplayNone(posterContainer);
            },
            set: function(shown) {
                if(shown) {
                    OT.$.show(posterContainer);
                }
                else {
                    OT.$.hide(posterContainer);
                }
            }
        },

        poster: {
            get: function() {
                return OT.$.css(posterContainer, "backgroundImage");
            },
            set: function(src) {
                OT.$.css(posterContainer, "backgroundImage", "url(" + src + ")");
            }
        },

        loading: {
            get: function() { return loading; },
            set: function(l) {
                loading = l;

                if (loading) {
                    OT.$.addClass(container, 'OT_loading');
                }
                else {
                    OT.$.removeClass(container, 'OT_loading');
                }
            }
        },

        video: {
            get: function() { return videoElement; },
            set: function(video) {
                // remove the old video element if it exists
                // @todo this might not be safe, publishers/subscribers use this as well...
                if (videoElement) videoElement.destroy();

                video.appendTo(videoContainer);
                videoElement = video;

                fixAspectRatio(videoContainer, container.offsetWidth, container.offsetHeight, videoElement ? videoElement.aspectRatio : null);
            }
        },

        domElement: {
            get: function() { return container; }
        },

        domId: {
          get: function() { return container.getAttribute('id'); }
        }
    });

    this.addError = function(errorMsg) {
        container.innerHTML = "<p>" + errorMsg + "<p>";
        OT.$.addClass(container, "OT_subscriber_error");
    };
};

})(window);
// Web OT Helpers
(function(window) {

// Handy cross-browser getUserMedia shim. Inspired by some code from Adam Barth
var getUserMedia = (function() {
    if (navigator.getUserMedia) {
        return navigator.getUserMedia.bind(navigator);
    } else if (navigator.mozGetUserMedia) {
        return navigator.mozGetUserMedia.bind(navigator);
    } else if (navigator.webkitGetUserMedia) {
        return navigator.webkitGetUserMedia.bind(navigator);
    }
})();


if (navigator.webkitGetUserMedia) {
    // Stub for getVideoTracks for Chrome < 26
    if (!webkitMediaStream.prototype.getVideoTracks) {
        webkitMediaStream.prototype.getVideoTracks = function() {
            return this.videoTracks;
        };
    }

    // Stubs for getAudioTracks for Chrome < 26
    if (!webkitMediaStream.prototype.getAudioTracks) {
        webkitMediaStream.prototype.getAudioTracks = function() {
            return this.audioTracks;
        };
    }

    if (!webkitRTCPeerConnection.prototype.getLocalStreams) {
        webkitRTCPeerConnection.prototype.getLocalStreams = function() {
          return this.localStreams;
        };
    }

    if (!webkitRTCPeerConnection.prototype.getRemoteStreams) {
        webkitRTCPeerConnection.prototype.getRemoteStreams = function() {
          return this.remoteStreams;
        };
    }
}
else if (navigator.mozGetUserMedia) {
    // There's no Firefox support for these, we'll just stub them out for now.

    if (!MediaStream.prototype.getVideoTracks) {
        MediaStream.prototype.getVideoTracks = function() {
            return [];
        };
    }

    if (!MediaStream.prototype.getAudioTracks) {
        MediaStream.prototype.getAudioTracks = function() {
            return [];
        };
    }

    // This won't work as mozRTCPeerConnection is a weird internal Firefox
    // object (a wrapped native object I think).
    // if (!window.mozRTCPeerConnection.prototype.getLocalStreams) {
    //     window.mozRTCPeerConnection.prototype.getLocalStreams = function() {
    //         return this.localStreams;
    //     };
    // }

    // This won't work as mozRTCPeerConnection is a weird internal Firefox
    // object (a wrapped native object I think).
    // if (!window.mozRTCPeerConnection.prototype.getRemoteStreams) {
    //     window.mozRTCPeerConnection.prototype.getRemoteStreams = function() {
    //         return this.remoteStreams;
    //     };
    // }
}


// Mozilla error strings and the equivalent W3C names. NOT_SUPPORTED_ERROR does not
// exist in the spec right now, so we'll include Mozilla's error description.
var mozToW3CErrors = {
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    NOT_SUPPORTED_ERROR: "A constraint specified is not supported by the browser.",
    MANDATORY_UNSATISFIED_ERROR: 'CONSTRAINT_NOT_SATISFIED'
};

// Chrome only seems to expose a single error with a code of 1 right now.
var chromeToW3CErrors = {
    1: 'PERMISSION_DENIED'
};


var gumNamesToMessages = {
    PERMISSION_DENIED: "User denied permission for scripts from this origin to access the media device.",
    CONSTRAINT_NOT_SATISFIED: "One of the mandatory constraints could not be satisfied."
};

// Map vendor error strings to names and messages
var mapVendorErrorName = function mapVendorErrorName (vendorErrorName, vendorErrors) {
    var errorName = vendorErrors[vendorErrorName],
        errorMessage = gumNamesToMessages[errorName];

    if (!errorMessage) {
        // This doesn't map to a known error from the Media Capture spec, it's
        // probably a custom vendor error message.
        errorMessage = eventName;
        errorName = vendorErrorName;
    }

    return {
        name: errorName,
        message: errorMessage
    };
};

// Parse and normalise a getUserMedia error event from Chrome or Mozilla
//
// @ref http://dev.w3.org/2011/webrtc/editor/getusermedia.html#idl-def-NavigatorUserMediaError
//
var parseErrorEvent = function parseErrorObject (event) {
    var error;

    if (OT.$.isObject(event) && event.name) {
        error = {
            name: event.name,
            message: event.message,
            constraintName: event.constraintName
        };
    }
    else if (OT.$.isObject(event)) {
        error = mapVendorErrorName(event.code, chromeToW3CErrors);

        // message and constraintName are probably missing if the
        // property is also omitted, but just in case they aren't.
        if (event.message) error.message = event.message;
        if (event.constraintName) error.constraintName = event.constraintName;
    }
    else if (event && mozToW3CErrors.hasOwnProperty(event)) {
        error = mapVendorErrorName(event, mozToW3CErrors);
    }
    else {
        error = {
            message: "Unknown Error while getting user media"
        };
    }


    return error;
};



// Validates a Hash of getUserMedia constraints. Currently we only
// check to see if there is at least one non-false constraint.
var areInvalidConstraints = function(constraints) {
    if (!constraints || !OT.$.isObject(constraints)) return true;

    for (var key in constraints) {
        if (constraints[key]) return false;
    }

    return true;
};





// Returns true if the client supports Web RTC, false otherwise.
//
// Chrome Issues:
// * The explicit prototype.addStream check is because webkitRTCPeerConnection was
// partially implemented, but not functional, in Chrome 22.
//
// Firefox Issues:
// * No real support before Firefox 19
// * Firefox 19 has issues with generating Offers.
// * Firefox 20 doesn't interoperate with Chrome.
//
OT.$.supportsWebRTC = function() {
    var _supportsWebRTC = false;

    if (navigator.webkitGetUserMedia) {
        _supportsWebRTC = typeof(webkitRTCPeerConnection) === 'function' && !!webkitRTCPeerConnection.prototype.addStream;
    }
    else if (navigator.mozGetUserMedia) {
        var firefoxVersion = window.navigator.userAgent.toLowerCase().match(/Firefox\/([0-9\.]+)/i);
        _supportsWebRTC = typeof(mozRTCPeerConnection) === 'function' && (firefoxVersion !== null && parseFloat(firefoxVersion[1], 10) > 20.0);
        if (_supportsWebRTC) {
            try {
                new mozRTCPeerConnection();
                _supportsWebRTC = true;
            } catch (err) {
                _supportsWebRTC = false;
            }
        }
    }

    OT.$.supportsWebRTC = function() {
        return _supportsWebRTC;
    };

    return _supportsWebRTC;
};

// Returns a String representing the supported WebRTC crypto scheme. The possible
// values are SDES_SRTP, DTLS_SRTP, and NONE;
//
// Broadly:
// * Firefox only supports DTLS
// * Older versions of Chrome (<= 24) only support SDES
// * Newer versions of Chrome (>= 25) support DTLS and SDES
//
OT.$.supportedCryptoScheme = function() {
    if (!OT.$.supportsWebRTC()) return 'NONE';

    var chromeVersion = window.navigator.userAgent.toLowerCase().match(/chrome\/([0-9\.]+)/i);
    return chromeVersion && parseFloat(chromeVersion[1], 10) < 25 ? 'SDES_SRTP' : 'DTLS_SRTP';
};


// A wrapper for the builtin navigator.getUserMedia. In addition to the usual
// getUserMedia behaviour, this helper method also accepts a accessDialogOpened
// and accessDialogClosed callback.
//
// @memberof TB.$
// @private
//
// @param {Object} constraints
//      A dictionary of constraints to pass to getUserMedia. See <a href='http://dev.w3.org/2011/webrtc/editor/getusermedia.html#idl-def-MediaStreamConstraints'>MediaStreamConstraints</a> in the Media Capture and Streams spec for more info.
//
// @param {function} success
//      Called when getUserMedia completes successfully. The callback will be passed a WebRTC Stream object.
//
// @param {function} failure
//      Called when getUserMedia fails to access a user stream. It will be passed an object with a code property representing the error that occurred.
//
// @param {function} accessDialogOpened
//      Called when the access allow/deny dialog is opened.
//
// @param {function} accessDialogClosed
//      Called when the access allow/deny dialog is closed.
//
// @param {function} accessDenied
//      Called when access is denied to the camera/mic. This will be either because
//      the user has clicked deny or because a particular origin is permanently denied.
//
OT.$.getUserMedia = function(constraints, success, failure, accessDialogOpened, accessDialogClosed, accessDenied) {
    // All constraints are false, we don't allow this. This may be valid later
    // depending on how/if we integrate data channels.
    if (areInvalidConstraints(constraints)) {
        OT.error("Couldn't get UserMedia: All constraints were false");
        // Using a ugly dummy-code for now.
        failure.call(null, {
            name: 'NO_VALID_CONSTRAINTS',
            message: "Video and Audio was disabled, you need to enabled at least one"
        });

        return;
    }

    var triggerOpenedTimer = null,
        displayedPermissionDialog = false,

        finaliseAccessDialog = function() {
            if (triggerOpenedTimer) {
                clearTimeout(triggerOpenedTimer);
            }

            if (displayedPermissionDialog && accessDialogClosed) accessDialogClosed();
        },

        triggerOpened = function() {
            triggerOpenedTimer = null;
            displayedPermissionDialog = true;

            if (accessDialogOpened) accessDialogOpened();
        },

        onStream = function(stream) {
            finaliseAccessDialog();
            success.call(null, stream);
        },

        onError = function(event) {
            finaliseAccessDialog();
            var error = parseErrorEvent(event);

            if (error.name === 'PERMISSION_DENIED') {
                accessDenied.call(null, error);
            }
            else {
                failure.call(null, error);
            }
        };

    try {
        getUserMedia(constraints, onStream, onError);
    } catch (e) {
        OT.error("Couldn't get UserMedia: " + e.toString());
        onError();
        return;
    }

    // The "remember me" functionality of WebRTC only functions over HTTPS, if
    // we aren't on HTTPS then we should definitely be displaying the access
    // dialog.
    //
    // If we are on HTTPS, we'll wait 500ms to see if we get a stream
    // immediately. If we do then the user had clicked "remember me". Otherwise
    // we assume that the accessAllowed dialog is visible.
    //
    // @todo benchmark and see if 500ms is a reasonable number. It seems like
    // we should know a lot quicker.
    //
    if (location.protocol.indexOf('https') === -1) {
        // Execute after, this gives the client a chance to bind to the
        // accessDialogOpened event.
        setTimeout(triggerOpened, 100);
    }
    else {
        // wait a second and then trigger accessDialogOpened
        triggerOpenedTimer = setTimeout(triggerOpened, 500);
    }
};


})(window);
(function(window) {

OT.Modal = function(title, body, options) {
    var tmpl = "\
        <header>\
            <h1><%%= title %></h1>\
        </header>\
        <div class='OT_dialog-body'>\
            <%%= body %>\
        </div>\
    ";

    this.el = OT.$.createElement("section", {
            className: "OT_root OT_dialog OT_modal"
        },
        OT.$.template(tmpl, {
            title: title,
            body: body
        })
    );

    // We're going to center the element in the window. We need to add the
    // element to the body before we do, otherwise we can't calculate the dialog's
    // widths and heights. This means we need to hide the element first.
    this.el.style.display = 'none';
    document.body.appendChild(this.el);
    OT.$.centerElement(this.el);
    OT.$.show(this.el);

    this.close = function() {
        OT.$.removeElement(this.el);
        this.el = null;
        return this;
    };
};

// Custom alert dialog
OT.$.tbAlert = function(title, message) {
    var modal = new OT.Modal(title, "<div>" + message + "</div>");
    OT.$.addClass(modal.el, "OT_tbalert");

    var closeBtn = OT.$.createElement("input", {
            className: "OT_closeButton",
            type: "button",
            value: "close"
    });
    modal.el.appendChild(closeBtn);

    closeBtn.onclick = function() {
        if (modal) modal.close();
        modal = null;
    };
};

})(window);
(function(window) {

OT.VideoOrientation = {
    ROTATED_NORMAL: "OTVideoOrientationRotatedNormal",
    ROTATED_LEFT: "OTVideoOrientationRotatedLeft",
    ROTATED_RIGHT: "OTVideoOrientationRotatedRight",
    ROTATED_UPSIDE_DOWN: "OTVideoOrientationRotatedUpsideDown"
};

//
//
//   var _videoElement = new OT.VideoElement({
//     fallbackText: 'blah'
//   });
//
//   _videoElement.on({
//     streamBound: function() {...},
//     loadError: function() {...},
//     error: function() {...}
//   });
//
//   _videoElement.bindToStream(webRtcStream);      // => VideoElement
//   _videoElement.appendTo(DOMElement)             // => VideoElement
//
//   _videoElement.stream                           // => Web RTC stream
//   _videoElement.domElement                       // => DomNode
//   _videoElement.parentElement                    // => DomNode
//
//   _videoElement.imgData                          // => PNG Data string
//
//   _videoElement.orientation = OT.VideoOrientation.ROTATED_LEFT;
//
//   _videoElement.unbindStream();
//   _videoElement.destroy()                        // => Completely cleans up and removes the video element
//
//
OT.VideoElement = function(options) {
    var _stream,
        _domElement,
        _parentElement,
        _streamBound = false,
        _options = OT.$.defaults(options || {}, {
            fallbackText: 'Sorry, Web RTC is not available in your browser'
        });


    OT.$.eventing(this);

    /// Private API
    var _onVideoError = function(event) {
            var reason = "There was an unexpected problem with the Video Stream: " + videoElementErrorCodeToStr(event.target.error.code);
            this.trigger('error', null, reason, this);
        }.bind(this),

        _onStreamBound = function() {
            _streamBound = true;
            _domElement.addEventListener('error', _onVideoError, false);
            this.trigger('streamBound', this);
        }.bind(this),

        _onStreamBoundError = function(reason) {
            this.trigger('loadError', OT.ExceptionCodes.P2P_CONNECTION_FAILED, reason, this);
        }.bind(this);


    _domElement = createVideoElement(_options.fallbackText, _options.attributes);

    /// Public Properties
    Object.defineProperties(this, {
        stream: {get: function() {return _stream; }},
        domElement: {get: function() {return _domElement; }},
        parentElement: {get: function() {return _parentElement; }},
        isBoundToStream: {get: function() { return _streamBound; }},
        poster: {
            get: function() { return _domElement.getAttribute('poster'); },
            set: function(src) { _domElement.setAttribute('poster', src); }
        }
    });


    /// Public methods

    // Append the Video DOM element to a parent node
    this.appendTo = function(parentDomElement) {
        _parentElement = parentDomElement;
        _parentElement.appendChild(_domElement);

        return this;
    };

    // Bind a stream to the video element.
    this.bindToStream = function(webRtcStream) {
        _streamBound = false;
        _stream = webRtcStream;

        bindStreamToVideoElement(_domElement, _stream, _onStreamBound, _onStreamBoundError);

        return this;
    };

    // Unbind the currently bound stream from the video element.
    this.unbindStream = function() {
        if (!_stream) return this;

        if (_domElement) {
            if (!navigator.mozGetUserMedia) {
                // The browser would have released this on unload anyway, but
                // we're being a good citizen.
                window.URL.revokeObjectURL(_domElement.src);
            }
            else {
                _domElement.mozSrcObject = null;
            }
        }

        _stream = null;

        return this;
    };

    this.setAudioVolume = function(value) {
        if (_domElement) _domElement.volume = OT.$.roundFloat(value / 100, 2);
    };

    this.getAudioVolume = function() {
        // Return the actual volume of the DOM element
        if (_domElement) return parseInt(_domElement.volume * 100, 10);
        return 50;
    };

    this.whenTimeIncrements = function(callback, context) {
        if(_domElement) {
            var lastTime, handler = function() {
                if(!lastTime || lastTime >= _domElement.currentTime) {
                    lastTime = _domElement.currentTime;
                } else {
                    _domElement.removeEventListener('timeupdate', handler, false);
                    callback.call(context, this);
                }
            }.bind(this);
            _domElement.addEventListener('timeupdate', handler, false);
        }
    };
    
    this.destroy = function() {
        // unbind all events so they don't fire all the object is dead
        this.off();

        this.unbindStream();

        if (_domElement) {
            OT.$.removeElement(_domElement);
            _domElement = null;
        }

        _parentElement = null;

        return undefined;
    };
};


// Checking for window.defineProperty for IE compatibility, just so we don't throw exceptions when the script is included
if (OT.$.canDefineProperty) {
    // Extracts a snapshot from a video element and returns it's as a PNG Data string.
    Object.defineProperties(OT.VideoElement.prototype, {
        imgData: {
            get: function() {
                var canvas = OT.$.createElement('canvas', {
                        width: this.domElement.videoWidth,
                        height: this.domElement.videoHeight,
                        style: {
                            display: 'none'
                        }
                    });

                document.body.appendChild(canvas);
                canvas.getContext('2d').drawImage(this.domElement, 0, 0, canvas.width, canvas.height);
                var imgData = canvas.toDataURL('image/png');

                OT.$.removeElement(canvas);

                return imgData.replace("data:image/png;base64,", "").trim();
            }
        },

        videoWidth: {
            get: function() { return this.domElement.videoWidth; }
        },

        videoHeight: {
            get: function() { return this.domElement.videoHeight; }
        },

        aspectRatio: {
            get: function() { return (this.domElement.videoWidth + 0.0) / this.domElement.videoHeight; }
        }
    });
}


var VideoOrientationTransforms = {
    OTVideoOrientationRotatedNormal: "rotate(0deg)",
    OTVideoOrientationRotatedLeft: "rotate(90deg)",
    OTVideoOrientationRotatedRight: "rotate(-90deg)",
    OTVideoOrientationRotatedUpsideDown: "rotate(180deg)"
};

// Checking for window.defineProperty for IE compatibility, just so we don't throw exceptions when the script is included
if (OT.$.canDefineProperty) {
    Object.defineProperty(OT.VideoElement.prototype,'orientation', {
        set: function(orientation) {
            var transform = VideoOrientationTransforms[orientation] || VideoOrientationTransforms.ROTATED_NORMAL;

            switch(OT.$.browser()) {
                case 'Chrome':
                case 'Safari':
                    this.domElement.style.webkitTransform = transform;
                    break;

                case 'IE':
                    this.domElement.style.msTransform = transform;
                    break;

                default:
                    // The standard version, just Firefox, Opera, and IE > 9
                    this.domElement.style.transform = transform;
            }
        }
    });
}



/// Private Helper functions

function createVideoElement(fallbackText, attributes) {
    var videoElement = document.createElement('video');
    videoElement.setAttribute('autoplay', '');
    videoElement.innerHTML = fallbackText;

    if (attributes) {
        if (attributes.muted === true) {
            delete attributes.muted;
            videoElement.muted = 'true';
        }

        for (var key in attributes) {
            videoElement.setAttribute(key, attributes[key]);
        }
    }

    return videoElement;
}


// See http://www.w3.org/TR/2010/WD-html5-20101019/video.html#error-codes
var _videoErrorCodes = {};
// Checking for window.MediaError for IE compatibility, just so we don't throw exceptions when the script is included
if (window.MediaError) {
    _videoErrorCodes[window.MediaError.MEDIA_ERR_ABORTED] = "The fetching process for the media resource was aborted by the user agent at the user's request.";
    _videoErrorCodes[window.MediaError.MEDIA_ERR_NETWORK] = "A network error of some description caused the user agent to stop fetching the media resource, after the resource was established to be usable.";
    _videoErrorCodes[window.MediaError.MEDIA_ERR_DECODE] = "An error of some description occurred while decoding the media resource, after the resource was established to be usable.";
    _videoErrorCodes[window.MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED] = "The media resource indicated by the src attribute was not suitable. ";
}

function videoElementErrorCodeToStr(errorCode) {
    return _videoErrorCodes[parseInt(errorCode, 10)] || "An unknown error occurred.";
}


function bindStreamToVideoElement(videoElement, webRTCStream, onStreamBound, onStreamBoundError) {
    // Note: onloadedmetadata doesn't fire in Chrome for audio only crbug.com/110938
    if (navigator.mozGetUserMedia || (webRTCStream.getVideoTracks().length > 0 && webRTCStream.getVideoTracks()[0].enabled)) {

        var cleanup = function cleanup () {
                clearTimeout(timeout);
                videoElement.removeEventListener('loadedmetadata', onLoad, false);
                videoElement.removeEventListener('error', onError, false);
            },

            onLoad = function onLoad (event) {
                cleanup();
                onStreamBound();
            },

            onError = function onError (event) {
                cleanup();
                onStreamBoundError("There was an unexpected problem with the Video Stream: " + videoElementErrorCodeToStr(event.target.error.code));
            },

            onStoppedLoading = function onStoppedLoading () {
                // The stream ended before we fully bound it. Maybe the other end called
                // stop on it or something else went wrong.
                cleanup();
                onStreamBoundError("Stream ended while trying to bind it to a video element.");
            },

            // Timeout if it takes too long
            timeout = setTimeout(function() {
                if (videoElement.currentTime === 0) {
                    onStreamBoundError("The video stream failed to connect. Please notify the site owner if this continues to happen.");
                } else {
                    // This should never happen
                    OT.warn("Never got the loadedmetadata event but currentTime > 0");
                    onStreamBound();
                }
            }.bind(this), 30000);


        videoElement.addEventListener('loadedmetadata', onLoad, false);
        videoElement.addEventListener('error', onError, false);
        webRTCStream.onended = onStoppedLoading;
    } else {
        onStreamBound();
    }

    // This is ugly, but we're stuck with it until things stabilise a little more.
    //
    // You can't feature detect against (window.URL && window.URL.createObjectURL)
    // as Firefox actually has that. We just don't want to use it in this context.
    if (navigator.mozGetUserMedia) {
        videoElement.mozSrcObject = webRTCStream;
    }
    else {
        videoElement.src = window.URL.createObjectURL(webRTCStream);
    }

    videoElement.play();
}


})(window);
(function(window) {

// Singleton interval
var logQueue = [],
    queueRunning = false;


OT.Analytics = function() {

    var endPoint = OT.properties.loggingURL + "/logging/ClientEvent",
        endPointQos = OT.properties.loggingURL + "/logging/ClientQos",

        reportedErrors = {},

        // Map of camel-cased keys to underscored
        camelCasedKeys = {
            payloadType: 'payload_type',
            partnerId: 'partner_id',
            streamId: 'stream_id',
            sessionId: 'session_id',
            connectionId: 'connection_id',
            widgetType: 'widget_type',
            widgetId: 'widget_id',
            avgAudioBitrate: 'avg_audio_bitrate',
            avgVideoBitrate: 'avg_video_bitrate'
        },

        send = function(data, isQos, onSuccess, onError) {
            OT.$.post(isQos ? endPointQos : endPoint, {
                success: onSuccess,
                error: onError,
                data: data,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        },

        throttledPost = function() {
            // Throttle logs so that they only happen 1 at a time
            if (!queueRunning && logQueue.length > 0) {
                queueRunning = true;
                var curr = logQueue[0];

                // Remove the current item and send the next log
                var processNextItem = function() {
                    logQueue.shift();
                    queueRunning = false;
                    throttledPost();
                };

                if (curr) {
                    send(curr.data, curr.isQos, function() {
                        curr.onComplete();
                        setTimeout(processNextItem, 50);
                    }, function() {
                        OT.debug("Failed to send ClientEvent, moving on to the next item.");

                        // There was an error, move onto the next item
                        setTimeout(processNextItem, 50);
                    });
                }
            }
        },

        post = function(data, onComplete, isQos) {
            logQueue.push({
                data: data,
                onComplete: onComplete,
                isQos: isQos
            });

            throttledPost();
        },

        shouldThrottleError = function(code, type, partnerId) {
            if (!partnerId) return false;

            var errKey = [partnerId, type, code].join('_'),
                //msgLimit = DynamicConfig.get('exceptionLogging', 'messageLimitPerPartner', partnerId);
                msgLimit = 100;
            if (msgLimit === null || msgLimit === undefined) return false;

            return (reportedErrors[errKey] || 0) <= msgLimit;
        };

        // Log an error via ClientEvents.
        //
        // @param [String] code
        // @param [String] type
        // @param [String] message
        // @param [Hash] details additional error details
        //
        // @param [Hash] options the options to log the client event with.
        // @option options [String] action The name of the Event that we are logging. E.g. "TokShowLoaded". Required.
        // @option options [String] variation Usually used for Split A/B testing, when you have multiple variations of the +_action+.
        // @option options [String] payloadType A text description of the payload. Required.
        // @option options [String] payload The payload. Required.
        // @option options [String] sessionId The active OpenTok session, if there is one
        // @option options [String] connectionId The active OpenTok connectionId, if there is one
        // @option options [String] partnerId
        // @option options [String] guid ...
        // @option options [String] widgetId ...
        // @option options [String] streamId ...
        // @option options [String] section ...
        // @option options [String] build ...
        //
        // Reports will be throttled to X reports (see exceptionLogging.messageLimitPerPartner
        // from the dynamic config for X) of each error type for each partner. Reports can be
        // disabled/enabled globally or on a per partner basis (per partner settings
        // take precedence) using exceptionLogging.enabled.
        //
        this.logError = function(code, type, message, details, options) {
            if (!options) options = {};
            var partnerId = options.partnerId;

            if (OT.Config.get('exceptionLogging', 'enabled', partnerId) !== true) {
                return;
            }

            if (shouldThrottleError(code, type, partnerId)) {
                //OT.log("ClientEvents.error has throttled an error of type " + type + "." + code + " for partner " + (partnerId || 'No Partner Id'));
                return;
            }

            var errKey = [partnerId, type, code].join('_'),

                payload = this.escapePayload(OT.$.extend(details || {}, {
                    message: payload,
                    userAgent: navigator.userAgent
                }));


            reportedErrors[errKey] = typeof(reportedErrors[errKey]) !== 'undefined' ?
                                            reportedErrors[errKey] + 1 :
                                            1;

            return this.logEvent(OT.$.extend(options, {
                action: type + '.' + code,
                payloadType: payload[0],
                payload: payload[1]
            }));
        };

        // Log a client event to the analytics backend.
        //
        // @example Logs a client event called 'foo'
        //  OT.ClientEvents.log({
        //      action: 'foo',
        //      payload_type: "foo's payload",
        //      payload: 'bar',
        //      session_id: sessionId,
        //      connection_id: connectionId
        //  })
        //
        // @param [Hash] options the options to log the client event with.
        // @option options [String] action The name of the Event that we are logging. E.g. "TokShowLoaded". Required.
        // @option options [String] variation Usually used for Split A/B testing, when you have multiple variations of the +_action+.
        // @option options [String] payloadType A text description of the payload. Required.
        // @option options [String] payload The payload. Required.
        // @option options [String] session_id The active OpenTok session, if there is one
        // @option options [String] connection_id The active OpenTok connectionId, if there is one
        // @option options [String] partner_id
        // @option options [String] guid ...
        // @option options [String] widget_id ...
        // @option options [String] stream_id ...
        // @option options [String] section ...
        // @option options [String] build ...
        //
        this.logEvent = function(options) {
            var partnerId = options.partnerId;

            if (!options) options = {};

            // Set a bunch of defaults
            var data = OT.$.extend({
                    "variation" : "",
                    'guid' : this.getClientGuid(),
                    'widget_id' : "",
                    'session_id': '',
                    'connection_id': '',
                    'stream_id' : "",
                    'partner_id' : partnerId,
                    'source' : window.location.href,
                    'section' : "",
                    'build' : ""
                }, options),

                onComplete = function(){
                //  OT.log("logged: " + "{action: " + data["action"] + ", variation: " + data["variation"] + ", payload_type: " + data["payload_type"] + ", payload: " + data["payload"] + "}");
                };

            // We camel-case our names, but the ClientEvents backend wants them
            // underscored...
            for (var key in camelCasedKeys) {
                if (camelCasedKeys.hasOwnProperty(key) && data[key]) {
                    data[camelCasedKeys[key]] = data[key];
                    delete data[key];
                }
            }

            post(data, onComplete, false);
        };

        // Log a client QOS to the analytics backend.
        //
        this.logQOS = function(options) {
            var partnerId = options.partnerId;

            if (!options) options = {};

            // Set a bunch of defaults
            var data = OT.$.extend({
                    'guid' : this.getClientGuid(),
                    'widget_id' : "",
                    'session_id': '',
                    'connection_id': '',
                    'stream_id' : "",
                    'partner_id' : partnerId,
                    'source' : window.location.href,
                    'build' : "",
                    'duration' : 0 //in milliseconds
                }, options),

                onComplete = function(){
                    //OT.log("logged: " + "{action: " + data["action"] + ", variation: " + data["variation"] + ", payload_type: " + data["payload_type"] + ", payload: " + data["payload"] + "}");
                };

            // We camel-case our names, but the ClientEvents backend wants them
            // underscored...
            for (var key in camelCasedKeys) {
                if (camelCasedKeys.hasOwnProperty(key) && data[key]) {
                    data[camelCasedKeys[key]] = data[key];
                    delete data[key];
                }
            }

            post(data, onComplete, true);
        };

        // Converts +payload+ to two pipe seperated strings. Doesn't currently handle
        // edgecases, e.g. escaping "\\|" will break stuff.
        //
        // *Note:* It strip any keys that have null values.
        this.escapePayload = function(payload) {
            var escapedPayload = [],
                escapedPayloadDesc = [];

            for (var key in payload) {
                if (payload.hasOwnProperty(key) && payload[key] !== null && payload[key] !== undefined) {
                    escapedPayload.push( payload[key] ? payload[key].toString().replace('|', '\\|') : '' );
                    escapedPayloadDesc.push( key.toString().replace('|', '\\|') );
                }
            }

            return [
                escapedPayloadDesc.join('|'),
                escapedPayload.join('|')
            ];
        };
        // Uses HTML5 local storage to save a client ID.
        this.getClientGuid = function() {
            var guid;
            // In some browsers, checking for an error is the only way to detect if localStorage is supported.
            try {
                localStorage.getItem("opentok_client_id");
            } catch (error) {
            };
            var guid = localStorage.getItem("opentok_client_id");
            if (!guid) {
                guid = uuid();
                try {
                    localStorage.setItem("opentok_client_id", guid);
                } catch(error) {
                }
            }
            return guid;
        };
}

})(window);
(function(window) {

// This is not obvious, so to prevent end-user frustration we'll let them know
// explicitly rather than failing with a bunch of permission errors. We don't
// handle this using an OT Exception as it's really only a development thing.
if (location.protocol === 'file:') {
  alert("You cannot test a page using WebRTC through the file system due to browser permissions. You must run it over a web server.");
}

if (!window.OT) window.OT = {};

if (!window.URL && window.webkitURL) {
    window.URL = window.webkitURL;
}


var _publisherCount = 0,

    // Global parameters used by upgradeSystemRequirements
    _intervalId,
    _lastHash = document.location.hash,

    // Cached DeviceManager
    _deviceManager;


/**
* The first step in using the TokBox API is to call the <code>TB.initSession()</code> method. Other methods of TB object
* check for system requirements and set up error logging.
*
* @class TB
*/

/**
* <p class="mSummary">
* Initializes and returns the local session object for a specified session ID.
* </p>
* <p>
* You connect to an OpenTok session using the <code>connect()</code> method
* of the Session object returned by the <code>TB.initSession()</code> method.
* Note that calling <code>TB.initSession()</code> does not initiate communications
* with the cloud. It simply initializes the Session object that you can use to
* connect (and to perform other operations once connected).
* </p>
*
*  <p>
*    For an example, see <a href="Session.html#connect">Session.connect()</a>.
*  </p>
*
* @method TB.initSession
* @memberof TB
* @param {String} sessionId The session ID identifying the OpenTok session. For more information, see
* <a href="http://www.tokbox.com/opentok/api/tools/documentation/overview/session_creation.html">Session creation</a>.
* @returns {Session} The session object through which all further interactions with the session will occur.
*/
OT.initSession = function(sessionId) {
    if (!this.sessions[sessionId]) {
        this.sessions[sessionId] = new OT.Session(sessionId);
    }
    return this.sessions[sessionId];
};

/**
* <p class="mSummary">
*   Initializes and returns a Publisher object. You can then pass this Publisher
*   object to <code>Session.publish()</code> to publish a stream to a session.
* </p>
* <p>
*   <i>Note:</i> If you intend to reuse a Publisher object created using <code>TB.initPublisher()</code>
*   to publish to different sessions sequentially, call either <code>Session.disconnect()</code> or
*   <code>Session.unpublish()</code>. Do not call both. Then call the <code>preventDefault()</code> method
*   of the <code>streamDestroyed</code> or <code>sessionDisconnected</code> event object to prevent the
*   Publisher object from being removed from the page.
* </p>
* @param {String} apiKey The API key that TokBox provided you when you
* <a href="https://dashboard.tokbox.com/users/sign_in">signed up</a> for an OpenTok account.
* @param {String} replaceElementId The
* <code>id</code> attribute of the existing DOM element that the Publisher video replaces.
* If you do not specify a <code>replaceElementId</code>, the application
* appends a new DOM element to the HTML <code>body</code>.
*
* <p>
*       The application throws an error if an element with an ID set to the <code>replaceElementId</code>
*       value does not exist in the HTML DOM.
* </p>
*
* @param {Object} properties This is
* an <em>optional</em> object that contains the following properties (each of which are optional):
* </p>
* <ul>
* <li>
*   <strong>height</strong> (Number) &#151; The desired height, in pixels, of the
*   displayed Publisher video stream (default: 198). <i>Note:</i> Use the
*   <code>height</code> and <code>width</code> properties to set the dimensions
*   of the publisher video; do not set the height and width of the DOM element
*   (using CSS).
* </li>
* <li>
*   <strong>mirror</strong> (Boolean) &#151; Whether the publisher's video image
*   is mirrored in the publisher's page<. The default value is <code>true</code>
*   (the video image is mirrored). This property does not affect the display
*   on other subscribers' web pages.
* </li>
* <li>
*   <strong>name</strong> (String) &#151; The name for this stream. The name appears at the bottom of
*   Subscriber videos. The default value is "" (an empty string). Setting this to a string longer than
*   1000 characters results in an runtime exception.
* </li>
* <li>
*   <strong>publishAudio</strong> (Boolean) &#151; Whether to initially publish audio
*   for the stream (default: <code>true</code>). This setting applies when you pass
*   the Publisher object in a call to the <code>Session.publish()</code> method.
* </li>
* <li>
*   <strong>publishVideo</strong> (Boolean) &#151; Whether to initially publish video
*   for the stream (default: <code>true</code>). This setting applies when you pass
*   the Publisher object in a call to the <code>Session.publish()</code> method.
* </li>
* <li>
*   <strong>style</strong> (Object) &#151; An object containing properties that define the initial
*   appearance of user interface controls of the Publisher. Currently, the <code>style</code> object
*   includes one property: <code>nameDisplayMode</code>. Possible values for the <code>style.nameDisplayMode</code>
*   property are: <code>"auto"</code> (the name is displayed when the stream is first displayed
*   and when the user mouses over the display), <code>"off"</code> (the name is not displayed),
*   and <code>"on"</code> (the name is displayed).</li>
* </li>
* <li>
*   <strong>width</strong> (Number) &#151; The desired width, in pixels, of the
*   displayed Publisher video stream (default: 264). <i>Note:</i> Use the
*   <code>height</code> and <code>width</code> properties to set the dimensions
*   of the publisher video; do not set the height and width of the DOM element
*   (using CSS).
* </li>
* </ul>
*
* @returns {Publisher} The Publisher object.
* @see Session#publish
* @method TB.initPublisher
* @memberof TB
*/
OT.initPublisher = function(apiKey, replaceElementId, properties) {
    OT.debug("TB.initPublisher("+replaceElementId+")");

    var publisher = new OT.Publisher(),
        success,
        error;

    if (properties && properties.success) {
      success = properties.success;
      delete properties.success;
    }

    if (properties && properties.error) {
      error = properties.error;
      delete properties.error;
    }

    if (success) publisher.once('initSuccess', success);
    if (error) publisher.once('publishError', error);

    publisher.publish(replaceElementId, properties);

    return publisher;
};



/**
* Checks if the system supports OpenTok for WebRTC.
* @return {Number} Whether the system supports OpenTok for WebRTC (1) or not (0).
* @see <a href="#upgradeSystemRequirements">TB.upgradeSystemRequirements()</a>
* @method TB.checkSystemRequirements
* @memberof TB
*/
OT.checkSystemRequirements = function() {
    OT.debug("TB.checkSystemRequirements()");

    var systemRequirementsMet = OT.$.supportsWebSockets() && OT.$.supportsWebRTC() ? this.HAS_REQUIREMENTS : this.NOT_HAS_REQUIREMENTS;

    OT.checkSystemRequirements = function() {
      OT.debug("TB.checkSystemRequirements()");
      return systemRequirementsMet;
    };

    return systemRequirementsMet;
};


/**
* Displays information about system requirments for OpenTok for WebRTC. This information is displayed
* in an iframe element that fills the browser window.
* <p>
* <i>Note:</i> this information is displayed automatically when you call the <code>TB.initSession()</code>
* or the <code>TB.initPublisher()</code> method if the client does not support OpenTok for WebRTC.
* </p>
* @see <a href="#checkSystemRequirements">TB.checkSystemRequirements()</a>
* @method TB.upgradeSystemRequirements
* @memberof TB
*/
OT.upgradeSystemRequirements = function(){
    // trigger after the TB environment has loaded
    OT.onLoad( function() {
        // Determine whether there is a Chrome Frame meta tag on the page. If there is then we prompt to install Chrome Frame
        var cfMetaTag = false,
            metas = document.getElementsByTagName("meta");
        for (var i = 0; i < metas.length; i++) {
            var httpEquiv = metas[i].httpEquiv,
                content = metas[i].content;
            if (httpEquiv && httpEquiv.toLowerCase() === "x-ua-compatible" &&
                content && content.toLowerCase().indexOf("chrome=1") > -1) {
                    cfMetaTag = true;
                    break;
            }
        }

        var id = '_upgradeFlash';

         // Load the iframe over the whole page.
         document.body.appendChild((function(){
             var d = document.createElement('iframe');
             d.id = id;
             d.style.position = 'absolute';
             d.style.position = 'fixed';
             d.style.height = '100%';
             d.style.width = '100%';
             d.style.top = '0px';
             d.style.left = '0px';
             d.style.right = '0px';
             d.style.bottom = '0px';
             d.style.zIndex = 1000;
             try {
                 d.style.backgroundColor = "rgba(0,0,0,0.2)";
             } catch (err) {
                 // Old IE browsers don't support rgba and we still want to show the upgrade message
                 // but we just make the background of the iframe completely transparent.
                 d.style.backgroundColor = "transparent";
                 d.setAttribute("allowTransparency", "true");
             }
             d.setAttribute("frameBorder", "0");
             d.frameBorder = "0";
             d.scrolling = "no";
             d.setAttribute("scrolling", "no");
             d.src = OT.properties.assetURL + "/html/upgradeFlash.html" + (cfMetaTag ? "?cf=1" : "") + "#"+encodeURIComponent(document.location.href);
             return d;
         })());

         // Now we need to listen to the event handler if the user closes this dialog.
         // Since this is from an IFRAME within another domain we are going to listen to hash changes.
         // The best cross browser solution is to poll for a change in the hashtag.
         if (_intervalId) clearInterval(_intervalId);
         _intervalId = setInterval(function(){
             var hash = document.location.hash,
                 re = /^#?\d+&/;
             if (hash !== _lastHash && re.test(hash)) {
                 _lastHash = hash;
                 if( hash.replace(re, '') === 'close_window'){
                     document.body.removeChild(document.getElementById(id));
                     document.location.hash = '';
                 } else if (hash.replace(re, '') === 'installed_gcf') {
                       // Force the page to reload now that chrome frame is installed
                       document.location.hash = '';
                       document.location.href = document.location.href.replace("#", "");
                   }
             }
         }, 100);
    });
};


OT.reportIssue = function(){
    OT.warn("ToDo: haven't yet implemented TB.reportIssue");
};

OT.components = {};
OT.sessions = {};

// namespaces
OT.rtc = {};

// Define the APIKEY this is a global parameter which should not change
OT.APIKEY = (function(){
    // Script embed
    var script_src = (function(){
        var s = document.getElementsByTagName('script');
        s = s[s.length - 1];
        s = s.getAttribute('src') || s.src;
        return s;
    })();

    var m = script_src.match(/[\?\&]apikey=([^&]+)/i);
    return m ? m[1] : '';
})();

OT.HAS_REQUIREMENTS = 1;
OT.NOT_HAS_REQUIREMENTS = 0;

/**
* Registers a method as an event listener for a specific event. Note that this is a static method of the TB class.
*
* <p>
* The TB object dispatches one type of event &#151; an <code>exception</code> event. The following code adds an event
* listener for the <code>exception</code> event:
* </p>
*
* <pre>
* TB.addEventListener("exception", exceptionHandler);
*
* function exceptionHandler(event) {
*    alert("exception event. \n  code == " + event.code + "\n  message == " + event.message);
* }
* </pre>
*
* <p>
* 	If a handler is not registered for an event, the event is ignored locally. If the event listener function does not exist,
* 	the event is ignored locally.
* </p>
* <p>
* 	Throws an exception if the <code>listener</code> name is invalid.
* </p>
*
* @param {String} type The string identifying the type of event.
*
* @param {Function} listener The function to be invoked when the TB object dispatches the event.
* @memberOf TB
* @method addEventListener
*/

/**
* Removes an event listener for a specific event. Note that this is a static method of the TB class.
*
* <p>
* 	Throws an exception if the <code>listener</code> name is invalid.
* </p>
*
* @param {String} type The string identifying the type of event.
*
* @param {Function} listener The event listener function to remove.
*
* @memberOf TB
* @method removeEventListener
*/

/**
 * Dispatched by the TB class when the app encounters an exception.
 * Note that you set up an event handler for the <code>exception</code> event by calling the
 * <code>TB.addEventListener()</code> method, which is a <i>static</i> method.
 *
 * @name exception
 * @event
 * @borrows ExceptionEvent#message as this.message
 * @memberof TB
 * @see ExceptionEvent
 */

if (!window.OT) window.OT = OT;
if (!window.TB) window.TB = OT;

})(window);
(function(window) {

/**
 * The Event object defines the basic OpenTok event object that is passed to
 * event listeners. Other OpenTok event classes implement the properties and methods of
 * the Event object.</p>
 *
 * <p>For example, the Stream object dispatches a <code>streamPropertyChanged</code> event when
 * the stream's properties are updated. You register an event listener using the <code>addEventListener()</code>
 * method of the Stream object:</p>
 *
 * <pre>
 * stream.addEventListener("streamPropertyChanged", streamPropertyChangedHandler);
 *
 * function streamPropertyChangedHandler(event) {
 *     alert("Properties changed for stream " + event.target.streamId);
 * }</pre>
 *
 * @class Event
 * @property {Boolean} cancelable Whether the event has a default behavior that is cancelable (<code>true</code>)
 * or not (<code>false</code>). You can cancel the default behavior by calling the <code>preventDefault()</code> method
 * of the Event object in the event listener function. (See <a href="#preventDefault">preventDefault()</a>.)
 *
 * @property {Object} target The object that dispatched the event.
 *
 * @property {String} type  The type of event.
 */
OT.Event = function (type, cancelable) {
    this.type = type;
    this.cancelable = cancelable !== undefined ? cancelable : true;

    var _defaultPrevented = false,
        _target = null;

		/**
		* Prevents the default behavior associated with the event from taking place.
		*
		* <p>To see whether an event has a default behavior, check the <code>cancelable</code> property of the event object. </p>
		*
		* <p>Call the <code>preventDefault()</code> method in the event listener function for the event.</p>
		*
		* <p>The following events have default behaviors:</p>
		*
		* <ul>
		*
		*   <li><code>sessionDisconnect</code> &#151; See <a href="SessionDisconnectEvent.html#preventDefault">
		*   SessionDisconnectEvent.preventDefault()</a>.</li>
		*
		*   <li><code>streamDestroyed</code> &#151; See <a href="StreamEvent.html#preventDefault">
		*   StreamEvent.preventDefault()</a>.</li>
		*
		* </ul>
		*
		* @method #preventDefault
		* @memberof Event
		*/
    this.preventDefault = function() {
        if (this.cancelable) {
            _defaultPrevented = true;
        } else {
            OT.warn("Event.preventDefault :: Trying to preventDefault on an Event that isn't cancelable");
        }
    };

	/**
	* Whether the default event behavior has been prevented via a call to <code>preventDefault()</code> (<code>true</code>)
	* or not (<code>false</code>). See <a href="#preventDefault">preventDefault()</a>.
	* @method #isDefaultPrevented
	* @return {Boolean}
	* @memberof Event
	*/
    this.isDefaultPrevented = function() {
        return _defaultPrevented;
    };

    if (OT.$.canDefineProperty) {
        Object.defineProperty(this, 'target', {
            set: function(target) {
                _target = target;
            },

            get: function() {
                return _target;
            }
        });
    }
};

// Event names lookup
OT.Event.names = {
    // Activity Status for cams/mics
    ACTIVE: "active",
    INACTIVE: "inactive",
    UNKNOWN: "unknown",

    // Archive types
    PER_SESSION: "perSession",
    PER_STREAM: "perStream",

    // TB Events
    EXCEPTION: "exception",
    ISSUE_REPORTED: "issueReported",

    // Session Events
    SESSION_CONNECTED: "sessionConnected",
    SESSION_DISCONNECTED: "sessionDisconnected",
    STREAM_CREATED: "streamCreated",
    STREAM_DESTROYED: "streamDestroyed",
    CONNECTION_CREATED: "connectionCreated",
    CONNECTION_DESTROYED: "connectionDestroyed",
    SIGNAL: "signal",
    STREAM_PROPERTY_CHANGED: "streamPropertyChanged",
    MICROPHONE_LEVEL_CHANGED: "microphoneLevelChanged",
    ARCHIVE_CREATED: "archiveCreated",
    ARCHIVE_CLOSED: "archiveClosed",
    ARCHIVE_LOADED: "archiveLoaded",
    ARCHIVE_SAVED: "archiveSaved",
    SESSION_RECORDING_STARTED: "sessionRecordingStarted",
    SESSION_RECORDING_STOPPED: "sessionRecordingStopped",
    SESSION_RECORDING_IN_PROGRESS: "sessionRecordingInProgress",
    STREAM_RECORDING_IN_PROGRESS: "streamRecordingInProgress",
    SESSION_NOT_RECORDING: "sessionNotRecording",
    STREAM_NOT_RECORDING: "streamNotRecording",
    STREAM_RECORDING_STARTED: "streamRecordingStarted",
    STREAM_RECORDING_STOPPED: "streamRecordingStopped",
    PLAYBACK_STARTED: "playbackStarted",
    PLAYBACK_PAUSED: "playbackPaused",
    PLAYBACK_STOPPED: "playbackStopped",
    RECORDING_STARTED: "recordingStarted",
    RECORDING_STOPPED: "recordingStopped",

    // Publisher Events
    RESIZE: "resize",
    SETTINGS_BUTTON_CLICK: "settingsButtonClick",
    DEVICE_INACTIVE: "deviceInactive",
    INVALID_DEVICE_NAME: "invalidDeviceName",
    ACCESS_ALLOWED: "accessAllowed",
    ACCESS_DENIED: "accessDenied",
    ACCESS_DIALOG_OPENED: 'accessDialogOpened',
    ACCESS_DIALOG_CLOSED: 'accessDialogClosed',
    ECHO_CANCELLATION_MODE_CHANGED: "echoCancellationModeChanged",

    // DeviceManager Events
    DEVICES_DETECTED: "devicesDetected",

    // DevicePanel Events
    DEVICES_SELECTED: "devicesSelected",
    CLOSE_BUTTON_CLICK: "closeButtonClick",

    MICLEVEL : 'microphoneActivityLevel',
    MICGAINCHANGED : 'microphoneGainChanged',

    // Environment Loader
    ENV_LOADED: 'envLoaded'
};

OT.ValueEvent = function (type,value){
    OT.Event.call(this, type);
    this.value = value;

};

OT.ExceptionCodes = {
  JS_EXCEPTION: 2000,
  AUTHENTICATION_ERROR: 1004,
  INVALID_SESSION_ID: 1005,
  CONNECT_FAILED: 1006,
  CONNECT_REJECTED: 1007,
  CONNECTION_TIMEOUT: 1008,
  P2P_CONNECTION_FAILED: 1013,
  API_RESPONSE_FAILURE: 1014,
  UNABLE_TO_PUBLISH: 1500,
  UNABLE_TO_SIGNAL: 1510,
  UNABLE_TO_FORCE_DISCONNECT: 1520,
  UNABLE_TO_FORCE_UNPUBLISH: 1530
};

/**
* The {@link TB} class dispatches <code>exception</code> events when the TokBox API encounters
* an exception (error). The ExceptionEvent object defines the properties of the event
* object that is dispatched.
*
* <p>Note that you set up an event handler for the <code>exception</code> event by calling the
* <code>TB.addEventListener()</code> method, which is a <i>static</i> method.</p>
*
* @class ExceptionEvent
* @property {Number} code The error code. The following is a list of error codes:</p>
*
* <table class="docs_table">
*  <tbody><tr>
*   <td>
*   <b>code</b>
*
*   </td>
*   <td>
*   <b>title</b>
*   </td>
*  </tr>
*  <tr>
*   <td>
*   1000
*
*   </td>
*   <td>
*   Failed To Load
*   </td>
*  </tr>
*
*  <tr>
*   <td>
*   1004
*
*   </td>
*   <td>
*   Authentication error
*   </td>
*  </tr>
*
*  <tr>
*   <td>
*   1005
*
*   </td>
*   <td>
*   Invalid Session ID
*   </td>
*  </tr>
*  <tr>
*   <td>
*   1006
*
*   </td>
*   <td>
*   Connect Failed
*   </td>
*  </tr>
*  <tr>
*   <td>
*   1007
*
*   </td>
*   <td>
*   Connect Rejected
*   </td>
*  </tr>
*  <tr>
*   <td>
*   1008
*
*   </td>
*   <td>
*   Connect Time-out
*   </td>
*  </tr>
*  <tr>
*   <td>
*   1009
*
*   </td>
*   <td>
*   Security Error
*   </td>
*  </tr>
*   <tr>
*    <td>
*    1010
*
*    </td>
*    <td>
*    Not Connected
*    </td>
*   </tr>
*   <tr>
*    <td>
*    1011
*
*    </td>
*    <td>
*    Invalid Parameter
*    </td>
*   </tr>
*   <tr>
*    <td>
*    1013
*    </td>
*    <td>
*    Connection Failed
*    </td>
*   </tr>
*   <tr>
*    <td>
*    1014
*    </td>
*    <td>
*    API Response Failure
*    </td>
*   </tr>
*
*  <tr>
*    <td>
*    1500
*    </td>
*    <td>
*    Unable to Publish
*    </td>
*   </tr>
*
*  <tr>
*    <td>
*    1510
*    </td>
*    <td>
*    Unable to Signal
*    </td>
*   </tr>
*
*  <tr>
*    <td>
*    1520
*    </td>
*    <td>
*    Unable to Force Disconnect
*    </td>
*   </tr>
*
*  <tr>
*    <td>
*    1530
*    </td>
*    <td>
*    Unable to Force Unpublish
*    </td>
*   </tr>
*  <tr>
*    <td>
*    1535
*    </td>
*    <td>
*    Force Unpublish on Invalid Stream
*    </td>
*   </tr>
*
*  <tr>
*    <td>
*    2000
*
*    </td>
*    <td>
*    Internal Error
*    </td>
*  </tr>
*
*  <tr>
*    <td>
*    2010
*
*    </td>
*    <td>
*    Report Issue Failure
*    </td>
*  </tr>
*
*
*  </tbody></table>
*
*  <p>Check the <code>message</code> property for more details about the error.</p>
*
* @property {String} message The error message.
* @property {String} title The error title.
* @augments Event
*/
OT.ExceptionEvent = function (type, message, title, code, component, target) {
    OT.Event.call(this, type);

    this.message = message;
    this.title = title;
    this.code = code;
    this.component = component;
    this.target = target;
};


OT.IssueReportedEvent = function (type, issueId) {
    OT.Event.call(this, type);

    this.issueId = issueId;
};

// Triggered when the JS dynamic config and the DOM have loaded.
OT.EnvLoadedEvent = function (type) {
    OT.Event.call(this, type);
};


/**
 * The Session object dispatches a ConnectionEvent object when a connection is created or destroyed.
 *
 * <h5><a href="example"></a>Example</h5>
 *
 * <p>The following code keeps a running total of the number of connections to a session
 * by monitoring the <code>connections</code> property of the <code>sessionConnect</code>,
 * <code>connectionCreated</code> and <code>connectionDestroyed</code> events:</p>
 *
 * <pre>var apiKey = ""; // Replace with your API key. See https://dashboard.tokbox.com/projects
 * var sessionID = ""; // Replace with your own session ID.
 *                     // See https://dashboard.tokbox.com/projects
 * var token = ""; // Replace with a generated token that has been assigned the moderator role.
 *                 // See https://dashboard.tokbox.com/projects
 * var connectionCount = 0;
 *
 * var session = TB.initSession(sessionID);
 * session.addEventListener("sessionConnected", sessionConnectedHandler);
 * session.addEventListener("connectionCreated", connectionCreatedHandler);
 * session.addEventListener("connectionDestroyed", connectionDestroyedHandler);
 * session.connect(apiKey, token);
 *
 * function sessionConnectedHandler(event) {
 *    connectionCount = event.connections.length;
 *    displayConnectionCount();
 * }
 *
 * function connectionCreatedHandler(event) {
 *    connectionCount += event.connections.length;
 *    displayConnectionCount();
 * }
 *
 * function connectionDestroyedHandler(event) {
 *    connectionCount -= event.connections.length;
 *    displayConnectionCount();
 * }
 *
 * function displayConnectionCount() {
 *     document.getElementById("connectionCountField").value = connectionCount.toString();
 * }</pre>
 *
 * <p>This example assumes that there is an input text field in the HTML DOM
 * with the <code>id</code> set to <code>"connectionCountField"</code>:</p>
 *
 * <pre>&lt;input type="text" id="connectionCountField" value="0"&gt;&lt;/input&gt;</pre>
 *
 *
 * @property {Array} connections An array of Connection objects for the connections that were created or deleted.
 * You can compare the <code>connectionId</code> property to that of the <code>connection</code> property of the
 * Session object to see if a connection refers to the local web page.
 *
 * @property {String} reason For a <code>connectionDestroyed</code> event,
 *  a description of why the connection ended. This property can have two values:
 * </p>
 * <ul>
 *  <li><code>"clientDisconnected"</code> &#151; A client disconnected from the session by calling
 *     the <code>disconnect()</code> method of the Session object or by closing the browser.
 *     (See <a href="Session.html#disconnect">Session.disconnect()</a>.)</li>
 *
 *  <li><code>"forceDisconnected"</code> &#151; A moderator has disconnected the publisher from the session,
 *      by calling the <code>forceDisconnect()</code> method of the Session object.
 *      (See <a href="Session.html#forceDisconnect">Session.forceDisconnect()</a>.)</li>
 *
 *  <li><code>"networkDisconnected"</code> &#151; The network connection terminated abruptly (for example,
 *      the client lost their internet connection).</li>
 * </ul>
 *
 * <p>Depending on the context, this description may allow the developer to refine
 * the course of action they take in response to an event.</p>
 *
 * <p>For a <code>connectionCreated</code> event, this string is undefined.</p>
 *
 * @class ConnectionEvent
 * @augments Event
 */
OT.ConnectionEvent = function (type, connections, reason) {
    OT.Event.call(this, type);

    this.connections = connections;
    this.reason = reason;
};

/**
 * StreamEvent is an event that can have type "streamCreated" or "streamDestroyed". These events are dispatched when a client
 * starts or stops publishing to a {@link Session}. This includes remote clients publishing on the session as well as the local
 * client publishing to the session.
 *
 * <h4><a href="example_streamCreated"></a>Example &#151; streamCreated event</h4>
 *  <p>The following code initializes a session and sets up an event listener for when
 *    a stream is created:</p>
 *
 * <pre>var apiKey = ""; // Replace with your API key. See https://dashboard.tokbox.com/projects
 * var sessionID = ""; // Replace with your own session ID.
 *                     // See https://dashboard.tokbox.com/projects
 * var token = ""; // Replace with a generated token that has been assigned the moderator role.
 *                 // See https://dashboard.tokbox.com/projects
 *
 * var session = TB.initSession(sessionID);
 * session.addEventListener("streamCreated", streamCreatedHandler);
 * session.connect(apiKey, token);
 *
 * function streamCreatedHandler(event) {
 *     for (var i = 0; i &lt; event.streams.length; i++) {
 *         // Only display others' streams, not those that the client publishes.
 *         if (event.streams[i].connection.connectionId != event.target.connection.connectionId) {
 *                displayStream(stream);
 *         }
 *     }
 * }
 *
 * function displayStream(stream) {
 *     var div = document.createElement('div');
 *     div.setAttribute('id', 'stream' + stream.streamId);
 *
 *     var streamsContainer = document.getElementById('streamsContainer');
 *     streamsContainer.appendChild(div);
 *
 *     subscriber = session.subscribe(stream, 'stream' + stream.streamId);
 * }</pre>
 *
 *  <p>For this example, in addition to the event handler for the <code>streamCreated</code>
 *  event, you would probably want to create an event handler for the <code>sessionConnected</code>
 *  event. This event handler can display the streams that are present when the session first
 *  connects. See {@link SessionConnectEvent}.</p>
 *
 *  <h4><a href="example_streamDestroyed"></a>Example &#151; streamDestroyed event</h4>
 *
 *    <p>The following code initializes a session and sets up an event listener for when a
 *       stream ends:</p>
 *
 * <pre>var apiKey = ""; // Replace with your API key. See https://dashboard.tokbox.com/projects
 * var sessionID = ""; // Replace with your own session ID.
 *                     // See https://dashboard.tokbox.com/projects
 * var token = ""; // Replace with a generated token that has been assigned the moderator role.
 *                 // See https://dashboard.tokbox.com/projects
 *
 * var session = TB.initSession(sessionID);
 * session.addEventListener("streamDestroyed", streamDestroyedHandler);
 * session.connect(apiKey, token);
 *
 * function streamDestroyedHandler(event) {
 *     for (var i = 0; i &lt; event.streams.length; i++) {
 *         var stream = event.streams[i];
 *         alert("Stream " + stream.name + " ended. " + event.reason);
 *     }
 * }</pre>
 *
 * @class StreamEvent
 * @property {Array} streams An array of Stream objects
 * corresponding to the streams to which this event refers. This is usually an array containing only
 * one Stream object, corresponding to the stream that was added (in the case of a <code>streamCreated</code>
 * event) or deleted (in the case of a <code>streamDestroyed</code> event). However, the array may contain
 * multiple Stream objects if multiple streams were added or deleted. A stream may be published by the local client
 * or another client connected to the session.
 *
 * @property {String} reason For a <code>streamDestroyed</code> event,
 *  a description of why the session disconnected. This property can have one of the following values:
 * </p>
 * <ul>
 *  <li><code>"clientDisconnected"</code> &#151; A client disconnected from the session by calling
 *     the <code>disconnect()</code> method of the Session object or by closing the browser.
 *     (See <a href="Session.html#disconnect">Session.disconnect()</a>.)</li>
 *
 *  <li><code>"forceDisconnected"</code> &#151; A moderator has disconnected the publisher of the
 *   	stream from the session, by calling the <code>forceDisconnect()</code> method of the Session object.
 *      (See <a href="Session.html#forceDisconnect">Session.forceDisconnect()</a>.)</li>
 *
 *  <li><code>"forceUnpublished"</code> &#151; A moderator has forced the publisher of the stream to stop
 *   	publishing the stream, by calling the <code>forceUnpublish()</code> method of the Session object.
 *      (See <a href="Session.html#forceUnpublish">Session.forceUnpublish()</a>.)</li>
 *
 *  <li><code>"networkDisconnected"</code> &#151; The network connection terminated abruptly (for example,
 *      the client lost their internet connection).</li>
 *
 * </ul>
 *
 * <p>Depending on the context, this description may allow the developer to refine
 * the course of action they take in response to an event.</p>
 *
 * <p>For a <code>streamCreated</code> event, this string is undefined.</p>
 *
 *
 * @property {Boolean} cancelable 	Whether the event has a default behavior that is cancelable (<code>true</code>) or not (<code>false</code>).
 *  You can cancel the default behavior by calling the <code>preventDefault()</code> method of
 *  the StreamEvent object in the event listener function. The <code>streamDestroyed</code>
 *  event is cancelable. (See <a href="#preventDefault">preventDefault()</a>.)
 * @augments Event
 */
OT.StreamEvent = function (type, streams, reason, cancelable) {
    OT.Event.call(this, type, cancelable);

    this.streams = streams;
    this.reason = reason;
};

/**
* Prevents the default behavior associated with the event from taking place.
*
* <p>For the <code>streamDestroyed</code> event, if the <code>reason</code> is set to <code>"forceDisconnected"</code>
* or <code>networkDisconnected</code>, the default behavior is that all Subscriber objects that are
* subscribed to the stream are unsubscribed (and removed from the HTML DOM). If you call the <code>preventDefault()</code>
* method in the event listener for the <code>streamDestroyed</code> event, the default behavior is prevented and
* you can, optionally, clean up Subscriber objects using your own code. See
* <a href="Session.html#getSubscribersForStream">Session.getSubscribersForStream()</a>.</p>
*
* <p>If the <code>reason</code> property is set to <code>"forceUnpublished"</code>, the default behavior
* is that the associated Subscriber or Publisher objects corresponding with the stream are unsubscribed
* or unpublished (and removed from the HTML DOM). If you call the <code>preventDefault()</code> method in the
* event listener for the <code>streamDestroyed</code> event, the default behavior is prevented and
* you can, optionally, clean up Subscriber or Publisher objects using your own code. See
* <a href="Session.html#getPublisherForStream">Session.getPublisherForStream()</a> and
* <a href="Session.html#getSubscribersForStream">Session.getSubscribersForStream()</a>.</p>
*
* <p>To see whether an event has a default behavior, check the <code>cancelable</code> property of the event object. </p>
*
* <p>Call the <code>preventDefault()</code> method in the event listener function for the event.</p>
*
* @method #preventDefault
* @memberof StreamEvent
*/


/**
 * The Session object dispatches SessionConnectEvent object when a session has successfully connected in response to a call to
 * the <code>connect()</code> method of the Session object.
 *
 *  <p>
 *  For an example, see <a href="Session.html#connect">Session.connect()</a>.
 *  </p>
 *
 * @class SessionConnectEvent
 * @property {Array} connections An array of Connection objects, representing connections to the session.
 * (Note that each connection can publish multiple streams.)
 * @property {Array} streams An array of Stream objects corresponding to the streams currently available in the session that has connected.
 * @augments Event
 */
OT.SessionConnectEvent = function (type, connections, streams, archives) {
    OT.Event.call(this, type);

    this.connections = connections;
    this.streams = streams;
    this.archives = archives;
    this.groups = []; // Deprecated in OpenTok v0.91.48
};

/**
 * The Session object dispatches SessionDisconnectEvent object when a session has disconnected. This event may be dispatched asynchronously in
 * response to a successful call to the <code>disconnect()</code> method of the session object.
 *
 *  <h4>
 *  	<a href="example"></a>Example
 *  </h4>
 *  <p>
 *  	The following code initializes a session and sets up an event listener for when a session is disconnected.
 *  </p>
 * <pre>var apiKey = ""; // Replace with your API key. See https://dashboard.tokbox.com/projects
 *  var sessionID = ""; // Replace with your own session ID.
 *                      // See https://dashboard.tokbox.com/projects
 *  var token = ""; // Replace with a generated token that has been assigned the moderator role.
 *                  // See https://dashboard.tokbox.com/projects
 *
 *  var session = TB.initSession(sessionID);
 *  session.addEventListener("sessionDisconnected", sessionDisconnectedHandler);
 *  session.connect(apiKey, token);
 *
 *  function sessionDisConnectedHandler(event) {
 *      alert("The session disconnected. " + event.reason);
 *  }
 *  </pre>
 *
 * @property {String} reason A description of why the session disconnected.
 *   This property can have two values:
 *  </p>
 *  <ul>
 *  	<li><code>"clientDisconnected"</code> &#151; A client disconnected from the session by calling
 *  	 the <code>disconnect()</code> method of the Session object or by closing the browser.
 *      ( See <a href="Session.html#disconnect">Session.disconnect()</a>.)</li>
 *  	<li><code>"forceDisconnected"</code> &#151; A moderator has disconnected you from the session
 *   	 by calling the <code>forceDisconnect()</code> method of the Session object. (See
 *       <a href="Session.html#forceDisconnect">Session.forceDisconnect()</a>.)</li>
 *  	<li><code>"networkDisconnected"</code> &#151; The network connection terminated abruptly (for example,
 *       the client lost their internet connection).</li>
 *  </ul>
 *
 * @class SessionDisconnectEvent
 * @augments Event
 */
OT.SessionDisconnectEvent = function (type, reason, cancelable) {
    OT.Event.call(this, type, cancelable);

    this.reason = reason;
};

/**
* Prevents the default behavior associated with the event from taking place.
*
* <p>For the <code>sessionDisconnectEvent</code>, the default behavior is: all Subscriber objects are unsubscribed,
* and Publisher objects are destroyed. If you call the <code>preventDefault()</code> method in the
* event listener for the <code>sessionDisconnect</code> event, the default behavior is prevented (and
* you can, optionally, clean up Subscriber and Publisher objects using your own code).
*
* <p>To see whether an event has a default behavior, check the <code>cancelable</code> property of the event object. </p>
*
* <p>Call the <code>preventDefault()</code> method in the event listener function for the event.</p>
*
* @method #preventDefault
* @memberof SessionDisconnectEvent
*/

OT.VolumeEvent = function (type, streamId, volume) {
    OT.Event.call(this, type);

    this.streamId = streamId;
    this.volume = volume;
};


OT.DeviceEvent = function (type, camera, microphone) {
    OT.Event.call(this, type);

    this.camera = camera;
    this.microphone = microphone;
};

OT.DeviceStatusEvent = function (type, cameras, microphones, selectedCamera, selectedMicrophone) {
    OT.Event.call(this, type);

    this.cameras = cameras;
    this.microphones = microphones;
    this.selectedCamera = selectedCamera;
    this.selectedMicrophone = selectedMicrophone;
};

OT.ResizeEvent = function (type, widthFrom, widthTo, heightFrom, heightTo) {
    OT.Event.call(this, type);

    this.widthFrom = widthFrom;
    this.widthTo = widthTo;
    this.heightFrom = heightFrom;
    this.heightTo = heightTo;
};

/**
 * The Session object dispatches a <code>streamPropertyChanged</code> event in the following circumstances:
 *
 * <ul>
 *
 * 	<li>When a publisher starts or stops publishing audio or video. This change causes the <code>hasAudio</code>
 * 	or <code>hasVideo</code> property of the Stream object to change. This change results from a call to the
 * 	<code>publishAudio()</code> or <code>publishVideo()</code> methods of the Publish object.</li>
 *
 * 	<li>When the <code>videoDimensions</code> property of a stream changes. For more information,
 * 	see <a href="Stream.html#properties">Stream.videoDimensions</a>.</li>
 *
 * </ul>
 *
 * @class StreamPropertyChangedEvent
 * @property {String} changedProperty The property of the stream that changed. This value is either <code>"hasAudio"</code>,
 * <code>"hasVideo"</code>, or <code>"videoDimensions"</code>.
 * @property {Stream} stream The Stream object for which a property has changed.
 * @property {Object} newValue The new value of the property (after the change).
 * @property {Object} oldValue The old value of the property (before the change).
 *
 * @see <a href="Publisher.html#publishAudio">Publisher.publishAudio()</a></p>
 * @see <a href="Publisher.html#publishVideo">Publisher.publishVideo()</a></p>
 * @see <a href="Stream.html#properties">Stream.videoDimensions</a></p>
 * @augments Event
 */
OT.StreamPropertyChangedEvent = function (type, stream, changedProperty, oldValue, newValue) {
    OT.Event.call(this, type);

    this.type = type;
    this.stream = stream;
    this.changedProperty = changedProperty;
    this.oldValue = oldValue;
    this.newValue = newValue;
};

OT.ArchiveEvent = function (type, archives) {
    OT.Event.call(this, type);

    this.archives = archives;
};

OT.ArchiveStreamEvent = function (type, archive, streams) {
    OT.Event.call(this, type);

    this.archive = archive;
    this.streams = streams;
};

OT.StateChangedEvent = function (type, changedValues) {
    OT.Event.call(this, type);

    this.changedValues = changedValues;
};

OT.ChangeFailedEvent = function (type, reasonCode, reason, failedValues) {
    OT.Event.call(this, type);

    this.reasonCode = reasonCode;
    this.reason = reason;
    this.failedValues = failedValues;
};

OT.SignalEvent = function(type, data, from) {
    OT.Event.call(this, type ? "signal:" + type : OT.Event.names.SIGNAL, false);

    this.data = data;
    this.from = from;
};

})(window);
(function(window) {

OT.WebSocketMessageType = {
    CONNECTED_TO_WEBSOCKET_SERVER:  1000,
    CONNECT_TO_SESSION:             1001,

    SIGNAL: 1002,

    CONNECTION_CREATED:         1003,
    CONNECTION_DESTROYED:       1004,
    CONNECTION_COUNT_CHANGED:   1005,

    STREAM_CREATED:     1006,
    STREAM_MODIFIED:    1007,
    STREAM_DESTROYED:   1008,

    FORCE_DISCONNECT:   1009,
    FORCE_UNPUBLISH:    1010,

    JSEP_OFFER:     1011,
    JSEP_ANSWER:    1012,
    JSEP_PRANSWER:  1013,
    JSEP_CANDIDATE: 1014,
    JSEP_SUBSCRIBE: 1015,
    JSEP_UNSUBSCRIBE: 1016,

    WEBSOCKET_PING: 1017,
    WEBSOCKET_PONG: 1018,
    STREAM_REGISTERED: 1019,
    
    SUBSCRIBER_MODIFIED: 1020,
    SUBSCRIBER_VIDEO_DISABLED: 1022,

    /* Errors */

    SESSION_CONNECT_FAILED:   1100,
    PUBLISH_FAILED:           1101,
    SUBSCRIBE_FAILED:	  			1102,
    FORCEDISCONNECT_FAILED:	  1103,
    FORCEUNPUBLISH_FAILED:	  1104
};

})(window);
(function(window) {

OT.WebSocketMessage = function (type, payload) {

	this.type = type;
	this.payload = payload;

	this.toString = function () {
		return JSON.stringify(this);
	};

};

OT.WebSocketMessage.connectToSessionMessage = function (sessionId, apiKey, token, connectionObjectsRequired, p2pEnabled) {
	return {
		type: OT.WebSocketMessageType.CONNECT_TO_SESSION,
		payload: {
			sessionId: sessionId,
			apiKey: apiKey,
			token: token,
			supportsWebRTC: OT.$.supportsWebRTC(),
			connectionObjects: connectionObjectsRequired,
			p2pEnabled: p2pEnabled
		}
	};
};

OT.WebSocketMessage.createStream = function(publisherId, name, videoOrientation, videoWidth, videoHeight, hasAudio, hasVideo, p2pEnabled) {
	var request = {
		type: OT.WebSocketMessageType.STREAM_CREATED,
		payload: {
			publisherId: publisherId,
			name: name,
			orientation: {
				videoOrientation: videoOrientation,
				width: videoWidth,
				height: videoHeight
			},
			hasAudio: hasAudio,
			hasVideo: hasVideo,
			p2pEnabled: p2pEnabled
		}
	};

	return request;
};

OT.WebSocketMessage.modifyStream = function(streamId, key, value) {
	var request = {
		type: OT.WebSocketMessageType.STREAM_MODIFIED,
		payload: {
			streamId: streamId,
			key: key,
			value: value
		}
	};

	return request;
};

OT.WebSocketMessage.destroyStream = function(streamId) {
	return {
		type: OT.WebSocketMessageType.STREAM_DESTROYED,
		payload: {
			streamId: streamId
		}
	};
};


OT.WebSocketMessage.jsepMessage = function(fromAddress, addresses, jsepType, payload) {
	payload.fromAddress = fromAddress;
	payload.toAddresses = addresses;

	var request = {
		type: jsepType,
		payload: payload
	};

	return request;
};

OT.WebSocketMessage.forceDisconnect = function(connectionId) {
	return {
		type: OT.WebSocketMessageType.FORCE_DISCONNECT,
		payload: {
			connectionId: connectionId
		}
	};
};

OT.WebSocketMessage.forceUnpublish = function(streamId) {
	return {
		type: OT.WebSocketMessageType.FORCE_UNPUBLISH,
		payload: {
			streamId: streamId
		}
	};
};

OT.WebSocketMessage.pingMessage = function(fromAddress, message) {
	return {
		type: OT.WebSocketMessageType.WEBSOCKET_PING,
		payload: {
			message: message,
			timestamp: (+Date.now()).toString()
		}
	};
};

OT.WebSocketMessage.pongMessage = function(message, timestamp) {
	return {
		type: OT.WebSocketMessageType.WEBSOCKET_PONG,
		payload: {
			message: message,
			timestamp: parseInt(timestamp, 10)
		}
	};
};

OT.WebSocketMessage.modifySubscriber = function(streamId, key, value) {
	var request = {
		type: OT.WebSocketMessageType.SUBSCRIBER_MODIFIED,
		payload: {
			streamId: streamId,
			key: key,
			value: value
		}
	};

	return request;
};

var MAX_SIGNAL_DATA_LENGTH = 8192;
var MAX_SIGNAL_TYPE_LENGTH = 128;

//
// Error Codes:
// 413 - Type too long
// 400 - Type is invalid
// 413 - Data too long
// 400 - Data is invalid (can't be parsed as JSON)
// 429 - Rate limit exceeded
// 500 - Websocket connection is down
// 404 - To connection does not exist
// 400 - To is invalid
//
// +options+ can take success and error callback functions. These will be
// executed in a async (non-blocking) fashion.
//
OT.WebSocketMessage.signalMessage = function(sessionId, fromConnectionId, options) {
	var message = options || {},
		json = null;

	this.id = uuid();
	this.signal = {};

	if (message.type) this.signal.type = message.type;
	if (message.data) this.signal.data = message.data;

	this.onSuccess = message.success && OT.$.isFunction(message.success) ? OT.$.createAsyncHandler(message.success) : null;
	this.onError = message.error && OT.$.isFunction(message.error) ? OT.$.createAsyncHandler(message.error) : null;


	var isInvalidType = function(type) {
			// Our format matches the unreserved characters from the URI RFC: http://www.ietf.org/rfc/rfc3986
			return !/^[a-zA-Z0-9\-\._~]+$/.exec(type);
		},

		validateTo = function() {
			if (!message.hasOwnProperty('to')) {
				return null;
			}
			else if (!message.to) {
				return {code: 400, reason: "The To field was null or undefined. Either set it to a String value or omit it"};
			}
			else if ( message.to instanceof OT.Connection || message.to instanceof OT.Session ) {
				return null;
			}
			else if ( Array.isArray(message.to) ) {
				for (var i=0; i<message.to.length; i++) {
					if ( !(message.to[i] instanceof OT.Connection || message.to[i] instanceof OT.Session) ) {
						return {code: 400, reason: "The To field was invalid"};
					}
				}

				return null;
			}
			else {
				return {code: 400, reason: "The To field was invalid"};
			}
		},

		validateType = function() {
			var error = null;

			if (message.hasOwnProperty('type')) {
				if (!message.type) {
					error = {code: 400, reason: "The signal type was null or undefined. Either set it to a String value or omit it"};
				}
				else if (message.type.length > MAX_SIGNAL_TYPE_LENGTH) {
					error = {code: 413, reason: "The signal type was too long, the maximum length of it is " + MAX_SIGNAL_TYPE_LENGTH + " characters"};
				}
				else if ( isInvalidType(message.type) ) {
					error = {code: 400, reason: "The signal type was invalid, it can only contain letters, numbers, '-', '_', and '~'."};
				}
			}

			return error;
		},

		validateData = function() {
			if (!message.hasOwnProperty('data')) return null;

			var error = null;
			if (!message.data) {
				error = {code: 400, reason: "The signal data was null or undefined. Either set it to a String value or omit it"};
			}
			else {
				try {
					if (JSON.stringify(message.data).length > MAX_SIGNAL_DATA_LENGTH) {
						error = {code: 413, reason: "The data field was too long, the maximum size of it is " + MAX_SIGNAL_DATA_LENGTH + " characters"};
					}
				}
				catch(e) {
					error = {code: 400, reason: "The data field was not valid JSON"};
				}
			}

			return error;
		};

	this.toJson = function() {
		return json;
	};

	this.error = validateData();
	if (!this.error) this.error = validateTo();
	if (!this.error) this.error = validateType();
	this.valid = this.error === null;

	if (this.valid) {
		// Massage the to field into an array and default it to the session id
		// if we're sending to no one
		if (message.to && !Array.isArray(message.to)) {
			this.signal.to = [message.to];
		}
		else if (!message.to || message.to.length === 0) {
			// if it was omitted then we'll send the signal to the entire session.
			this.signal.to = [sessionId];
		}
		else {
			this.signal.to = message.to;
		}

		var payload = {
			id: this.id,
			toAddresses: this.signal.to.map(function(thing) { return typeof(thing) === 'string' ? thing : thing.id; }),
			fromAddress: fromConnectionId
		};

		if (message.type) payload.type = message.type;
		if (message.data) payload.data = message.data;

		json = JSON.stringify({
			type: OT.WebSocketMessageType.SIGNAL,
			payload: payload
		});
	}

	message = null;
};

})(window);
(function(window) {

function SignalError(code, reason, signal) {
    this.code = code;
    this.reason = reason;
    this.signal = signal;
}

OT.Messenger = function(messagingServer, messageWrangler) {
	var _messageMapping = {};
	_messageMapping[OT.WebSocketMessageType.CONNECT_TO_SESSION] = {type: "SessionConnected", afterConnected: false};
	_messageMapping[OT.WebSocketMessageType.SESSION_CONNECT_FAILED] = {type: "SessionConnectFailed", afterConnected: false};
	_messageMapping[OT.WebSocketMessageType.CONNECTION_CREATED] = {type: "ConnectionCreated", afterConnected: true};
	_messageMapping[OT.WebSocketMessageType.CONNECTION_DESTROYED] = {type: "ConnectionDestroyed", afterConnected: true};
	_messageMapping[OT.WebSocketMessageType.STREAM_CREATED] = {type: "StreamCreated", afterConnected: true};
	_messageMapping[OT.WebSocketMessageType.STREAM_MODIFIED] = {type: "StreamModified", afterConnected: true};
	_messageMapping[OT.WebSocketMessageType.STREAM_DESTROYED] = {type: "StreamDestroyed", afterConnected: true};
	_messageMapping[OT.WebSocketMessageType.STREAM_REGISTERED] = {type: "StreamRegistered", afterConnected: true};
	_messageMapping[OT.WebSocketMessageType.JSEP_OFFER] = {type: "JSEPMessageReceived", afterConnected: true};
	_messageMapping[OT.WebSocketMessageType.JSEP_ANSWER] = {type: "JSEPMessageReceived", afterConnected: true};
	_messageMapping[OT.WebSocketMessageType.JSEP_PRANSWER] = {type: "JSEPMessageReceived", afterConnected: true};
	_messageMapping[OT.WebSocketMessageType.JSEP_CANDIDATE] = {type: "JSEPMessageReceived", afterConnected: true};
	_messageMapping[OT.WebSocketMessageType.JSEP_SUBSCRIBE] = {type: "JSEPMessageReceived", afterConnected: true};
	_messageMapping[OT.WebSocketMessageType.JSEP_UNSUBSCRIBE] = {type: "JSEPMessageReceived", afterConnected: true};
	_messageMapping[OT.WebSocketMessageType.SIGNAL] = {type: "SignalReceived", afterConnected: true};
    _messageMapping[OT.WebSocketMessageType.SUBSCRIBER_VIDEO_DISABLED] = {type: "SubscriberVideoDisabled", afterConnected: true};

	var WEB_SOCKET_KEEP_ALIVE_INTERVAL = 25000;

	// Magic Connectivity Timeout Constant: We wait 2*the keep alive interval,
	// on the third keep alive we trigger the timeout if we haven't received the
	// server pong.
	var WEB_SOCKET_CONNECTIVITY_TIMEOUT = 3*WEB_SOCKET_KEEP_ALIVE_INTERVAL - 100;

	OT.$.eventing(this);

	this.onSessionConnected = null;
	this.onConnectionClosed = null;

	this.webSocket = null;
	this.connectionId = null;

	var _sessionId,
		_sessionToken,
		_sessionOptions,
		_timeout,
		_keepAliveTimer,
		_disconnecting = false,
		_analytics = new OT.Analytics(),
		_messageQ = [],
		_connected = false,
		_connectionId,
		_lastPong = null;


	var logAnalyticsEvent = function(variation, payloadType, payload, options) {
		var event = {
			action: 'webSocketConnection',
			variation: variation,
			payload_type: payloadType,
			payload: payload,
			session_id: _sessionId,
			partner_id: _sessionOptions["partnerId"],
			widget_id: _sessionOptions["widgetId"],
			widget_type: 'Controller'
		};

		if (options) event = OT.$.extend(options, event);
		_analytics.logEvent(event);
	};

	this.connect = function (sessionId, sessionToken, options) {
		_sessionId = sessionId;
		_sessionToken = sessionToken;
		_sessionOptions = options;
		_webSocketUrl = OT.properties.messagingProtocol + "://" + messagingServer + ":" + OT.properties.messagingPort + "/rumorwebsockets";

		var analyticsPayload = [_webSocketUrl, navigator.userAgent, OT.properties.version, window.externalHost ? "yes" : "no"];
		logAnalyticsEvent(
			'Attempt',
			"webSocketServerUrl|userAgent|sdkVersion|chromeFrame",
			analyticsPayload.map(function(e) { return e.replace('|', '\\|'); }).join('|')
		);

		this.webSocket = new WebSocket(_webSocketUrl);
		this.webSocket.onopen = webSocketConnected;
		this.webSocket.onclose = webSocketDisconnected;
		this.webSocket.onerror = webSocketError;
		this.webSocket.onmessage = webSocketReceivedMessage;

		_timeout = setTimeout(function() {
			logAnalyticsEvent('Failure', "reason", "Connection to the server timed out waiting to receive connected message.");

			self.trigger("exception", "Connection to the server timed out.", OT.ExceptionCodes.CONNECTION_TIMEOUT);
		}, 15000);
	};

	this.disconnect = function() {
		_disconnecting = true;
		if (this.webSocket) {
			this.webSocket.close();

			this.webSocket = null;
		}
	};

	this.sendMessage = function (message) {
		OT.warn("Sending WebSocket message: " + JSON.stringify(message));
		this.webSocket.send(JSON.stringify(message));
	};

	this.signal = function (options) {
		var message = new OT.WebSocketMessage.signalMessage(_sessionId, _connectionId, options);

		var callOnError = function callOnError() {
			if (message.onError) {
				message.onError(new SignalError(message.error.code, message.error.reason, message.signal));
			}
		};

		if (message.valid) {
			OT.warn("Sending WebSocket signal: " + message.toJson());

			try {
				this.webSocket.send(message.toJson());
				if (message.onSuccess) message.onSuccess(message.signal);
			}
			catch(e) {
				callOnError();
			}
		}
		else {
			callOnError();
		}
	};

	function webSocketConnected () {
		OT.debug("WebSocket connected");
		clearTimeout(_timeout);
		_timeout = setTimeout(function() {
			logAnalyticsEvent('Failure', "reason", "Connection to the server timed out waiting to receive connected message.");

			self.trigger("exception", "Connection to the server timed out waiting to receive connected message.", OT.ExceptionCodes.CONNECTION_TIMEOUT);
		}, 15000);
	}

	function webSocketError(error) {
    OT.debug("WebSocket error: " + error.data);

		self.trigger("exception", "TB.Socket Error :: The socket to " +  messagingServer + " received an error: " + (error.data || 'Unknown Error'), OT.ExceptionCodes.CONNECT_FAILED);
	}

	function webSocketDisconnected() {
		clearTimeout(_keepAliveTimer);
		self.trigger('ConnectionClosed', {reason: _disconnecting ? "clientDisconnected" : "networkDisconnected"});

		_connectionId = null;
		_connected = false;
	}

	function webSocketReceivedMessage(message) {
		OT.warn("WebSocket message recieved: " + message.data);
		handleWebSocketMessage(message.data);
	}

	function handleWebSocketMessage(message) {
		var messageObject = JSON.parse(message);

		switch (messageObject.type) {
			case OT.WebSocketMessageType.CONNECTED_TO_WEBSOCKET_SERVER:
				didConnectToWebSocket(messageObject.payload);
				break;

			case OT.WebSocketMessageType.WEBSOCKET_PONG:
				_lastPong = +Date.now();
				break;


			case OT.WebSocketMessageType.CONNECT_TO_SESSION:
				clearTimeout(_timeout);
				_connected = true;
				_connectionId = messageObject.payload.connectionId;
				sendPingKeepAlive();
				// Intentionally missing the break here

			default:
				if (_messageMapping.hasOwnProperty(messageObject.type)) {
					var methodString = _messageMapping[messageObject.type].type;
					OT.debug("Received " + methodString);
                    if (!_connected && _messageMapping[messageObject.type].afterConnected) {
                        queueMessage(message);
                    } else {
                        self.trigger(methodString, messageWrangler.wrangle(messageObject.payload));
                    }
				} else {
					OT.debug("Message type " + messageObject.type + " was not handled.");
				}
				if (messageObject.type === OT.WebSocketMessageType.CONNECT_TO_SESSION) emptyMessageQueue();
			break;
		}
	}

	function queueMessage(message) {
		_messageQ.push(message);
	}

	function emptyMessageQueue() {
		while(_messageQ.length > 0) {
			handleWebSocketMessage(_messageQ.shift());
	        }
	}

	function hasLostConnectivity() {
		if (!_lastPong) return false;

		return (+Date.now() - _lastPong) >= WEB_SOCKET_CONNECTIVITY_TIMEOUT;
	}

	function sendPingKeepAlive() {
		if ( hasLostConnectivity() ) {
			OT.error("We seem to have lost connectivity!");
			webSocketDisconnected();
		}
		else {
			self.sendMessage(OT.WebSocketMessage.pingMessage(self.connectionId, "ping!"));
			_keepAliveTimer = setTimeout(sendPingKeepAlive, WEB_SOCKET_KEEP_ALIVE_INTERVAL);
		}
	}

	function didConnectToWebSocket(message) {
		self.connectionId = message.connectionId;

		logAnalyticsEvent('Success', "webSocketServerUrl", _webSocketUrl, {connectionId: message.connectionId});

		clearTimeout(_timeout);
		_timeout = setTimeout(function() {
			logAnalyticsEvent('Failure', "reason", "Connection to the server timed out waiting to receive connected message.");

			self.trigger("exception", "Connection to the server timed out fetching the session state.", OT.ExceptionCodes.CONNECTION_TIMEOUT);
		}, 15000);

		//connect to session
		self.sendMessage(OT.WebSocketMessage.connectToSessionMessage(
			_sessionId,
			OT.APIKEY,
			_sessionToken,
			_sessionOptions.requireConnectionObjects,
			_sessionOptions.p2pEnabled
		));
	}


	var self = this;
};

})(window);
(function(window) {

// Helper to synchronise several startup tasks and then dispatch a unified
// 'envLoaded' event.
//
// This depends on:
// * OT
// * OT.Config
//
function EnvironmentLoader() {
    var _configReady = false,
        _domReady = false,

        isReady = function() {
            return _domReady && _configReady;
        },

        onLoaded = function() {
            if (isReady()) {
                OT.dispatchEvent(new OT.EnvLoadedEvent(OT.Event.names.ENV_LOADED));
            }
        },

        onDomReady = function() {
            _domReady = true;

            // The Dynamic Config won't load until the DOM is ready
            OT.Config.load(OT.properties.configURL);

            onLoaded();
        },

        configLoaded = function() {
            _configReady = true;
            OT.Config.off('dynamicConfigChanged', configLoaded);
            OT.Config.off('dynamicConfigLoadFailed', configLoadFailed);

            onLoaded();
        },

        configLoadFailed = function() {
            configLoaded();
        };

    OT.Config.on('dynamicConfigChanged', configLoaded);
    OT.Config.on('dynamicConfigLoadFailed', configLoadFailed);
    if (document.readyState == "complete" || (document.readyState == "interactive" && document.body)) {
        onDomReady();
    } else {
        if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", onDomReady, false);
        } else if (document.attachEvent) {
            // This is so onLoad works in IE, primarily so we can show the upgrade to Chrome popup
            document.attachEvent("onreadystatechange", function() {
                if (document.readyState == "complete") onDomReady();
            });
        }
    }

    this.onLoad = function(cb) {
        if (isReady()) {
            cb();
            return;
        }

        OT.on(OT.Event.names.ENV_LOADED, cb);
    };
}

var EnvLoader = new EnvironmentLoader();

OT.onLoad = function(cb, context) {
    if (!context) {
        EnvLoader.onLoad(cb);
    }
    else {
        EnvLoader.onLoad(
            cb.bind(context)
        );
    }
};

})(window);
(function(window) {

var errorsCodesToTitle = {
    1000: "Failed To Load",
    1004: "Authentication error",
    1005: "Invalid Session ID",
    1006: "Connect Failed",
    1007: "Connect Rejected",
    1008: "Connect Time-out",
    1009: "Security Error",
    1010: "Not Connected",
    1011: "Invalid Parameter",
    1012: "Peer-to-peer Stream Play Failed",
    1013: "Connection Failed",
    1014: "API Response Failure",
    1500: "Unable to Publish",
    1510: "Unable to Signal",
    1520: "Unable to Force Disconnect",
    1530: "Unable to Force Unpublish",
    1540: "Unable to record archive",
    1550: "Unable to play back archive",
    1560: "Unable to create archive",
    1570: "Unable to load archive",
    2000: "Internal Error",
    2001: "Embed Failed",
    3000: "Archive load exception",
    3001: "Archive create exception",
    3002: "Playback stop exception",
    3003: "Playback start exception",
    3004: "Record start exception",
    3005: "Record stop exception",
    3006: "Archive load exception",
    3007: "Session recording in progress",
    3008: "Archive recording internal failure",
    4000: "WebSocket Connection Failed",
    4001: "WebSocket Network Disconnected"
};

var analytics;

function _exceptionHandler(component, msg, errorCode, context) {
    var title = errorsCodesToTitle[errorCode],
        contextCopy = context ? OT.$.clone(context) : {};

    OT.error("TB.exception :: title: " + title + " (" + errorCode + ") msg: " + msg);

    if (!contextCopy.partnerId) contextCopy.partnerId = OT.APIKEY;

    try {
        if (!analytics) analytics = new OT.Analytics();
        analytics.logError(errorCode, 'tb.exception', title, {details:msg}, contextCopy);

        OT.dispatchEvent(
            new OT.ExceptionEvent(OT.Event.names.EXCEPTION, msg, title, errorCode, component, component)
        );
    } catch(err) {
        OT.error("TB.exception :: Failed to dispatch exception - " + err.toString());
        // Don't throw an error because this is asynchronous
        // don't do an exceptionHandler because that would be recursive
    }
}

// @todo redo this when we have time to tidy up
//
// @example
//
//  TB.handleJsException("Descriptive error message", 2000, {
//      session: session,
//      target: stream|publisher|subscriber|session|etc
//  });
//
OT.handleJsException = function(errorMsg, code, options) {
    options = options || {};

    var context,
        session = options.session;

    if (session) {
        context = {
            sessionId: session.sessionId
        };

        if (session.connected) context.connectionId = session.connection.connectionId;
        if (!options.target) options.target = session;
    }
    else if (options.sessionId) {
        context = {
            sessionId: options.sessionId
        };

        if (!options.target) options.target = null;
    }

    _exceptionHandler(options.target, errorMsg, code, context);
};


// @todo redo this when we have time to tidy up
//
// Public callback for exceptions from Flash.
//
// Called from Flash like:
//  TB.exceptionHandler('publisher_1234,1234', "Descriptive Error Message", "Error Title", 2000, contextObj)
//
OT.exceptionHandler = function(componentId, msg, errorTitle, errorCode, context) {
    var target;

    if (componentId) {
        target = OT.components[componentId];

        if (!target) {
            OT.warn("Could not find the component with component ID " + componentId);
        }
    }

    _exceptionHandler(target, msg, errorCode, context);
};

})(window);
(function(window) {

OT.ConnectionCapabilities = function(capabilitiesHash) {
    // Private helper methods
    var castCapabilities = function(capabilitiesHash) {
            capabilitiesHash.supportsWebRTC = OT.$.castToBoolean(capabilitiesHash.supportsWebRTC);

            return capabilitiesHash;
        };


    // Private data
    var _caps = castCapabilities(capabilitiesHash);


    this.supportsWebRTC = _caps.supportsWebRTC;
};

})(window);
(function(window) {

/**
 * The Connection object represents a connection to a TokBox session.
 * The Session object has a <code>connection</code> property that is a Connection object.
 * It represents the local client's connection. (A client only has a connection once the
 * client has successfully called the <code>connect()</code> method of the {@link Session} object.)
 * The Stream object has a <code>connection</code> property that is a Connection object.
 * It represents the stream publisher's connection.
 * 
 * @class Connection
 * @property {String} id The ID of this connection. 
 * @property {Number} timestamp The timestamp for the creation of the connection. This value is calculated in milliseconds.
	You can convert this value to a Date object by calling <code>new Date(creationTime)</code>, where <code>creationTime</code>
	is the <code>creationTime</code> property of the Connection object. 
 * @property {String} data 	A string containing metadata describing the
	connection. When you generate a user token string pass the connection data string to the
	<code>generate_token()</code> method of the
	<a href="/opentok/api/tools/documentation/api/server_side_libraries.html">OpenTok 
	server-side libraries</a>. You can also generate a token and define connection data on the
	<a href="https://dashboard.tokbox.com/projects">Dashboard</a> page.
 */
OT.Connection = function(id, creationTime, data, capabilitiesHash) {
    this.id = this.connectionId = id;
    this.creationTime = Number(creationTime);
    this.data = data;
    this.capabilities = new OT.ConnectionCapabilities(capabilitiesHash);
    this.quality = null;

    OT.$.eventing(this);
};

})(window);
(function(window) {

/**
 * Specifies a stream. A stream is a representation of a published stream in a session. When a client calls the
 * <a href="Session.html#publish">Session.publish() method</a>, a new stream is created. Properties of the Stream
 * object provide information about the stream.
 *
 *  <p>When a stream is added to a session, the Session object dispatches a <code>streamCreatedEvent</code>.
 *  When a stream is destroyed, the Session object dispatches a <code>streamDestroyed</code> event. The
 *  StreamEvent object, which defines these event objects, has a <code>stream</code> property, which is an
 *  array of Stream object. For details and a code example, see {@link StreamEvent}.</p>
 *
 *  <p>When a connection to a session is made, the Session object dispatches a <code>sessionConnected</code>
 *  event, defined by the SessionConnectEvent object. The SessionConnectEvent object has a <code>streams</code>
 *  property, which is an array of Stream objects pertaining to the streams in the session at that time.
 *  For details and a code example, see {@link SessionConnectEvent}.</p>
 *
 * @class Stream
 * @property {Connection} connection The Connection object corresponding
 * to the connection that is publishing the stream. You can compare this to to the <code>connection</code>
 * property of the Session object to see if the stream is being published by the local web page.
 *
 * @property {Number} creationTime The timestamp for the creation
 * of the stream. This value is calculated in milliseconds. You can convert this value to a
 * Date object by calling <code>new Date(creationTime)</code>, where <code>creationTime</code> is the
 * <code>creationTime</code> property of the Stream object.
 *
 * @property {Boolean} hasAudio Whether the stream has audio. This property can change if the publisher
 * turns on or off audio (by calling <a href="Publisher.html#publishAudio">Publisher.publishAudio()</a>).
 * When this occurs, the {@link Session} object dispatches a <code>streamPropertyChanged</code> event
 * (see {@link StreamPropertyChangedEvent}.)
 *
 * @property {Boolean} hasVideo Whether the stream has video. This property can change if the publisher
 * turns on or off video (by calling <a href="Publisher.html#publishVideo">Publisher.publishVideo()</a>).
 * When this occurs, the {@link Session} object dispatches a <code>streamPropertyChanged</code> event
 * (see {@link StreamPropertyChangedEvent}.)
 *
 * @property {Object} videoDimensions This object has two properties: <code>width</code> and <code>height</code>. Both are
 * numbers. The <code>width</code> property is the width of the encoded stream; the <code>height</code> property is the
 * height of the encoded stream. (These are independent of the actual width of Publisher and Subscriber objects corresponding
 * to the stream.) This property can change if a stream published from an iOS device resizes, based on a change in the device
 * orientation. When this occurs, the {@link Session} object dispatches a <code>streamPropertyChanged</code> event (see
 * {@link StreamPropertyChangedEvent}.)
 *
 * @property {String} name The name of the stream. Publishers can specify a name when publishing a stream
 * (using the <code>publish()</code> method of the publisher's Session object).
 */
OT.Stream = function(id, connection, name, data, type, creationTime, hasAudio, hasVideo, orientation, peerId, quality, width, height) {
    this.id = this.streamId = id;
    this.connection = connection;
    this.name = name;
    this.data = data;
    this.type = type || 'basic';
    this.creationTime = Number(creationTime);
    this.hasAudio = OT.$.castToBoolean(hasAudio, true);
    this.hasVideo = OT.$.castToBoolean(hasVideo, true);
    this.orientation = orientation;
    this.peerId = peerId;
    this.quality = quality;
    this.videoDimensions = { width: width, height: height };

    OT.$.eventing(this);

    this.update = function(key, newValue) {
        switch(key) {
            case 'hasAudio':
            case 'hasVideo':
                this[key] = OT.$.castToBoolean(newValue, true);
                break;

            case 'quality':
            case 'name':
            case 'videoDimensions':
            case 'orientation':
                this[key] = newValue;
        }
    };

    this.startRecording = function(archive) {
        OT.debug("OT.Stream.startRecording");
        throw new Error("OT.Stream.startRecording: Is not implemented yet.");
    };

    this.stopRecording = function(archive) {
        OT.debug("OT.Stream.stopRecording");
        throw new Error("OT.Stream.stopRecording: Is not implemented yet.");
    };
};

})(window);
(function(window) {
// Dom Components registered with this object will be cleaned up if the window is
// unloaded.
//
// @example
// OT.DOMComponentCleanup.add(this, _targetElement);
// OT.DOMComponentCleanup.remove(this);
//
OT.DOMComponentCleanup = (function () {
    var _windowByComponent = {},
        _windows = {};

    var registerCleanupOnUnload = function(win) {
            // Add component cleanup
            OT.$.on(win, "unload", function() {
                return cleanupWindow(win);
            });
        },

        cleanupWindow = function(win) {
            if (!_windows[win] || _windows[win].length === 0) return;

            _windows[win].slice().forEach(function(component) {
                component.destroy();
            });

            delete _windows[win];
        };

    return {
        add: function(component) {
            if (component.targetElement && component.id) {
                var win = component.targetElement.ownerDocument.defaultView;
                _windowByComponent[component.id] = win;

                if (!_windows.hasOwnProperty(win)) {
                    _windows[win] = [];
                    registerCleanupOnUnload(win);
                }

                _windows[win].push(component);
            }
        },

        remove: function(component) {
            if (!component.id || !_windowByComponent[component.id]) return;

            var win = _windowByComponent[component.id],
                index;

            if ( (index = _windows[win].indexOf(component)) != -1) {
                _windows[win].splice(index, 1);
            }
        }
    };
})();

})(window);
(function(window) {

// Normalise these
var NativeRTCPeerConnection = (window.webkitRTCPeerConnection || window.mozRTCPeerConnection);
var NativeRTCSessionDescription = (window.mozRTCSessionDescription || window.RTCSessionDescription); // order is very important: "RTCSessionDescription" defined in Firefox Nighly but useless
var NativeRTCIceCandidate = (window.mozRTCIceCandidate || window.RTCIceCandidate);

// Helper function to forward Ice Candidates via +messageDelegate+
var iceCandidateForwarder = function(messageDelegate) {
    return function(event) {
        OT.debug("IceCandidateForwarder: Ice Candidate");

        if (event.candidate) {
            messageDelegate(OT.WebSocketMessageType.JSEP_CANDIDATE, { candidate: event.candidate });
        }
        else {
            OT.debug("IceCandidateForwarder: No more ICE candidates. PeerConnection Status: " + event.srcElement.readyState + ", Ice Status: " + event.srcElement.iceState);
        }
    };
};


// Process incoming Ice Candidates from a remote connection (which have been
// forwarded via iceCandidateForwarder). The Ice Candidates cannot be processed
// until a PeerConnection is available. Once a PeerConnection becomes available
// the pending PeerConnections can be processed by calling processPending.
//
// @example
//
//  var iceProcessor = new IceCandidateProcessor();
//  iceProcessor.process(iceMessage1);
//  iceProcessor.process(iceMessage2);
//  iceProcessor.process(iceMessage3);
//
//  iceProcessor.peerConnection = peerConnection;
//  iceProcessor.processPending();
//
var IceCandidateProcessor = function() {
    var _pendingIceCandidates = [],
        _peerConnection = null;


    Object.defineProperty(this, 'peerConnection', {
        set: function(peerConnection) {
            _peerConnection = peerConnection;
        }
    });

    this.process = function(message) {
        var iceCandidate = new NativeRTCIceCandidate(message.candidate);

        if (_peerConnection) {
            _peerConnection.addIceCandidate(iceCandidate);
        }
        else {
            _pendingIceCandidates.push(iceCandidate);
        }
    };

    this.processPending = function() {
        while(_pendingIceCandidates.length) {
            _peerConnection.addIceCandidate(_pendingIceCandidates.shift());
        }
    };
};

// Attempt to completely process +offer+. This will:
// * set the offer as the remote description
// * create an answer and
// * set the new answer as the location description
//
// If there are no issues, the +success+ callback will be executed on completion.
// Errors during any step will result in the +failure+ callback being executed.
//
var offerProcessor = function(peerConnection, offer, success, failure) {
    var generateErrorCallback = function(message) {
            return function(errorReason) {
                if (failure) failure(message, errorReason);
            };
        },

        setLocalDescription = function(answer) {
            peerConnection.setLocalDescription(
                answer,

                // Success
                function() {
                    success(answer);
                },

                // Failure
                generateErrorCallback('Error while setting LocalDescription')
            );
        },

        createAnswer = function(onSuccess) {
            peerConnection.createAnswer(
                // Success
                setLocalDescription,

                // Failure
                generateErrorCallback('Error while setting createAnswer'),

                null, // MediaConstraints
                false // createProvisionalAnswer
            );
        };

    // Workaround for a Chrome issue. Add in the SDES crypto line into offers
    // from Firefox
    if (offer.sdp.indexOf('a=crypto') === -1) {
        var crypto_line = "a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:FakeFakeFakeFakeFakeFakeFakeFakeFakeFake\\r\\n";

        // insert the fake crypto line for every M line
        offer.sdp = offer.sdp.replace(/^c=IN(.*)$/gmi, "c=IN$1\r\n"+crypto_line);
    }

    if (offer.sdp.indexOf('a=rtcp-fb') === -1) {
        var rtcp_fb_line = "a=rtcp-fb:* ccm fir\r\na=rtcp-fb:* nack ";

        // insert the fake crypto line for every M line
        offer.sdp = offer.sdp.replace(/^m=video(.*)$/gmi, "m=video$1\r\n"+rtcp_fb_line);
    }

    peerConnection.setRemoteDescription(
        offer,

        // Success
        createAnswer,

        // Failure
        generateErrorCallback('Error while setting RemoteDescription')
    );

};

// Attempt to completely process a subscribe message. This will:
// * create an Offer
// * set the new offer as the location description
//
// If there are no issues, the +success+ callback will be executed on completion.
// Errors during any step will result in the +failure+ callback being executed.
//
var suscribeProcessor = function(peerConnection, success, failure) {
    var constraints = {
            mandatory: {},
            optional: []
        },

        generateErrorCallback = function(message) {
            return function(errorReason) {
                if (failure) failure(message, errorReason);
            };
        },

        setLocalDescription = function(offer) {
            peerConnection.setLocalDescription(
                offer,

                // Success
                function() {
                    success(offer);
                },

                // Failure
                generateErrorCallback('Error while setting LocalDescription')
            );
        };


    // For interop with FireFox. Disable Data Channel in createOffer.
    if (navigator.mozGetUserMedia) {
        constraints.mandatory.MozDontOfferDataChannel = true;
    }

    peerConnection.createOffer(
        // Success
        setLocalDescription,

        // Failure
        generateErrorCallback('Error while creating Offer'),

        constraints
    );
};

/**
 * Negotiates a WebRTC PeerConnection.
 *
 * Responsible for:
 * * offer-answer exchange
 * * iceCandidates
 * * notification of remote streams being added/removed
 *
 */
OT.PeerConnection = function(config) {
    var _peerConnection,
        _iceProcessor = new IceCandidateProcessor(),
        _offer,
        _answer,
        _state = 'new',
        _iceCandidatesGathered = false,
        _messageDelegates = [],
        _gettingStats,
        _createTime = OT.$.now(),
        _prevStats = {
            "timeStamp" : _createTime
        };

    OT.$.eventing(this);

    // if ice servers doesn't exist Firefox will throw an exception. Chrome
    // interprets this as "Use my default STUN servers" whereas FF reads it
    // as "Don't use STUN at all". *Grumble*
    if (!config.iceServers) config.iceServers = [];

    // This is ugly. Here we are handling the following:
    // 1. Firefox doesn't support TURN until version 23. We fallback to STUN
    // in previous versions.
    //
    // 2. In FF >= 23 the new syntax for declaring Ice Servers with credentials
    // is used. i.e. url, credential, and username as opposed to just url and credential.
    //
    var userAgent;
    if (config.iceServers.length > 0 && (userAgent = navigator.userAgent.match(/(Firefox)\/([0-9]+\.[0-9]+)/))) {
        var firefoxVersion = parseFloat(userAgent[2], 10);
        if (firefoxVersion < 23) {
            // Firefox < 23 doesn't support TURN at all. Use STUN instead of TURN.
            config.iceServers = config.iceServers.map(function(iceServer) {
                return {url: iceServer.url.replace("turn:", "stun:")};
            });
        }
        else {
            // Firefox >= 23 uses the new username property (previously part of the url)
            config.iceServers = config.iceServers.map(function(iceServer) {
                if (iceServer.url.trim().substr(0, 5) !== 'turn:') {
                    // It's not using TURN
                    return iceServer;
                }
                else {
                    var bits = iceServer.url.trim().split(/[:@]/);

                    return {
                        username: bits[1],
                        credential: iceServer.credential,
                        // There is a bug in Firefox 23 TURN suppoort. Use STUN instead of TURN.
                        url: ((firefoxVersion < 24) ? 'stun' : bits[0]) + ':' + bits[2]
                    };
                }
            });
        }
    }

    // Private methods
    var delegateMessage = function(type, messagePayload) {
            if (_messageDelegates.length) {
                // We actually only ever send to the first delegate. This is because
                // each delegate actually represents a Publisher/Subscriber that
                // shares a single PeerConnection. If we sent to all delegates it
                // would result in each message being processed multiple times by
                // each PeerConnection.
                _messageDelegates[0](type, messagePayload);
            }
        }.bind(this),


        setupPeerConnection = function() {
            if (!_peerConnection) {
                try {
                    OT.debug("Creating peer connection config \"" + JSON.stringify(config) + "\".");


                    _peerConnection = new NativeRTCPeerConnection(config, {
                        optional: [
                            {DtlsSrtpKeyAgreement: true}
                        ]
                    });
                } catch(e) {
                    OT.error("Failed to create PeerConnection, exception: " + e.message);
                    return null;
                }

                _iceProcessor.peerConnection = _peerConnection;

                _peerConnection.onicecandidate = iceCandidateForwarder(delegateMessage);
                _peerConnection.onaddstream = onRemoteStreamAdded.bind(this);
                _peerConnection.onremovestream = onRemoteStreamRemoved.bind(this);

                if (_peerConnection.onsignalingstatechange !== undefined) {
                    _peerConnection.onsignalingstatechange = routeStateChanged.bind(this);
                } else if (_peerConnection.onstatechange !== undefined) {
                    _peerConnection.onstatechange = routeStateChanged.bind(this);
                }
            }

            return _peerConnection;
        }.bind(this),

        routeStateChanged = function(event) {
            var newState = (event.target.signalingState || event.target.readyState);

            if (newState && newState.toLowerCase() !== _state) {
                _state = newState.toLowerCase();
                OT.debug('PeerConnection.stateChange: ' + _state);

                switch(_state) {
                    case 'closed':
                        // Our connection is dead, stop processing ICE candidates
                        if (_iceProcessor) _iceProcessor.peerConnection = null;
                        _peerConnection = null;

                        this.trigger('close');

                        break;
                }
            }
        },

        getLocalStreams = function() {
            var streams;

            if (_peerConnection.getLocalStreams) {
                streams = _peerConnection.getLocalStreams();
            }
            else if (_peerConnection.localStreams) {
                streams = _peerConnection.localStreams;
            }
            else {
                throw new Error("Invalid Peer Connection object implements no method for retrieving local streams");
            }

            // Force streams to be an Array, rather than a "Sequence" object,
            // which is browser dependent and does not behaviour like an Array
            // in every case.
            return Array.prototype.slice.call(streams);
        },

        getRemoteStreams = function() {
            var streams;

            if (_peerConnection.getRemoteStreams) {
                streams = _peerConnection.getRemoteStreams();
            }
            else if (_peerConnection.remoteStreams) {
                streams = _peerConnection.remoteStreams;
            }
            else {
                throw new Error("Invalid Peer Connection object implements no method for retrieving remote streams");
            }

            // Force streams to be an Array, rather than a "Sequence" object,
            // which is browser dependent and does not behaviour like an Array
            // in every case.
            return Array.prototype.slice.call(streams);
        },

        generateErrorCallback = function(forMethod, message) {
            return function(errorReason) {
                triggerError.call(this, "PeerConnection." + forMethod + ": " + message + ": " + errorReason);
            }.bind(this);
        },

        /// PeerConnection signaling
        onRemoteStreamAdded = function(event) {
            this.trigger('streamAdded', event.stream);
        },

        onRemoteStreamRemoved = function(event) {
            this.trigger('streamRemoved', event.stream);
        },

        // ICE Negotiation messages


        // Relays a SDP payload (+sdp+), that is part of a message of type +messageType+
        // via the registered message delegators
        relaySDP = function(messageType, sdp) {
            delegateMessage(messageType, {sdp: sdp});
        },

        // Process an offer that
        processOffer = function(message) {
            var offer = new NativeRTCSessionDescription(message.sdp),

                // Relays +answer+ Answer
                relayAnswer = function(answer) {
                    relaySDP(OT.WebSocketMessageType.JSEP_ANSWER, answer);
                },

                reportError = function(message, errorReason) {
                    triggerError("PeerConnection.offerProcessor " + message + ": " + errorReason);
                };

            setupPeerConnection();

            _remoteDescriptionType = offer.type;
            _remoteDescription = offer;

            offerProcessor(
                _peerConnection,
                offer,
                relayAnswer,
                reportError
            );
        },

        processAnswer = function(message) {
            if (!message.sdp) {
                OT.error("PeerConnection.processMessage: Weird message, no SDP.");
                return;
            }

            _answer = new NativeRTCSessionDescription(message.sdp);

            _remoteDescriptionType = _answer.type;
            _remoteDescription = _answer;

            _peerConnection.setRemoteDescription(_answer);
            _iceProcessor.processPending();
        },

        processSubscribe = function(message) {
            OT.debug("PeerConnection.processSubscribe: Sending offer to subscriber.");

            setupPeerConnection();

            suscribeProcessor(
                _peerConnection,

                // Success: Relay Offer
                function(offer) {
                    _offer = offer;
                    relaySDP(OT.WebSocketMessageType.JSEP_OFFER, _offer);
                },

                // Failure
                function(message, errorReason) {
                    triggerError("PeerConnection.suscribeProcessor " + message + ": " + errorReason);
                }
            );
        },

        triggerError = function(errorReason) {
            OT.error(errorReason);
            this.trigger('error', errorReason);
        }.bind(this);

    this.addLocalStream = function(webRTCStream) {
        setupPeerConnection();
        _peerConnection.addStream(webRTCStream);
    };

    this.disconnect = function() {
        _iceProcessor = null;

        if (_peerConnection) {
            var currentState = (_peerConnection.signalingState || _peerConnection.readyState);
            if (currentState && currentState.toLowerCase() !== 'closed') _peerConnection.close();
            _peerConnection = null;
        }

        this.off();
    };

    this.processMessage = function(type, message) {
        OT.debug("PeerConnection.processMessage: Received " + type + " from " + message.fromAddress);
        OT.debug(message);

        switch(type) {
            case OT.WebSocketMessageType.JSEP_SUBSCRIBE:
                processSubscribe.call(this, message);
                break;

            case OT.WebSocketMessageType.JSEP_OFFER:
                processOffer.call(this, message);
                break;

            case OT.WebSocketMessageType.JSEP_ANSWER:
                processAnswer.call(this, message);
                break;

            case OT.WebSocketMessageType.JSEP_CANDIDATE:
                _iceProcessor.process(message);
                break;

            default:
                OT.debug("PeerConnection.processMessage: Received an unexpected message of type " + type + " from " + message.fromAddress + ": " + JSON.stringify(message));
        }

        return this;
    };

    this.registerMessageDelegate = function(delegateFn) {
        _messageDelegates.push(delegateFn);
    };

    this.unregisterMessageDelegate = function(delegateFn) {
        var index = _messageDelegates.indexOf(delegateFn);

        if ( index !== -1 ) {
            _messageDelegates.splice(index, 1);
        }
    };

    /**
     * Retrieves the PeerConnection stats.
     *
     * TODO document what the format of the final reports that +callback+ gets is
     *
     * @ignore
     * @private
     * @memberof PeerConnection
     * @param callback {Function} this will be triggered once the stats a are ready.
     * It takes a single argument which is the stats report, which may be undefined
     * if there is presently no stats.
     */
    this.getStats = function(callback) {
        // need to make sure that this isn't called again when in the middle of processing
        if (_gettingStats == true) {
            triggerError("PeerConnection.getStats: Already getting the stats!");
            return;
        }

        // locking this function
        _gettingStats = true;

        // get the previous timestamp (seconds)
        var now = OT.$.now();
        var time_difference = (now - _prevStats["timeStamp"]) / 1000; // how many seconds has passed

        // now update the date
        _prevStats["timeStamp"] = now;

        /* this parses a result if there it contains the video bitrate */
        var parseAvgVideoBitrate = function(result) {
            var last_bytesSent = _prevStats["videoBytesTransferred"] || 0;

            if (result.stat("googFrameHeightSent")) {
                _prevStats["videoBytesTransferred"] = result.stat("bytesSent");
                return Math.round((_prevStats["videoBytesTransferred"] - last_bytesSent) * 8 / time_difference);
            } else if (result.stat("googFrameHeightReceived")) {
                _prevStats["videoBytesTransferred"] = result.stat("bytesReceived");
                return Math.round((_prevStats["videoBytesTransferred"] - last_bytesSent) * 8 / time_difference);
            } else {
                return NaN;
            }
        };

        /* this parses a result if there it contains the audio bitrate */
        var parseAvgAudioBitrate = function(result) {
            var last_bytesSent = _prevStats["audioBytesTransferred"] || 0;

            if (result.stat("audioInputLevel")) {
                _prevStats["audioBytesTransferred"] = result.stat("bytesSent");
                return Math.round((_prevStats["audioBytesTransferred"] - last_bytesSent) * 8 / time_difference);
            } else if (result.stat("audioOutputLevel")) {
                _prevStats["audioBytesTransferred"] = result.stat("bytesReceived");
                return Math.round((_prevStats["audioBytesTransferred"] - last_bytesSent) * 8 / time_difference);
            } else {
                return NaN;
            }
        };

        var parsed_stats = {};
        var parseStatsReports = function(stats) {
            if (stats.result) {
                var result_list = stats.result();
                for (var result_index = 0; result_index < result_list.length; result_index++) {
                    var report = {};
                    var result = result_list[result_index];
                    if (result.stat) {
                        var avgVideoBitrate = parseAvgVideoBitrate(result);
                        if (!isNaN(avgVideoBitrate)) {
                            parsed_stats["avgVideoBitrate"] = avgVideoBitrate;
                        }

                        var avgAudioBitrate = parseAvgAudioBitrate(result);
                        if (!isNaN(avgAudioBitrate)) {
                            parsed_stats["avgAudioBitrate"] = avgAudioBitrate;
                        }
                    }
                }
            }

            _gettingStats = false;
            callback(parsed_stats);
        }
        parsed_stats["duration"] = Math.round(now - _createTime);


        if (_peerConnection && _peerConnection.getStats) {
            _peerConnection.getStats(parseStatsReports);
        } else {
            // there was no peer connection yet or getStats isn't implemented in this enviroment
            _gettingStats = false;
            callback(parsed_stats);
        }
    };

    Object.defineProperty(this, 'remoteStreams', {
        get: function() {
            return _peerConnection ? getRemoteStreams() : [];
        }
    });
};

})(window);
(function(window) {

var _peerConnections = {};

OT.PeerConnections = {
    add: function(remoteConnection, stream, config) {
        var key = remoteConnection.id + "_" + stream.id,
            ref = _peerConnections[key];

        if (!ref) {
            ref = _peerConnections[key] = {
                count: 0,
                pc: new OT.PeerConnection(config)
            };
        }

        // increase the PCs ref count by 1
        ref.count += 1;

        return ref.pc;
    },

    remove: function(remoteConnection, stream) {
        var key = remoteConnection.id + "_" + stream.id,
            ref = _peerConnections[key];

        if (ref) {
            ref.count -= 1;

            if (ref.count === 0) {
                ref.pc.disconnect();
                delete _peerConnections[key];
            }
        }
    }
};


})(window);
(function(window) {

/**
 * Abstracts PeerConnection related stuff away from OT.Publisher.
 *
 * Responsible for:
 * * setting up the underlying PeerConnection (delegates to OT.PeerConnections)
 * * triggering a connected event when the Peer connection is opened
 * * triggering a disconnected event when the Peer connection is closed
 * * providing a destroy method
 * * providing a processMessage method
 *
 * Once the PeerConnection is connected and the video element playing it triggers the connected event
 *
 * Triggers the following events
 * * connected
 * * disconnected
 */
OT.PublisherPeerConnection = function(remoteConnection, session, stream, webRTCStream) {
    var _peerConnection,
        _hasRelayCandidates = false;

    // Private
    var _onPeerClosed = function() {
            this.destroy();
            this.trigger('disconnected', this);
        },

        // Note: All Peer errors are fatal right now.
        _onPeerError = function(errorReason) {
            this.trigger('error', null, errorReason, this);
            this.destroy();
        },

        _relayMessageToPeer = function(type, payload) {
            if (!_hasRelayCandidates){
                var extractCandidates = type === OT.WebSocketMessageType.JSEP_CANDIDATE ||
                                        type === OT.WebSocketMessageType.JSEP_OFFER ||
                                        type === OT.WebSocketMessageType.JSEP_ANSWER;

                if (extractCandidates) {
                    var message = (type === OT.WebSocketMessageType.JSEP_CANDIDATE) ? payload.candidate.candidate : payload.sdp.sdp;
                    _hasRelayCandidates = message.indexOf('typ relay') !== -1;
                }

                if (type === OT.WebSocketMessageType.JSEP_OFFER) {
                    this.trigger('connected');
                }
            }

            session.sendJSEPMessage(
                remoteConnection,
                type,
                OT.$.extend(payload, {
                    streamId: stream.id
                })
            );
        }.bind(this);


    OT.$.eventing(this);

    // Public
    this.destroy = function() {
        // Clean up our PeerConnection
        if (_peerConnection) {
            OT.PeerConnections.remove(remoteConnection, stream);
        }

        _peerConnection = null;

        this.off();
    };

    this.processMessage = function(type, message) {
        _peerConnection.processMessage(type, message);
    };

    this.getStats = function(callback) {
        _peerConnection.getStats(callback);
    }

    // Init
    var iceServers;
    if (session.sessionInfo.iceServers) {
        iceServers = session.sessionInfo.iceServers;
    } else {
        iceServers = [
            {"url": "stun:stun.l.google.com:19302"}
        ];
    }

    _peerConnection = OT.PeerConnections.add(remoteConnection, stream, {
        iceServers: iceServers
    });

    _peerConnection.on({
        close: _onPeerClosed,
        error: _onPeerError
    }, this);

    _peerConnection.registerMessageDelegate(_relayMessageToPeer);
    _peerConnection.addLocalStream(webRTCStream);

    Object.defineProperty(this, 'remoteConnection', {value: remoteConnection});

    Object.defineProperty(this, 'hasRelayCandidates', {
        get: function() { return _hasRelayCandidates; }
    });
};

})(window);
(function(window) {

/**
 * Abstracts PeerConnection related stuff away from OT.Subscriber.
 *
 * Responsible for:
 * * setting up the underlying PeerConnection (delegates to OT.PeerConnections)
 * * triggering a connected event when the Peer connection is opened
 * * triggering a disconnected event when the Peer connection is closed
 * * creating a video element when a stream is added
 * * responding to stream removed intelligently
 * * providing a destroy method
 * * providing a processMessage method
 *
 * Once the PeerConnection is connected and the video element playing it triggers the connected event
 *
 * Triggers the following events
 * * connected
 * * disconnected
 * * remoteStreamAdded
 * * remoteStreamRemoved
 * * error
 *
 */

OT.SubscriberPeerConnection = function(remoteConnection, session, stream, properties) {
    var _peerConnection,
        _hasRelayCandidates = false;

    // Private
    var _onPeerClosed = function() {
            this.destroy();
            this.trigger('disconnected', this);
        },

        _onRemoteStreamAdded = function(remoteRTCStream) {
            this.trigger('remoteStreamAdded', remoteRTCStream, this);
        },

        _onRemoteStreamRemoved = function(remoteRTCStream) {
            this.trigger('remoteStreamRemoved', remoteRTCStream, this);
        },

        // Note: All Peer errors are fatal right now.
        _onPeerError = function(errorReason) {
            this.trigger('error', null, errorReason, this);
        },

        _relayMessageToPeer = function(type, payload) {
            if (!_hasRelayCandidates){
                var extractCandidates = type === OT.WebSocketMessageType.JSEP_CANDIDATE ||
                                        type === OT.WebSocketMessageType.JSEP_OFFER ||
                                        type === OT.WebSocketMessageType.JSEP_ANSWER;

                if (extractCandidates) {
                    var message = (type === OT.WebSocketMessageType.JSEP_CANDIDATE) ? payload.candidate.candidate : payload.sdp.sdp;
                    _hasRelayCandidates = message.indexOf('typ relay') !== -1;
                }
            }

            if (type === OT.WebSocketMessageType.JSEP_ANSWER) {
                this.trigger('connected');
            }

            session.sendJSEPMessage(
                remoteConnection,
                type,
                OT.$.extend(payload, {
                    streamId: stream.id
                })
            );
        }.bind(this),

        // Helper method used by subscribeToAudio/subscribeToVideo
        _setEnabledOnStreamTracksCurry = function(isVideo) {
            var method = 'get' + (isVideo ? 'Video' : 'Audio') + 'Tracks';

            return function(enabled) {
                var remoteStreams = _peerConnection.remoteStreams,
                    tracks,
                    stream;

                if (remoteStreams.length === 0 || !remoteStreams[0][method]) {
                    // either there is no remote stream or we are in a browser that doesn't
                    // expose the media tracks (Firefox)
                    return;
                }

                for (var i=0, num=remoteStreams.length; i<num; ++i) {
                    stream = remoteStreams[i];
                    tracks = stream[method]();

                    for (var k=0, numTracks=tracks.length; k < numTracks; ++k){
                        tracks[k].enabled=enabled;
                    }
                }
            };
        };


    OT.$.eventing(this);

    // Public
    this.destroy = function() {
        if (session && session.connected && stream) {
            // Notify the server components
            session.sendJSEPMessage(
            stream.connection, OT.WebSocketMessageType.JSEP_UNSUBSCRIBE, {
                streamId: stream.id
            });
        }

        // Clean up our PeerConnection
        if (_peerConnection) {
            // Ref: OPENTOK-2458 disable all audio tracks before removing it.
            this.subscribeToAudio(false);
            OT.PeerConnections.remove(remoteConnection, stream);
        }

        _peerConnection = null;

        this.off();
    };

    this.processMessage = function(type, message) {
        _peerConnection.processMessage(type, message);
    };

    this.getStats = function(callback) {
        _peerConnection.getStats(callback);
    }

    this.subscribeToAudio = _setEnabledOnStreamTracksCurry(false);
    this.subscribeToVideo = _setEnabledOnStreamTracksCurry(true);

    Object.defineProperty(this, 'hasRelayCandidates', {
        get: function() { return _hasRelayCandidates; }
    });


    // Init

    var iceServers;
    if (session.sessionInfo.iceServers) {
        iceServers = session.sessionInfo.iceServers;
    } else {
        iceServers = [
            {"url": "stun:stun.l.google.com:19302"}
        ];
    }

    _peerConnection = OT.PeerConnections.add(remoteConnection, stream, {
        iceServers: iceServers
    });

    _peerConnection.on({
        close: _onPeerClosed,
        streamAdded: _onRemoteStreamAdded,
        streamRemoved: _onRemoteStreamRemoved,
        error: _onPeerError
    }, this);

    _peerConnection.registerMessageDelegate(_relayMessageToPeer);

    // If there are already remoteStreams, add them immediately
    if (_peerConnection.remoteStreams.length > 0) {
        _peerConnection.remoteStreams.forEach(_onRemoteStreamAdded, this);
    }
    else {
        // We only bother with the PeerConnection negotiation if we don't already
        // have a remote stream.
        session.sendJSEPMessage(
            remoteConnection,
            OT.WebSocketMessageType.JSEP_SUBSCRIBE,
            {
                streamId: stream.id,
                keyManagemenMethod: OT.$.supportedCryptoScheme(),
                hasVideo: properties.subscribeToVideo,
                hasAudio: properties.subscribeToAudio
            }
        );
    }
};

})(window);
(function(window) {

// Manages N Chrome elements
OT.Chrome = function(properties) {
    var _visible = false,
        _widgets = {},

        // Private helper function
        _set = function(name, widget) {
            widget.parent = this;
            widget.appendTo(properties.parent);

            _widgets[name] = widget;

            Object.defineProperty(this, name, {
                get: function() { return _widgets[name]; }
            });
        };

    if (!properties.parent) {
        // @todo raise an exception
        return;
    }

    OT.$.eventing(this);

    this.destroy = function() {
        this.off();
        this.hide();

        for (var name in _widgets) {
            _widgets[name].destroy();
        }
    };

    this.show = function() {
        _visible = true;

        for (var name in _widgets) {
            _widgets[name].show();
        }
    };

    this.hide = function() {
        _visible = false;

        for (var name in _widgets) {
            _widgets[name].hide();
        }
    };


    // Adds the widget to the chrome and to the DOM. Also creates a accessor
    // property for it on the chrome.
    //
    // @example
    //  chrome.set('foo', new FooWidget());
    //  chrome.foo.setDisplayMode('on');
    //
    // @example
    //  chrome.set({
    //      foo: new FooWidget(),
    //      bar: new BarWidget()
    //  });
    //  chrome.foo.setDisplayMode('on');
    //
    this.set = function(widgetName, widget) {
        if (typeof(widgetName) === "string" && widget) {
            _set.call(this, widgetName, widget);
        }
        else {
          for (var name in widgetName) {
            if (widgetName.hasOwnProperty(name)) {
              _set.call(this, name, widgetName[name]);
            }
          }
        }

        return this;
    };
};

})(window);
(function(window) {

if (!OT.Chrome.Behaviour) OT.Chrome.Behaviour = {};

// A mixin to encapsulate the basic widget behaviour. This needs a better name,
// it's not actually a widget. It's actually "Behaviour that can be applied to
// an object to make it support the basic Chrome widget workflow"...but that would
// probably been too long a name.
OT.Chrome.Behaviour.Widget = function(widget, options) {
    var _options = options || {},
        _mode,
        _previousMode;

    //
    // @param [String] mode
    //      'on', 'off', or 'auto'
    //
    widget.setDisplayMode = function(mode) {
        var newMode = mode || 'auto';
        if (_mode === newMode) return;

        OT.$.removeClass(this.domElement, 'OT_mode-' + _mode);
        OT.$.addClass(this.domElement, 'OT_mode-' + newMode);

        _previousMode = _mode;
        _mode = newMode;
    };

    widget.show = function() {
        this.setDisplayMode(_previousMode);
        if (_options.onShow) _options.onShow();

        return this;
    };

    widget.hide = function() {
        this.setDisplayMode('off');
        if (_options.onHide) _options.onHide();

        return this;
    };

    widget.destroy = function() {
        if (_options.onDestroy) _options.onDestroy(this.domElement);
        if (this.domElement) OT.$.removeElement(this.domElement);

        return widget;
    };

    widget.appendTo = function(parent) {
        // create the element under parent
        this.domElement = OT.$.createElement(_options.nodeName || 'div',
                                            _options.htmlAttributes,
                                            _options.htmlContent);

        if (_options.onCreate) _options.onCreate(this.domElement);

        // if the mode isn't auto, then we can directly set it
        if (_options.mode != "auto") {
            widget.setDisplayMode(_options.mode);
        } else {
            // we set it to on at first, and then apply the desired mode
            // this will let the proper widgets nicely fade away
            widget.setDisplayMode('on');
            setTimeout(function() {
                widget.setDisplayMode(_options.mode);
            }, 2000);
        }

        // add the widget to the parent
        parent.appendChild(this.domElement);

        return widget;
    };
};

})(window);
(function(window) {

// NamePanel Chrome Widget
//
// mode (String)
// Whether to display the name. Possible values are: "auto" (the name is displayed
// when the stream is first displayed and when the user mouses over the display),
// "off" (the name is not displayed), and "on" (the name is displayed).
//
// displays a name
// can be shown/hidden
// can be destroyed
OT.Chrome.NamePanel = function(options) {
    var _name = options.name;

    if (!_name || _name.trim().length === '') {
        _name = null;

        // THere's no name, just flip the mode off
        options.mode = 'off';
    }

    // This behaviour must be implemented to make the widget behaviour work.
    // @fixme This is a nasty code smell
    var _domElement;
    Object.defineProperty(this, 'domElement', {
        get: function() { return _domElement; },
        set: function(domElement) { _domElement = domElement; }
    })

    // Mixin common widget behaviour
    OT.Chrome.Behaviour.Widget(this, {
        mode: options.mode,
        nodeName: 'h1',
        htmlContent: _name,
        htmlAttributes: {className: 'OT_name'}
    });

    Object.defineProperty(this, 'name', {
        set: function(name) {
            if (!_name) this.setDisplayMode('auto');

            _name = name;
            _domElement.innerHTML = _name;
        }.bind(this)
    });
};

})(window);
(function(window) {

OT.Chrome.MuteButton = function(options) {
    var _onClickCb,
        _muted = options.muted || false;

    // This behaviour must be implemented to make the widget behaviour work.
    // @fixme This is a nasty code smell
    var _domElement;
    Object.defineProperty(this, 'domElement', {
        get: function() { return _domElement; },
        set: function(domElement) { _domElement = domElement; }
    })

    // Private Event Callbacks
    var attachEvents = function(elem) {
            _onClickCb = onClick.bind(this);
            elem.addEventListener('click', _onClickCb, false);
        },

        detachEvents = function(elem) {
            _onClickCb = null;
            elem.removeEventListener('click', _onClickCb, false);
        },

        onClick = function(event) {
            _muted = !_muted;

            if (_muted) {
                OT.$.addClass(_domElement, 'OT_active');
                this.parent.trigger('muted', this);
            }
            else {
                OT.$.removeClass(_domElement, 'OT_active');
                this.parent.trigger('unmuted', this);
            }

            return false;
        };

    // Mixin common widget behaviour
    var classNames = _muted ? 'OT_mute OT_active' : 'OT_mute';
    OT.Chrome.Behaviour.Widget(this, {
        mode: options.mode,
        nodeName: 'button',
        htmlContent: 'Mute',
        htmlAttributes: {className: classNames},
        onCreate: attachEvents.bind(this),
        onDestroy: detachEvents.bind(this)
    });
};


})(window);
(function(window) {

OT.Chrome.MicVolume = function(options) {
    var _onClickCb,
        _muted = options.muted || false;

    // This behaviour must be implemented to make the widget behaviour work.
    // @fixme This is a nasty code smell
    var _domElement;
    Object.defineProperty(this, 'domElement', {
        get: function() { return _domElement; },
        set: function(domElement) { _domElement = domElement; }
    })

    // Private Event Callbacks
    var attachEvents = function(elem) {
            _onClickCb = onClick.bind(this);
            elem.addEventListener('click', _onClickCb, false);
        },

        detachEvents = function(elem) {
            _onClickCb = null;
            elem.removeEventListener('click', _onClickCb, false);
        },

        onClick = function(event) {
            _muted = !_muted;

            if (_muted) {
                OT.$.addClass(_domElement, 'active');
                this.parent.trigger('muted', this);
            }
            else {
                OT.$.removeClass(_domElement, 'active');
                this.parent.trigger('unmuted', this);
            }

            return false;
        };

    // Mixin common widget behaviour
    OT.Chrome.Behaviour.Widget(this, {
        mode: options.mode,
        nodeName: 'button',
        htmlContent: 'Mute',
        htmlAttributes: {className: 'OT_mic-volume'},
        onCreate: attachEvents.bind(this),
        onDestroy: detachEvents.bind(this)
    });
};


})(window);
(function(window) {

OT.Chrome.SettingsPanelButton = function(options) {
    var _onClickCb;

    // Private Event Callbacks
    var attachEvents = function(elem) {
            _onClickCb = onClick.bind(this);
            elem.addEventListener('click', _onClickCb, false);
        },

        detachEvents = function(elem) {
            _onClickCb = null;
            elem.removeEventListener('click', _onClickCb, false);
        },

        onClick = function(event) {
            this.parent.trigger('SettingsPanel:open', this);
            return false;
        };


    // This behaviour must be implemented to make the widget behaviour work.
    // @fixme This is a nasty code smell
    var _domElement;
    Object.defineProperty(this, 'domElement', {
        get: function() { return _domElement; },
        set: function(domElement) { _domElement = domElement; }
    })

    // Mixin common widget behaviour
    OT.Chrome.Behaviour.Widget(this, {
        mode: options.mode,
        nodeName: 'button',
        htmlContent: 'Settings',
        htmlAttributes: {className: 'OT_settings-panel'},
        onCreate: attachEvents.bind(this),
        onDestroy: detachEvents.bind(this)
    });
};

})(window);
(function(window) {

OT.Chrome.SettingsPanel = function(options) {
    if (!options.stream) {
        // @todo raise error
        return;
    }

    var webRTCStream = options.stream;

    // This behaviour must be implemented to make the widget behaviour work.
    // @fixme This is a nasty code smell
    var _domElement;
    Object.defineProperty(this, 'domElement', {
        get: function() { return _domElement; },
        set: function(domElement) { _domElement = domElement; }
    })

    var renderDialog = function() {
            var camLabel = webRTCStream.getVideoTracks().length ? webRTCStream.getVideoTracks()[0].label : "None",
                micLabel = webRTCStream.getAudioTracks().length ? webRTCStream.getAudioTracks()[0].label : "None";

            _domElement.innerHTML = "<dl>\
                                        <dt>Cam</dt>\
                                        <dd>" + camLabel + "</dd>\
                                        <dt>Mic</dt>\
                                        <dd>" + micLabel + "</dd>\
                                    </dl>";


            var closeButton  = OT.$.createButton('Close', {
                className: 'OT_close'
            }, {
                click: onClose.bind(this)
            });

            _domElement.appendChild(closeButton);
        },

        onShow = function() {
            renderDialog.call(this);
        },

        onClose = function() {
            this.parent.trigger('SettingsPanel:close', this);
            return false;
        };


    // Mixin common widget behaviour
    OT.Chrome.Behaviour.Widget(this, {
        mode: options.mode,
        nodeName: 'section',
        htmlContent: 'Settings',
        htmlAttributes: {className: 'OT_settings-panel'},
        onCreate: renderDialog.bind(this),
        onShow: onShow.bind(this)
    });
};

})(window);
(function(window) {

OT.Chrome.OpenTokButton = function(options) {
    // This behaviour must be implemented to make the widget behaviour work.
    // @fixme This is a nasty code smell
    var _domElement;
    this.__defineGetter__("domElement", function() { return _domElement; });
    this.__defineSetter__("domElement", function(domElement) { _domElement = domElement; });

    // Mixin common widget behaviour
    OT.Chrome.Behaviour.Widget(this, {
        mode: options ? options.mode : null,
        nodeName: 'span',
        htmlContent: 'OpenTok',
        htmlAttributes: {
            className: 'OT_opentok'
        }
    });
};

})(window);
(function(window) {
/* Stylable Notes

* RTC doesn't need to wait until anything is loaded (flash needs to wait until the Flash component loads)
* Some bits are controlled by multiple flags, i.e. buttonDisplayMode and nameDisplayMode.
* When there are multiple flags how is the final setting chosen?
* When some style bits are set updates will need to be pushed through to the Chrome
*/

// Mixes the StylableComponent behaviour into the +self+ object. It will
// also set the default styles to +initialStyles+.
//
// @note This Mixin is dependent on OT.Eventing.
//
//
// @example
//
//  function SomeObject {
//      OT.StylableComponent(this, {
//          name: 'SomeObject',
//          foo: 'bar'
//      });
//  }
//
//  var obj = new SomeObject();
//  obj.getStyle('foo');        // => 'bar'
//  obj.setStyle('foo', 'baz')
//  obj.getStyle('foo');        // => 'baz'
//  obj.getStyle();             // => {name: 'SomeObject', foo: 'baz'}
//
OT.StylableComponent = function(self, initalStyles) {
    if (!self.trigger) {
        throw new Error("OT.StylableComponent is dependent on the mixin OT.$.eventing. Ensure that this is included in the object before StylableComponent.");
    }

    // Broadcast style changes as the styleValueChanged event
    var onStyleChange = function(key, value, oldValue) {
        if (oldValue) {
            self.trigger('styleValueChanged', key, value, oldValue);
        }
        else {
            self.trigger('styleValueChanged', key, value);
        }
    };

    var _style = new Style(initalStyles, onStyleChange);

    /**
    * Returns an object that has the properties that define the current user interface controls of the Publisher.
    * You can modify the properties of this object and pass the object to the <code>setStyle()</code> method of the
    * Publisher object. (See the documentation for <a href="#setStyle">setStyle()</a> to see the styles that define
    * this object.)
    * @return {Object} The object that defines the styles of the Publisher.
    * @see <a href="#setStyle">setStyle()</a>
    * @method #getStyle
    * @memberOf Publisher
    */

	/**
	* Returns an object that has the properties that define the current user interface controls of the Subscriber.
	* You can modify the properties of this object and pass the object to the <code>setStyle()</code> method of the
	* Subscriber object. (See the documentation for <a href="#setStyle">setStyle()</a> to see the styles that define
	* this object.)
	* @return {Object} The object that defines the styles of the Subscriber.
	* @see <a href="#setStyle">setStyle()</a>
	* @method #getStyle
	* @memberOf Subscriber
	*/
    // If +key+ is falsly then all styles will be returned.
    self.getStyle = function(key) {
        return _style.get(key);
    };

    /**
    * Sets properties that define the appearance of some user interface controls of the Publisher.
    *
    * <p>You can either pass one parameter or two parameters to this method.</p>
    *
    * <p>If you pass one parameter, <code>style</code>, it is an object that has one property: <code>nameDisplayMode</code>.
    * Possible values for the <code>style.nameDisplayMode</code> property are: "auto" (the name is displayed when the stream
    * is first displayed and when the user mouses over the display), "off" (the name is not displayed), and "on"
    * (the name is displayed).
    *
    * <p>For example, the following code passes one parameter to the method:</p>
    *
    * <pre>myPublisher.setStyle({nameDisplayMode: "off"});</pre>
    *
    * <p>If you pass two parameters, <code>style</code> and <code>value</code>, they are key-value pair that
    * define one property of the display style. For example, the following code passes two parameter values
    * to the method:</p>
    *
    * <pre>myPublisher.setStyle("nameDisplayMode", "off");</pre>
    *
    * <p>You can set the initial settings when you call the <code>Session.publish()</code>
    * or <code>TB.initPublisher()</code> method. Pass a <code>style</code> property as part of the
    * <code>properties</code> parameter of the method.</p>
    *
    * <p>The TB object dispatches an <code>exception</code> event if you pass in an invalid style to the method.
    * The <code>code</code> property of the ExceptionEvent object is set to 1011.</p>
    *
    * @param {Object} style Either an object containing properties that define the style, or a String defining this
    * single style property to set.
    * @param {String} value The value to set for the <code>style</code> passed in. Pass a value for this parameter
    * only if the value of the <code>style</code> parameter is a String.</p>
    *
    * @see <a href="#getStyle">getStyle()</a>
    * @return {Publisher} The Publisher object
    * @see <a href="#setStyle">setStyle()</a>
    *
    * @see <a href="Session.html#subscribe">Session.publish()</a>
    * @see <a href="TB.html#initPublisher">TB.initPublisher()</a>
    * @method #setStyle
    * @memberOf Publisher
    */

    /**
    * Sets properties that define the appearance of some user interface controls of the Subscriber.
    *
    * <p>You can either pass one parameter or two parameters to this method.</p>
    *
    * <p>If you pass one parameter, <code>style</code>, it is an object that has one property: <code>nameDisplayMode</code>.
    * Possible values for the <code>style.nameDisplayMode</code> property are: "auto" (the name is displayed when the stream
    * is first displayed and when the user mouses over the display), "off" (the name is not displayed), and "on"
    * (the name is displayed).
    *
    * <p>For example, the following code passes one parameter to the method:</p>
    *
    * <pre>mySubscriber.setStyle({nameDisplayMode: "off"});</pre>
    *
    * <p>If you pass two parameters, <code>style</code> and <code>value</code>, they are key-value pair that
    * define one property of the display style. For example, the following code passes two parameter values
    * to the method:</p>
    *
    * <pre>mySubscriber.setStyle("nameDisplayMode", "off");</pre>
    *
    * <p>You can set the initial settings when you call the <code>Session.subscribe()</code> method.
    * Pass a <code>style</code> property as part of the <code>properties</code> parameter of the method.</p>
    *
    * <p>The TB object dispatches an <code>exception</code> event if you pass in an invalid style to the method.
    * The <code>code</code> property of the ExceptionEvent object is set to 1011.</p>
    *
    * @param {Object} style Either an object containing properties that define the style, or a String defining this
    * single style property to set.
    * @param {String} value The value to set for the <code>style</code> passed in. Pass a value for this parameter
    * only if the value of the <code>style</code> parameter is a String.</p>
    *
    * @returns {Subscriber} The Subscriber object.
    *
    * @see <a href="#getStyle">getStyle()</a>
    * @see <a href="#setStyle">setStyle()</a>
    *
    * @see <a href="Session.html#subscribe">Session.subscribe()</a>
    * @method #setStyle
    * @memberOf Subscriber
    */
    self.setStyle = function(keyOrStyleHash, value, silent) {
        if (typeof(keyOrStyleHash) !== 'string') {
            _style.setAll(keyOrStyleHash, silent);
        }
        else {
            _style.set(keyOrStyleHash, value);
        }

        return this;
    };
};

var Style = function(initalStyles, onStyleChange) {
    var _COMPONENT_STYLES = [
            "showMicButton",
            "showSpeakerButton",
            "showSettingsButton",
            "showCameraToggleButton",
            "nameDisplayMode",
            "buttonDisplayMode",
            "showSaveButton",
            "showRecordButton",
            "showRecordStopButton",
            "showReRecordButton",
            "showPauseButton",
            "showPlayButton",
            "showPlayStopButton",
            "showStopButton",
            "backgroundImageURI",
            "showControlPanel",
            "showRecordCounter",
            "showPlayCounter",
            "showControlBar",
            "showPreviewTime"
        ],

        _validStyleValues = {
            buttonDisplayMode: ["auto", "off", "on"],
            nameDisplayMode: ["auto", "off", "on"],
            showSettingsButton: [true, false],
            showMicButton: [true, false],
            showCameraToggleButton: [true, false],
            showSaveButton: [true, false],
            backgroundImageURI: null,
            showControlBar: [true, false],
            showPlayCounter: [true, false],
            showRecordCounter: [true, false],
            showPreviewTime: [true, false]
        },

        _style = {},


        // Validates the style +key+ and also whether +value+ is valid for +key+
        isValidStyle = function(key, value) {
            return key === 'backgroundImageURI' ||
                    (   _validStyleValues.hasOwnProperty(key) &&
                        _validStyleValues[key].indexOf(value) !== -1 );
        },

        castValue = function(value) {
            switch(value) {
                case 'true':
                    return true;
                case 'false':
                    return false;
                default:
                    return value;
            }
        };


    // Returns a shallow copy of the styles.
    this.getAll = function() {
        var style = OT.$.clone(_style);

        for (var i in style) {
            if (_COMPONENT_STYLES.indexOf(i) < 0) {
                // Strip unnecessary properties out, should this happen on Set?
                delete style[i];
            }
        }

        return style;
    };

    this.get = function(key) {
        if (key) {
            return _style[key];
        }

        // We haven't been asked for any specific key, just return the lot
        return this.getAll();
    };

    // *note:* this will not trigger onStyleChange if +silent+ is truthy
    this.setAll = function(newStyles, silent) {
        var oldValue, newValue;

        for (var key in newStyles) {
            newValue = castValue(newStyles[key]);

            if (isValidStyle(key, newValue)) {
                oldValue = _style[key];

                if (newValue !== oldValue) {
                    _style[key] = newValue;
                    if (!silent) onStyleChange(key, newValue, oldValue);
                }
            }
            else {
                OT.warn("Style.setAll::Invalid style property passed " + key + " : " + newValue);
            }
        }

        return this;
    };

    this.set = function(key, value) {
        OT.debug("Publisher.setStyle: " + key.toString());

        var newValue = castValue(value),
            oldValue;

        if (!isValidStyle(key, newValue)) {
            OT.warn("Style.set::Invalid style property passed " + key + " : " + newValue);
            return this;
        }

        oldValue = _style[key];
        if (newValue !== oldValue) {
            _style[key] = newValue;

            onStyleChange(key, value, oldValue);
        }

        return this;
    };


    if (initalStyles) this.setAll(initalStyles, true);
};

})(window);
(function(window) {

/**
 * A Publishers Microphone.
 *
 * TODO
 * * bind to changes in mute/unmute/volume/etc and respond to them
 */
OT.Microphone = function(webRTCStream, muted) {
    var _muted,
        _gain = 50;


    Object.defineProperty(this, 'muted', {
        get: function() { return _muted; },
        set: function(muted) {
            if (_muted === muted) return;

            _muted = muted;

            var audioTracks = webRTCStream.getAudioTracks();

            for (var i=0, num=audioTracks.length; i<num; ++i) {
                audioTracks[i].enabled = !_muted;
            }
        }
    });

    Object.defineProperty(this, 'gain', {
        get: function() { return _gain; },

        set: function(gain) {
            OT.warn("OT.Microphone.gain IS NOT YET IMPLEMENTED");

            _gain = gain;
        }
    });

    // Set the initial value
    if (muted !== undefined) {
        this.muted = muted === true;
    }
    else if (webRTCStream.getAudioTracks().length) {
        this.muted = !webRTCStream.getAudioTracks()[0].enabled;
    }
    else {
        this.muted = false;
    }
};

})(window);
(function(window) {

// A Factory method for generating simple state machine classes.
//
// @usage
//    var StateMachine = OT.generateSimpleStateMachine('start', ['start', 'middle', 'end', {
//      start: ['middle'],
//      middle: ['end'],
//      end: ['start']
//    }]);
//
//    var states = new StateMachine();
//    state.current;            // <-- start
//    state.set('middle');
//
OT.generateSimpleStateMachine = function(initialState, states, transitions) {
  var validStates = states.slice(),
      validTransitions = OT.$.clone(transitions);

  var isValidState = function (state) {
    return validStates.indexOf(state) !== -1;
  }

  var isValidTransition = function(fromState, toState) {
    return validTransitions[fromState] && validTransitions[fromState].indexOf(toState) !== -1;
  };

  return function(stateChangeFailed) {
    var currentState = initialState,
        previousState = null;

    function signalChangeFailed(message, newState) {
        stateChangeFailed({
          message: message,
          newState: newState,
          currentState: currentState,
          previousState: previousState
        });
    }

    // Validates +newState+. If it's invalid it triggers stateChangeFailed and returns false.
    function handleInvalidStateChanges(newState) {
      if (!isValidState(newState)) {
        signalChangeFailed("'" + newState + "' is not a valid state", newState)

        return false;
      }

      if (!isValidTransition(currentState, newState)) {
        signalChangeFailed("'" + currentState + "' cannot transition to '" + newState + "'", newState)

        return false;
      }

      return true;
    }


    this.set = function(newState) {
      if (!handleInvalidStateChanges(newState)) return;

      previousState = currentState;
      currentState = newState;
    };

    Object.defineProperties(this, {
      current: {
        get: function() { return currentState; }
      },

      subscribing: {
        get: function() { return currentState === 'Subscribing'; }
      }
    });
  };
};

})(window);
(function(window) {

// Models a Subscriber's subscribing State
//
// Valid States:
//     NotSubscribing            (the initial state
//     Init                      (basic setup of DOM
//     ConnectingToPeer          (Failure Cases -> No Route, Bad Offer, Bad Answer
//     BindingRemoteStream       (Failure Cases -> Anything to do with the media being invalid, the media never plays
//     Subscribing               (this is 'onLoad'
//     Failed                    (terminal state, with a reason that maps to one of the failure cases above
//
//
// Valid Transitions:
//     NotSubscribing ->
//         Init
//
//     Init ->
//             ConnectingToPeer
//           | BindingRemoteStream         (if we are subscribing to ourselves and we alreay have a stream
//
//     ConnectingToPeer ->
//             BindingRemoteStream
//           | Failed
//
//     BindingRemoteStream ->
//             Subscribing
//           | Failed
//
//     Subscribing ->
//             NotSubscribing              (unsubscribe
//           | Failed                      (probably a peer connection failure after we began subscribing
//
//     Failed ->                           (terminal error state)
//
//
// @example
//     var state = new SubscribingState(function(change) {
//       console.log(change.message);
//     });
//
//     state.set('Init');
//     state.current;                 -> 'Init'
//
//     state.set('Subscribing');      -> triggers stateChangeFailed and logs out the error message
//
//

var validStates = [ 'NotSubscribing', 'Init', 'ConnectingToPeer', 'BindingRemoteStream', 'Subscribing', 'Failed' ],

    validTransitions = {
      NotSubscribing: ['Init'],
      Init: ['ConnectingToPeer', 'BindingRemoteStream'],
      ConnectingToPeer: ['BindingRemoteStream', 'Failed'],
      BindingRemoteStream: ['Subscribing', 'Failed'],
      Subscribing: ['NotSubscribing', 'Failed'],
      Failed: []
    },

    initialState = 'NotSubscribing';

OT.SubscribingState = OT.generateSimpleStateMachine(initialState, validStates, validTransitions);

Object.defineProperty(OT.SubscribingState.prototype, 'attemptingToSubscribe', {
  get: function() { return [ 'Init', 'ConnectingToPeer', 'BindingRemoteStream' ].indexOf(this.current) !== -1; }
});

})(window);
(function(window) {

// Models a Publisher's publishing State
//
// Valid States:
//    NotPublishing
//    GetUserMedia
//    BindingMedia
//    MediaBound
//    PublishingToSession
//    Publishing
//    Failed
//
//
// Valid Transitions:
//    NotPublishing ->
//        GetUserMedia
//
//    GetUserMedia ->
//        BindingMedia
//      | Failed                      (Failure Reasons -> stream error, constraints, permission denied
//
//
//    BindingMedia ->
//        MediaBound
//      | Failed                      (Failure Reasons -> Anything to do with the media being invalid, the media never plays
//
//    MediaBound ->
//        PublishingToSession         (MediaBound could transition to PublishingToSession if a stand-alone publish is bound to a session
//      | Failed                      (Failure Reasons -> media issues with a stand-alone publisher
//
//    PublishingToSession
//        Publishing
//      | Failed                      (Failure Reasons -> timeout while waiting for ack of stream registered. We do not do this right now
//
//
//    Publishing ->
//        NotPublishing               (Unpublish
//      | Failed                      (Failure Reasons -> loss of network, media error, anything that causes *all* Peer Connections to fail (less than all failing is just an error, all is failure)
//
//    Failed ->                       (Terminal state
//
//


var validStates = [ 'NotPublishing', 'GetUserMedia', 'BindingMedia', 'MediaBound', 'PublishingToSession', 'Publishing', 'Failed' ],

    validTransitions = {
      NotPublishing: ['GetUserMedia'],
      GetUserMedia: ['BindingMedia', 'Failed'],
      BindingMedia: ['MediaBound', 'Failed'],
      MediaBound: ['PublishingToSession', 'Failed'],
      PublishingToSession: ['Publishing', 'Failed'],
      Publishing: ['NotPublishing', 'Failed'],
      Failed: []
    },

    initialState = 'NotPublishing';

OT.PublishingState = OT.generateSimpleStateMachine(initialState, validStates, validTransitions);

Object.defineProperties(OT.PublishingState.prototype, {
  attemptingToPublish: {
    get: function() { return [ 'GetUserMedia', 'BindingMedia', 'MediaBound', 'PublishingToSession' ].indexOf(this.current) !== -1; }
  },

  publishing: {
    get: function() { return this.current === 'Publishing'; }
  }
});


})(window);
(function(window) {

// The default constraints
var defaultConstraints = {
    audio: true,
    video: true
};

/**
 * The Publisher object  provides the mechanism through which control of the
 * published stream is accomplished. Calling the <code>TB.initPublisher</code> method of a
 *  Session object creates a Publisher object. </p>
 *
 *  <p>The following code instantiates a session, and publishes an audio-video stream
 *  upon connection to the session: </p>
 *
 *  <pre>
 *  var API_KEY = ""; // Replace with your API key. See https://dashboard.tokbox.com/projects
 *  var sessionID = ""; // Replace with your own session ID.
 *                      // See https://dashboard.tokbox.com/projects
 *  var token = ""; // Replace with a generated token that has been assigned the moderator role.
 *                  // See https://dashboard.tokbox.com/projects
 *
 *  var session = TB.initSession(sessionID);
 *  session.addEventListener("sessionConnected", sessionConnectHandler);
 *  session.connect(API_KEY, token);
 *
 *  function sessionConnectHandler(event) {
 *      var div = document.createElement('div');
 *      div.setAttribute('id', 'publisher');
 *
 *      var publisherContainer = document.getElementById('publisherContainer');
 *          // This example assumes that a publisherContainer div exists
 *      publisherContainer.appendChild(div);
 *
 *      var publisherProperties = {width: 400, height:300, name:"Bob's stream"};
 *      publisher = TB.initPublisher(API_KEY, 'publisher', publisherProperties);
 *      session.publish(publisher);
 *  }
 *  </pre>
 *
 *      <p>This example creates a Publisher object and adds its video to a DOM element named <code>publisher</code>
 *      by calling the <code>TB.initPublisher()</code> method. It then publishes a stream to the session by calling
 *      the <code>publish()</code> method of the Session object.</p>
 *
 * @property id The DOM ID of the Publisher.
 * @property stream The {@link Stream} object corresponding the the stream of the Publihser.
 * @property session The {@link Session} to which the Publisher belongs.
 *
 * @see <a href="TB.html#initPublisher">TB.initPublisher</a>
 * @see <a href="Session.html#publish">Session.publish()</a>
 *
 * @class Publisher
 */
OT.Publisher = function() {
    // Check that the client meets the minimum requirements, if they don't the upgrade
    // flow will be triggered.
    if (!OT.checkSystemRequirements()) {
        OT.upgradeSystemRequirements();
        return;
    }

    var _guid = OT.Publisher.nextId(),
        _domId,
        _container,
        _targetElement,
        _stream,
        _webRTCStream,
        _session,
        _peerConnections = {},
        _loaded = false,
        _publishProperties,
        _publishStartTime,
        _microphone,
        _chrome,
        _analytics = new OT.Analytics(),
        _validResolutions = [
            {width: 320, height: 240},
            {width: 640, height: 480},
            {width: 1280, height: 720}
        ],
        _qosIntervals = {},
        _gettingStats = 0,
        _state;

    OT.$.eventing(this);

    OT.StylableComponent(this, {
        showMicButton: true,
        showSettingsButton: true,
        showCameraToggleButton: true,
        nameDisplayMode: "auto",
        buttonDisplayMode: "auto",
        backgroundImageURI: null
    });

        /// Private Methods
    var logAnalyticsEvent = function(action, variation, payloadType, payload) {
            _analytics.logEvent({
                action: action,
                variation: variation,
                payload_type: payloadType,
                payload: payload,
                session_id: _session ? _session.sessionId : null,
                connection_id: _session && _session.connected ? _session.connection.connectionId : null,
                partner_id: _session ? _session.apiKey : OT.APIKEY,
                streamId: _stream ? _stream.id : null,
                widget_id: _guid,
                widget_type: 'Publisher'
            });
        },

        isValidResolution = function(width, height) {
            for (var i=0; i<_validResolutions.length; ++i) {
                if (_validResolutions[i].width == width && _validResolutions[i].height == height) {
                    return true;
                }
            }
            return false;
        },

        recordQOS = function(connection_id) {
            var QoS_blob = {
                widget_type: 'Publisher',
                stream_type : 'WebRTC',
                sessionId: _session ? _session.sessionId : null,
                connectionId: _session && _session.connected ? _session.connection.connectionId : null,
                partnerId: _session ? _session.apiKey : OT.APIKEY,
                streamId: _stream ? _stream.id : null,
                widgetId: _guid,
                version: OT.properties.version,
                media_server_name: _session ? _session.sessionInfo.messagingServer : null,
                duration: new Date().getTime() -_publishStartTime.getTime(),
                remote_connection_id: connection_id
            };

            // get stats for each connection id
            _peerConnections[connection_id].getStats(function(stats) {
                if (stats) {
                    for (stat_index in stats) {
                        QoS_blob[stat_index] = stats[stat_index];
                    }
                }
                _analytics.logQOS(QoS_blob);
            });
        },

        /// Private Events

        stateChangeFailed = function(changeFailed) {
            OT.error("Publisher State Change Failed: ", changeFailed.message);
            OT.debug(changeFailed);
        },

        onLoaded = function() {
            OT.debug("OT.Publisher.onLoaded");
            logAnalyticsEvent('publish', 'Success', 'streamType', 'WebRTC');

            _state.set('MediaBound');
            _container.loading = false;
            _loaded = true;

            _createChrome.call(this);

            this.trigger('initSuccess', this);
            this.trigger('loaded', this);
        },

        onLoadFailure = function(reason) {
            logAnalyticsEvent('publish', 'Failure', 'reason', "Publisher PeerConnection Error: " + reason);

            _state.set('Failed');
            this.trigger('publishError', "Publisher PeerConnection Error: " + reason);

            OT.handleJsException("Publisher PeerConnection Error: " + reason, OT.ExceptionCodes.P2P_CONNECTION_FAILED, {
                session: _session,
                target: this
            });
        },

        onStreamAvailable = function(webOTStream) {
            OT.debug("OT.Publisher.onStreamAvailable");

            _state.set('BindingMedia');

            cleanupLocalStream();
            _webRTCStream = webOTStream;

            _microphone = new OT.Microphone(_webRTCStream, !_publishProperties.publishAudio);
            this.publishVideo(_publishProperties.publishVideo);

            this.dispatchEvent(
                new OT.Event(OT.Event.names.ACCESS_ALLOWED, false)
            );

            _targetElement = new OT.VideoElement({
                attributes: {muted:true}
            });

            _targetElement.on({
                    streamBound: onLoaded,
                    loadError: onLoadFailure,
                    error: onVideoError
                }, this)
                .bindToStream(_webRTCStream);

            _container.video = _targetElement;
            OT.DOMComponentCleanup.add(this, _targetElement);
        },

        onStreamAvailableError = function(error) {
            OT.error('OT.Publisher.onStreamAvailableError ' + error.name + ': ' + error.message);

            _state.set('Failed');
            this.trigger('publishError', error.message);

            if (_container) _container.destroy();

            logAnalyticsEvent('publish', 'Failure', 'reason', "Publisher failed to access camera/mic: " + error.message);

            OT.handleJsException("Publisher failed to access camera/mic: " + error.message, 2000, {
                session: _session,
                target: this
            });
        },

        // The user has clicked the 'deny' button the the allow access dialog (or it's set to always deny)
        onAccessDenied = function(error) {
            OT.error('OT.Publisher.onStreamAvailableError Permission Denied');

            _state.set('Failed');
            this.trigger('publishError', error.message);

            logAnalyticsEvent('publish', 'Failure', 'reason', 'Publisher Access Denied: Permission Denied');

            var event = new OT.Event(OT.Event.names.ACCESS_DENIED),
                defaultAction = function() {
                    if (!event.isDefaultPrevented() && _container) _container.destroy();
                };

            this.dispatchEvent(event, defaultAction);
        },

        onAccessDialogOpened = function() {
            logAnalyticsEvent('accessDialog', 'Opened', '', '');

            this.dispatchEvent(
                new OT.Event(OT.Event.names.ACCESS_DIALOG_OPENED, false)
            );
        },

        onAccessDialogClosed = function() {
            logAnalyticsEvent('accessDialog', 'Closed', '', '');

            this.dispatchEvent(
                new OT.Event(OT.Event.names.ACCESS_DIALOG_CLOSED, false)
            );
        },

        onVideoError = function(errorCode, errorReason) {
            OT.error('OT.Publisher.onVideoError');

            var message = errorReason + (errorCode ? ' (' + errorCode + ')' : '');
            logAnalyticsEvent('stream', null, 'reason', "Publisher while playing stream: " + message);

            _state.set('Failed');

            if (_state.attemptingToPublish) {
                this.trigger('publishError', message);
            }
            else {
                this.trigger('error', message);
            }

            OT.handleJsException("Publisher error playing stream: " + message, 2000, {
                session: _session,
                target: this
            });
        },

        onPeerDisconnected = function(peerConnection) {
            OT.debug("OT.Subscriber has been disconnected from the Publisher's PeerConnection");

            this.cleanupSubscriber(peerConnection.remoteConnection.id);
        },

        onPeerConnectionFailure = function(code, reason, peerConnection) {
            logAnalyticsEvent('publish', 'Failure', 'reason|hasRelayCandidates', [
                "Publisher PeerConnection with connection " + peerConnection.remoteConnection.id  + " failed: " + reason,
                peerConnection.hasRelayCandidates
                ].join('|'));

            OT.handleJsException("Publisher PeerConnection Error: " + reason, 2000, {
                session: _session,
                target: this
            });

            // We don't call cleanupSubscriber as it also logs a
            // disconnected analytics event, which we don't want in this
            // instance. The duplication is crufty though and should
            // be tidied up.
            clearInterval(_qosIntervals[peerConnection.remoteConnection.id]);
            delete _qosIntervals[peerConnection.remoteConnection.id]

            delete _peerConnections[peerConnection.remoteConnection.id];
        },

        getStats = function(callback) {
            if (_gettingStats > 0) {
                OT.debug("Still getting stats");
                return;
            }

            var getStatsBlob = {};

            // loops through all the peer connections get get the stats for them
            for (var conn_id in _peerConnections) {

                // this locks the getStats function so it isn't accidentally called
                // again while already in the middle of getting stats
                _gettingStats++;

                getStatsBlob[conn_id] = null;

                // just so we don't lose the connection id
                (function(connection_id) {
                    _peerConnections[connection_id].getStats(function(parsed_stats) {

                        // one down
                        _gettingStats--;

                        if (parsed_stats) {
                            getStatsBlob[connection_id] = parsed_stats;
                        }

                        // if this reaches zero, that means all of the peer connections
                        // have returned their stats reports
                        if (_gettingStats == 0) {
                            callback(getStatsBlob);
                        }
                    });
                })(conn_id);
            }
        },

        /// Private Helpers

        // Clean up our LocalMediaStream
        cleanupLocalStream = function() {
            if (_webRTCStream) {
                // Stop revokes our access cam and mic access for this instance
                // of localMediaStream.
                _webRTCStream.stop();
                _webRTCStream = null;
            }
        },

        createPeerConnectionForRemote = function(remoteConnection) {
            var peerConnection = _peerConnections[remoteConnection.id];

            if (!peerConnection) {
                var startConnectingTime = OT.$.now();

                logAnalyticsEvent('createPeerConnection', 'Attempt', '', '');

                peerConnection = _peerConnections[remoteConnection.id] = new OT.PublisherPeerConnection(
                    remoteConnection,
                    _session,
                    _stream,
                    _webRTCStream
                );

                peerConnection.on({
                    connected: function() {
                        logAnalyticsEvent('createPeerConnection', 'Success', 'pcc|hasRelayCandidates', [
                            parseInt(OT.$.now() - startConnectingTime, 10),
                            peerConnection.hasRelayCandidates
                        ].join('|'));

                        // start recording the QoS for this peer connection
                        _qosIntervals[remoteConnection.id] = setInterval(function() {
                            recordQOS(remoteConnection.id)
                        }, 30000);
                    },
                    disconnected: onPeerDisconnected,
                    error: onPeerConnectionFailure
                }, this);
            }

            return peerConnection;
        },

        /// Chrome

        // If mode is false, then that is the mode. If mode is true then we'll
        // definitely display  the button, but we'll defer the model to the
        // Publishers buttonDisplayMode style property.
        chromeButtonMode = function(mode) {
            if (mode === false) return 'off';

            var defaultMode = this.getStyle('buttonDisplayMode');

            // The default model is false, but it's overridden by +mode+ being true
            if (defaultMode === false) return 'on';

            // defaultMode is either true or auto.
            return defaultMode;
        },

        updateChromeForStyleChange = function(key, value, oldValue) {
            if (!_chrome) return;

            switch(key) {
                case 'nameDisplayMode':
                    _chrome.name.setDisplayMode(value);
                    break;

                case 'buttonDisplayMode':
                case 'showMicButton':
                case 'showSettingsButton':
                    // _chrome.settingsPanelButton.setDisplayMode(
                    //     chromeButtonMode.call(this, this.getStyle('showSettingsButton'))
                    // );

                    // _chrome.muteButton.setDisplayMode(
                    //     chromeButtonMode.call(this, this.getStyle('showMicButton'))
                    // );
            }
        },

        _createChrome = function() {
            _chrome = new OT.Chrome({
                parent: _container.domElement
            }).set({
                name: new OT.Chrome.NamePanel({
                    name: _publishProperties.name,
                    mode: this.getStyle('nameDisplayMode')
                }),

                // settingsPanelButton: new OT.Chrome.SettingsPanelButton({
                //     mode: chromeButtonMode.call(this, this.getStyle('showSettingsButton'))
                // }),

                // Disabled until we can change the mic Volume through WebRTC
                muteButton: new OT.Chrome.MuteButton({
                    muted: _publishProperties.publishAudio === false,
                    mode: chromeButtonMode.call(this, this.getStyle('showMicButton'))
                }),

                opentokButton: new OT.Chrome.OpenTokButton()
            }).on({
                // 'SettingsPanel:open': function() {
                //     if (!_chrome.settingsPanel) {
                //         // Add the settings panel, hide it initially
                //         _chrome.set(
                //             'settingsPanel',
                //             new OT.Chrome.SettingsPanel({
                //                 stream: _webRTCStream,
                //                 mode: 'on'
                //             })
                //         );
                //     }
                //     else {
                //         _chrome.settingsPanel.setDisplayMode('on');
                //     }

                //     OT.$.addClass(_container, 'OT_reversed');
                // },

                // 'SettingsPanel:close': function() {
                //     OT.$.removeClass(_container, 'OT_reversed');

                //     // Hide the settings panel after our animation is complete
                //     setTimeout(function() {
                //         _chrome.settingsPanel.setDisplayMode('off');
                //     }, 3000);
                // },


                muted: this.publishAudio.bind(this, false),
                unmuted: this.publishAudio.bind(this, true)
            });
        },

        reset = function() {
            OT.DOMComponentCleanup.remove(this);

            if (_chrome) {
              _chrome.destroy();
              _chrome = null;
            }

            this.disconnect();

            _microphone = null;

            if (_targetElement) {
                _targetElement.destroy();
                _targetElement = null;
            }

            cleanupLocalStream();

            if (_container) {
                _container.destroy();
                _container = null;
            }

            if (this.session) this._.unpublishFromSession(this.session);

            // clear all the intervals
            for (var conn_id in _qosIntervals) {
                clearInterval(_qosIntervals[conn_id]);
                delete _qosIntervals[conn_id];
            }

            _domId = null;
            _stream = null;
            _loaded = false;

            _session = null;
            _properties = null;

            _state.set('NotPublishing');
        }.bind(this);


    this.publish = function(domId, properties) {
        OT.debug("OT.Publisher: publish");

        if ( _state.attemptingToPublish || _state.publishing ) reset();
        _state.set('GetUserMedia');

        _publishProperties = OT.$.defaults(properties || {}, {
            publishAudio : true,
            publishVideo : true,
            mirror: true
        });

        _publishProperties.constraints = OT.$.defaults(_publishProperties.constraints || {}, defaultConstraints);

        if (_publishProperties.style) {
            this.setStyle(_publishProperties.style, null, true);
        }

        if (_publishProperties.name) {
            _publishProperties.name = _publishProperties.name.toString();
        }

        _publishProperties.classNames = 'OT_root OT_publisher';

        // Defer actually creating the publisher DOM nodes until we know
        // the DOM is actually loaded.
        OT.onLoad(function() {
            _container = new OT.WidgetView(domId, _publishProperties);
            _domId = _container.domId;

            OT.$.getUserMedia(
                _publishProperties.constraints,
                onStreamAvailable.bind(this),
                onStreamAvailableError.bind(this),
                onAccessDialogOpened.bind(this),
                onAccessDialogClosed.bind(this),
                onAccessDenied.bind(this)
            );
        }, this);

        return this;
    };

 /**
  * Starts publishing audio (if it is currently not being published)
  * when the <code>value</code> is <code>true</code>; stops publishing audio
  * (if it is currently being published) when the <code>value</code> is <code>false</code>.
  *
  * @param {Boolean} value Whether to start publishing audio (<code>true</code>)
  * or not (<code>false</code>).
  *
  * @see <a href="TB.html#initPublisher">TB.initPublisher()</a>
  * @see <a href="Stream.html#hasAudio">Stream.hasAudio</a>
  * @see StreamPropertyChangedEvent
  * @method #publishAudio
  * @memberOf Publisher
  */
    this.publishAudio = function(value) {
        _publishProperties.publishAudio = value;

        if (_microphone) {
            _microphone.muted = !value;
        }

        if (_session && _stream) {
            _session.sendMessage(
                OT.WebSocketMessage.modifyStream(_stream.streamId, "hasAudio", value)
            );
        }
        return this;
    };


 /**
  * Starts publishing video (if it is currently not being published)
  * when the <code>value</code> is <code>true</code>; stops publishing video
  * (if it is currently being published) when the <code>value</code> is <code>false</code>.
  *
  * @param {Boolean} value Whether to start publishing video (<code>true</code>)
  * or not (<code>false</code>).
  *
  * @see <a href="TB.html#initPublisher">TB.initPublisher()</a>
  * @see <a href="Stream.html#hasVideo">Stream.hasVideo</a>
  * @see StreamPropertyChangedEvent
  * @method #publishVideo
  * @memberOf Publisher
  */
    this.publishVideo = function(value) {
        var oldValue = _publishProperties.publishVideo;
        _publishProperties.publishVideo = value;

        if (_session && _stream && _publishProperties.publishVideo !== oldValue) {
            _session.sendMessage(
                OT.WebSocketMessage.modifyStream(_stream.streamId, "hasVideo", value)
            );
        }

        // We currently do this event if the value of publishVideo has not changed
        // This is because the state of the video tracks enabled flag may not match
        // the value of publishVideo at this point. This will be tidied up shortly.
        if (_webRTCStream) {
            var videoTracks = _webRTCStream.getVideoTracks();
            for (var i=0, num=videoTracks.length; i<num; ++i) {
                videoTracks[i].enabled = value;
            }
        }

        if(_container) {
            _container.showPoster = !value;
        }

        return this;
    };

    this.recordQOS = function() {

        // have to record QoS for every peer connection
        for (var conn_id in _peerConnections) {
            recordQOS(conn_id);
        }
    };

    /**
    * Deletes the Publisher object and removes it from the HTML DOM.
    * @method #destroy
    * @memberOf Publisher
    * @return {Publisher} The Publisher.
    */
    this.destroy = function() {
        reset();

        this.trigger('destroyed', this);
        this.off();

        return this;
    };

    /**
    * @methodOf Publisher
    * @private
    */
    this.disconnect = function() {
        // Close the connection to each of our subscribers
        for (var fromConnectionId in _peerConnections) {
            this.cleanupSubscriber(fromConnectionId);
        }
    };

    this.cleanupSubscriber = function(fromConnectionId) {
        var pc = _peerConnections[fromConnectionId];

        clearInterval(_qosIntervals[fromConnectionId]);
        delete _qosIntervals[fromConnectionId];

        if (pc) {
            pc.destroy();
            delete _peerConnections[fromConnectionId];

            logAnalyticsEvent('disconnect', 'PeerConnection', 'subscriberConnection', fromConnectionId);
        }
    };


    this.processMessage = function(type, fromConnection, message) {
        OT.debug("OT.Publisher.processMessage: Received " + type + " from " + fromConnection.id);
        OT.debug(message);

        switch (type) {
            case OT.WebSocketMessageType.JSEP_UNSUBSCRIBE:
                this.cleanupSubscriber(fromConnection.id);
                break;

            default:
                var peerConnection = createPeerConnectionForRemote.call(this, fromConnection);
                peerConnection.processMessage(type, message);
        }
    };

    /**
    * Returns the base-64-encoded string of PNG data representing the Publisher video.
    *
    *   <p>You can use the string as the value for a data URL scheme passed to the src parameter of
    *   an image file, as in the following:</p>
    *
    * <pre>
    *  var imgData = publisher.getImgData();
    *
    *  var img = document.createElement("img");
    *  img.setAttribute("src", "data:image/png;base64," + imgData);
    *  var imgWin = window.open("about:blank", "Screenshot");
    *  imgWin.document.write("&lt;body&gt;&lt;/body&gt;");
    *  imgWin.document.body.appendChild(img);
    * </pre>
    *
    * @method #getImgData
    * @memberOf Publisher
    * @return {String} The base-64 encoded string. Returns an empty string if there is no video.
    */

    this.getImgData = function() {
        if (!_loaded) {
            OT.error("OT.Publisher.getImgData: Cannot getImgData before the Publisher is publishing.");

            return null;
        }

        return _targetElement.imgData;
    };


    // API Compatibility layer for Flash Publisher, this could do with some tidyup.
    this._ = {
        publishToSession: function(session) {
            // Add session property to Publisher
            this.session = session;

            var createStream = function() {
                // Bail if this.session is gone, it means we were unpublished
                // before createStream could finish.
                if (!this.session) return;

                _state.set('PublishingToSession');

                session.sendMessage(
                    OT.WebSocketMessage.createStream(
                        this.guid,
                        _publishProperties && _publishProperties.name ? _publishProperties.name : "",
                        OT.VideoOrientation.ROTATED_NORMAL,
                        _targetElement.videoWidth,                      // actual width and height
                        _targetElement.videoHeight,                     // of the video stream.
                        _publishProperties.publishAudio,
                        _publishProperties.publishVideo,
                        this.session.sessionInfo.p2pEnabled
                    )
                );
            };

            if (_loaded) createStream.call(this);
            else this.on("initSuccess", createStream, this);

            logAnalyticsEvent('publish', 'Attempt', 'streamType', 'WebRTC');

            return this;
        }.bind(this),

        unpublishFromSession: function(session) {
            if (!this.session || session.id !== this.session.id) {
                OT.warn("The publisher " + this.guid + " is trying to unpublish from a session " + session.id + " it is not attached to");
                return this;
            }

            if (session.connected && this.stream) {
                session.sendMessage(OT.WebSocketMessage.destroyStream(this.stream.id));
            }

            // Disconnect immediately, rather than wait for the WebSocket to
            // reply to our destroyStream message.
            this.disconnect();
            this.session = null;

            // We're back to being a stand-alone publisher again.
            _state.set('MediaBound');

            logAnalyticsEvent('unpublish', 'Success', 'sessionId', session.id);

            return this;
        }.bind(this),

        // Called once our stream has been ack'd as created by the session
        streamRegisteredHandler: function(stream) {
            this.stream = stream;

            _state.set('Publishing');
            _publishStartTime = new Date();

            this.trigger('publishSuccess');
        }.bind(this)
    };

    this.detectDevices = function() {
        OT.warn("Fixme: Haven't implemented detectDevices");
    };

    this.detectMicActivity = function() {
        OT.warn("Fixme: Haven't implemented detectMicActivity");
    };

    this.getEchoCancellationMode = function() {
        OT.warn("Fixme: Haven't implemented getEchoCancellationMode");
        return "fullDuplex";
    };

    this.setMicrophoneGain = function(value) {
        OT.warn("Fixme: Haven't implemented setMicrophoneGain");
    };

    this.getMicrophoneGain = function() {
        OT.warn("Fixme: Haven't implemented getMicrophoneGain");
        return 0.5;
    };

    this.setCamera = function(value) {
        OT.warn("Fixme: Haven't implemented setCamera");
    };

    this.setMicrophone = function(value) {
        OT.warn("Fixme: Haven't implemented setMicrophone");
    };


    Object.defineProperties(this, {
        id: {
            get: function() { return _domId; }
        },

        guid: {
            get: function() { return _guid; }
        },

        stream: {
            get: function() { return _stream; },
            set: function(stream) { _stream = stream; }
        },

        streamId: {
            get: function() {
                if (!_stream) return null;

                return _stream.id;
            }
        },

        targetElement: {
            get: function() { return _targetElement.domElement; }
        },

        domId: {
            get: function() { return _domId; }
        },

        session: {
            get: function() { return _session; },
            set: function(session) { _session = session; }
        },

        isWebRTC: {
            get: function() { return true; }
        },

        loading: {
            get: function(){ return _container && _container.loading }
        }
    });

    Object.defineProperty(this._, 'webRtcStream', {
        get: function() { return _webRTCStream; }
    });

    this.on('styleValueChanged', updateChromeForStyleChange, this);
    _state = new OT.PublishingState(stateChangeFailed);

  /**
  * Registers a method as an event listener for a specific event. See <a href="#events">Events</a>.
  *
  * <p>
  * The following code adds an event listener for the <code>accessAllowed</code> event:
  * </p>
  *
  * <pre>
  * publisher.addEventListener("accessAllowed", accessHandler);
  *
  * function accessHandler(event) {
  *    // The user has allowed access to the camera and microphone.
  * }
  * </pre>
  *
  * <p>
  * If a handler is not registered for an event, the event is ignored locally. If the event listener function does not exist,
  * the event is ignored locally.
  * </p>
  * <p>
  * 	Throws an exception if the <code>listener</code> name is invalid.
  * </p>
  *
  * @param {String} type The string identifying the type of event.
  *
  * @param {Function} listener The function to be invoked when the Publisher object dispatches the event.
  * @memberOf Publisher
  * @method #addEventListener
  */

  /**
  * Removes an event listener for a specific event.
  *
  * <p>
  * Throws an exception if the <code>listener</code> name is invalid.
  * </p>
  *
  * @param {String} type The string identifying the type of event.
  *
  * @param {Function} listener The event listener function to remove.
  *
  * @memberOf Publisher
  * @method #removeEventListener
  */

	/**
	* Dispatched when the user has clicked the Allow button, granting the
	* app access to the camera and microphone.
	* @name accessAllowed
	* @event
	* @memberof Publisher
	*/

	/**
	* Dispatched when the user has clicked the Deny button, preventing the
	* app from having access to the camera and microphone.
	* @name accessDenied
	* @event
	* @memberof Publisher
	*/

	/**
	* Dispatched when the Allow/Deny dialog box is opened. (This is the dialog box in which the user can grant
	* the app access to the camera and microphone.)
	* @name accessDialogOpened
	* @event
	* @memberof Publisher
	*/

	/**
	* Dispatched when the Allow/Deny box is closed. (This is the dialog box in which the user can grant
	* the app access to the camera and microphone.)
	* @name accessDialogClosed
	* @event
	* @memberof Publisher
	*/

};

// Helper function to generate unique publisher ids
OT.Publisher.nextId = uuid;

})(window);
(function(window) {


/**
 * The Subscriber object is a representation of the local video element that is playing back a remote stream.
 * The Subscriber object includes methods that let you disable and enable local audio playback for the subscribed stream.
 * The <code>subscribe()</code> method of the {@link Session} object returns a Subscriber object.
 *
 * @property {String} id The DOM ID of the Subscriber.
 * @property {Stream} stream The stream to which you are subscribing.
 * @class Subscriber
 */
OT.Subscriber = function(replaceElementId, options) {
    var _widgetId = uuid(),
        _domId = replaceElementId || _widgetId,
        _container,
        _streamContainer,
        _chrome,
        _stream,
        _fromConnectionId,
        _peerConnection,
        _session = options.session,
        _subscribeStartTime,
        _startConnectingTime,
        _qosInterval,
        _properties = OT.$.clone(options),
        _analytics = new OT.Analytics(),
        _audioVolume = 50,
        _gettingStats = 0,
        _state;


    if (!_session) {
        OT.handleJsException("Subscriber must be passed a session option", 2000, {
            session: _session,
            target: this
        });

        return;
    }

    OT.$.eventing(this);

    OT.StylableComponent(this, {
        nameDisplayMode: "auto",
        buttonDisplayMode: "auto",
        backgroundImageURI: null
    });

    var logAnalyticsEvent = function(action, variation, payloadType, payload) {
            _analytics.logEvent({
                action: action,
                variation: variation,
                payload_type: payloadType,
                payload: payload,
                stream_id: _stream ? _stream.id : null,
                session_id: _session ? _session.sessionId : null,
                connection_id: _session && _session.connected ? _session.connection.connectionId : null,
                partner_id: _session && _session.connected ? _session.sessionInfo.partnerId : null,
                widget_id: _widgetId,
                widget_type: 'Subscriber'
            });
        },

        recordQOS = function() {
            if(_state.subscribing && _session && _session.connected) {
                var QoS_blob = {
                    widget_type: 'Subscriber',
                    stream_type : 'WebRTC',
                    session_id: _session ? _session.sessionId : null,
                    connectionId: _session ? _session.connection.connectionId : null,
                    media_server_name: _session ? _session.sessionInfo.messagingServer : null,
                    partner_id: _session ? _session.apiKey : null,
                    stream_id: _stream.id,
                    widget_id: _widgetId,
                    version: OT.properties.version,
                    duration: parseInt(OT.$.now() - _subscribeStartTime, 10),
                    remote_connection_id: _stream.connection.connectionId
                };


                // get stats for each connection id
                _peerConnection.getStats(function(stats) {
                    if (stats) {
                        for (stat_index in stats) {
                            QoS_blob[stat_index] = stats[stat_index];
                        }
                    }
                    _analytics.logQOS(QoS_blob);
                });
            }
        },

        stateChangeFailed = function(changeFailed) {
            OT.error("Subscriber State Change Failed: ", changeFailed.message);
            OT.debug(changeFailed);
        },

        onLoaded = function() {
            if (_state.subscribing || !_streamContainer) return;

            OT.debug("OT.Subscriber.onLoaded");

            _state.set('Subscribing');
            _subscribeStartTime = OT.$.now();

            logAnalyticsEvent('createPeerConnection', 'Success', 'pcc|hasRelayCandidates', [
                parseInt(_subscribeStartTime - _startConnectingTime, 10),
                _peerConnection && _peerConnection.hasRelayCandidates
            ].join('|'));

            _qosInterval = setInterval(recordQOS, 30000);

            _container.loading = false;

            _createChrome.call(this);

            this.trigger('subscribeSuccess', this);
            this.trigger('loaded', this);


            logAnalyticsEvent('subscribe', 'Success', 'streamId', _stream.id);
        },

        onDisconnected = function() {
            OT.debug("OT.Subscriber has been disconnected from the Publisher's PeerConnection");

            if (_state.attemptingToSubscribe) {
                // subscribing error
                _state.set('Failed');
                this.trigger('subscribeError', "ClientDisconnected");
            }
            else if (_state.subscribing) {
                _state.set('Failed');

                // we were disconnected after we were already subscribing
                // probably do nothing?
            }

            this.disconnect();
        },


        onPeerConnectionFailure = function(code, reason) {
            if (_state.attemptingToSubscribe) {
                // We weren't subscribing yet so this was a failure in setting
                // up the PeerConnection or receiving the initial stream.
                logAnalyticsEvent('createPeerConnection', 'Failure', 'reason|hasRelayCandidates', [
                    "Subscriber PeerConnection Error: " + reason,
                    _peerConnection && _peerConnection.hasRelayCandidates
                ].join('|'));

                _state.set('Failed');
                this.trigger('subscribeError', reason);
            }
            else if (_state.subscribing) {
                // we were disconnected after we were already subscribing
                _state.set('Failed');
                this.trigger('error', reason);
            }

            this.disconnect();

            logAnalyticsEvent('subscribe', 'Failure', 'reason', "Subscriber PeerConnection Error: " + reason);

            OT.handleJsException("Subscriber PeerConnection Error: " + reason, OT.ExceptionCodes.P2P_CONNECTION_FAILED, {
                session: _session,
                target: this
            });
            _showError.call(this, reason);
        },

        onRemoteStreamAdded = function(webOTStream) {
            OT.debug("OT.Subscriber.onRemoteStreamAdded");

            _state.set('BindingRemoteStream');

            // Disable the audio/video, if needed
            this.subscribeToAudio(_properties.subscribeToAudio);
            this.subscribeToVideo(_properties.subscribeToVideo);

            var streamElement = new OT.VideoElement();

            // Initialize the audio volume
            streamElement.setAudioVolume(_audioVolume);
            streamElement.on({
                    streamBound: onLoaded,
                    loadError: onPeerConnectionFailure,
                    error: onPeerConnectionFailure
                }, this);

            streamElement.bindToStream(webOTStream);
             _container.video = streamElement;

            OT.DOMComponentCleanup.add(this, streamElement);

            _streamContainer = streamElement;

            this.streamOrientationDidChange(_stream.orientation.width, _stream.orientation.height, _stream.orientation.videoOrientation);

            logAnalyticsEvent('createPeerConnection', 'StreamAdded', '', '');
            this.trigger('streamAdded', this);
        },

        onRemoteStreamRemoved = function(webOTStream) {
            OT.debug("OT.Subscriber.onStreamRemoved");

            if (_streamContainer.stream == webOTStream) {
                _streamContainer.destroy();
                _streamContainer = null;
            }


            this.trigger('streamRemoved', this);
        },

        /// Chrome

        updateChromeForStyleChange = function(key, value, oldValue) {
            if (!_chrome) return;

            switch(key) {
                case 'nameDisplayMode':
                    _chrome.name.setDisplayMode(value);
                    break;

                case 'buttonDisplayMode':
                    // _chrome.muteButton.setDisplayMode(value);
            }
        },

        _createChrome = function() {
            _chrome = new OT.Chrome({
                parent: _container.domElement
            }).set({
                name: new OT.Chrome.NamePanel({
                    name: _properties.name,
                    mode: this.getStyle('nameDisplayMode')
                }),

                // // Disabled until we can change the mic Volume through WebRTC
                // muteButton: new OT.Chrome.MicVolume({
                //     muted: false,
                //     mode: this.getStyle('buttonDisplayMode')
                // }),

                opentokButton: new OT.Chrome.OpenTokButton()
            }).on({
                muted: function() {
                    // @todo turn off audio on the web rtc stream
                },

                unmuted: function() {
                    // @todo turn on audio on the web rtc stream
                }
            });
        },

        _showError = function(errorMsg) {
            // Display the error message inside the container, assuming it's
            // been created by now.
            if (_container) _container.addError(errorMsg);
        };


    this.recordQOS = function() {
        recordQOS();
    };

    this.subscribe = function(stream) {
        OT.debug("OT.Subscriber: subscribe to " + stream.id);

        if (_state.subscribing) {
            // @todo error
            OT.error("OT.Subscriber.Subscribe: Cannot subscribe, already subscribing.");
            return false;
        }

        _state.set('Init');

        if (!stream) {
            // @todo error
            OT.error("OT.Subscriber: No stream parameter.");
            return false;
        }

        if (_stream) {
            // @todo error
            OT.error("OT.Subscriber: Already subscribed");
            return false;
        }

        _stream = stream;

        _fromConnectionId = stream.connection.connectionId;
        _properties.name = _stream.name;
        _properties.classNames = 'OT_root OT_subscriber';

        if (_properties.style) {
            this.setStyle(_properties.style, null, true);
        }
        if (_properties.audioVolume) {
            this.setAudioVolume(_properties.audioVolume);
        }

        _properties.subscribeToAudio = OT.$.castToBoolean(_properties.subscribeToAudio, true);
        _properties.subscribeToVideo = OT.$.castToBoolean(_properties.subscribeToVideo, true);

        _container = new OT.WidgetView(replaceElementId, _properties);
        _domId = _container.domId;

        _startConnectingTime = OT.$.now();

        if (_stream.connection.id !== _session.connection.id) {
            logAnalyticsEvent('createPeerConnection', 'Attempt', '', '');

            _state.set('ConnectingToPeer');

            _peerConnection = new OT.SubscriberPeerConnection(_stream.connection, _session, _stream, _properties);

            _peerConnection.on({
                disconnected: onDisconnected,
                error: onPeerConnectionFailure,
                remoteStreamAdded: onRemoteStreamAdded,
                remoteStreamRemoved: onRemoteStreamRemoved
            }, this);
        }
        else {
            // Subscribe to yourself edge-case
            onRemoteStreamAdded.call(this, _session.getPublisherForStream(_stream)._.webRtcStream);
        }

        logAnalyticsEvent('subscribe', 'Attempt', 'streamId', _stream.id);

        return this;
    };

    this.destroy = function() {
        OT.DOMComponentCleanup.remove(this);
        this.disconnect();

        if (_chrome) {
            _chrome.destroy();
            _chrome = null;
        }

        if (_container) {
            _container.destroy();
            _container = null;
        }

        if (_stream) logAnalyticsEvent('unsubscribe', null, 'streamId', _stream.id);

        _domId = null;
        _stream = null;

        clearInterval(_qosInterval);
        _session = null;
        _properties = null;

        this.trigger('destroyed', this);
        this.off();

        return this;
    };


    this.disconnect = function() {
        _state.set('NotSubscribing');

        if (_streamContainer) {
            _streamContainer.destroy();
            _streamContainer = null;
        }

        if (_peerConnection) {
            _peerConnection.destroy();
            _peerConnection = null;

            logAnalyticsEvent('disconnect', 'PeerConnection', 'streamId', _stream.id);
        }
    };

    this.processMessage = function(type, fromConnection, message) {
        OT.debug("OT.Subscriber.processMessage: Received " + type + " message from " + fromConnection.id);
        OT.debug(message);

        if (_fromConnectionId != fromConnection.id) {
            _fromConnectionId = fromConnection.id;
        }

        if (_peerConnection) {
          _peerConnection.processMessage(type, message);
        }
    };

    this.processVideoDisabled = function(quality) {
        this.subscribeToVideo(false);
        this.dispatchEvent(new OT.Event("videoDisabled"));
    };

    /**
    * Return the base-64-encoded string of PNG data representing the Subscriber video.
    *
    *  <p>You can use the string as the value for a data URL scheme passed to the src parameter of
    *  an image file, as in the following:</p>
    *
    *  <pre>
    *  var imgData = subscriber.getImgData();
    *
    *  var img = document.createElement("img");
    *  img.setAttribute("src", "data:image/png;base64," + imgData);
    *  var imgWin = window.open("about:blank", "Screenshot");
    *  imgWin.document.write("&lt;body&gt;&lt;/body&gt;");
    *  imgWin.document.body.appendChild(img);
    *  </pre>
    * @method #getImgData
    * @memberOf Subscriber
    * @return {String} The base-64 encoded string. Returns an empty string if there is no video.
    */
    this.getImgData = function() {
        if (!this.subscribing) {
            OT.error("OT.Subscriber.getImgData: Cannot getImgData before the Subscriber is subscribing.");
            return null;
        }

        return _streamContainer.imgData;
    };

    /**
    * Sets the audio volume, between 0 and 100, of the Subscriber.
    *
    * <p>You can set the initial volume when you call the <code>Session.subscribe()</code>
    * method. Pass a <code>audioVolume</code> property of the <code>properties</code> parameter
    * of the method.</p>
    *
    * @param {Number} value The audio volume, between 0 and 100.
    *
    * @return {Subscriber} The Subscriber object. This lets you chain method calls, as in the following:
    *
    * <pre>mySubscriber.setAudioVolume(50).setStyle(newStyle);</pre>
    *
    * @see <a href="#getAudioVolume">getAudioVolume()</a>
    * @see <a href="Session.html#subscribe">Session.subscribe()</a>
    * @method #setAudioVolume
    * @memberOf Subscriber
    */
    this.setAudioVolume = function(value) {
        value = parseInt(value, 10);
        if (isNaN(value)) {
            OT.error("OT.Subscriber.setAudioVolume: value should be an integer between 0 and 100");
            return this;
        }
        _audioVolume = Math.max(0, Math.min(100, value));
        if (_audioVolume != value) {
            OT.warn("OT.Subscriber.setAudioVolume: value should be an integer between 0 and 100");
        }
        if (_streamContainer) {
            _streamContainer.setAudioVolume(_audioVolume);
        }

        return this;
    };

    /**
    * Returns the audio volume, between 0 and 100, of the Subscriber.
    *
    * <p>Generally you use this method in conjunction with the <code>setAudioVolume()</code> method.</p>
    *
    * @return {Number} The audio volume, between 0 and 100, of the Subscriber.
    * @see <a href="#setAudioVolume">setAudioVolume()</a>
    * @method #getAudioVolume
    * @memberOf Subscriber
    */
    this.getAudioVolume = function() {
        if (_streamContainer) return _streamContainer.getAudioVolume();
        else return _audioVolume;
    };

    this.subscribeToAudio = function(p_value) {
        var value = OT.$.castToBoolean(p_value, true);

        if (_peerConnection) {
            _peerConnection.subscribeToAudio(value);

            if (_session && _stream && value !== _properties.subscribeToAudio) {
                _session.sendMessage(
                    OT.WebSocketMessage.modifySubscriber(_stream.streamId, "hasAudio", value)
                );
            }
        }

        _properties.subscribeToAudio = value;

        return this;
    };

    this.subscribeToVideo = function(p_value) {
        var value = OT.$.castToBoolean(p_value, true);

        if(_container) {
            _container.showPoster = !(value && _stream.hasVideo);
            if(value && _container.video) {
                _container.loading = value;
                _container.video.whenTimeIncrements(function(){
                    _container.loading = false;
                }, this);
            }
        }

        if (_peerConnection) {
            _peerConnection.subscribeToVideo(value);

            if (_session && _stream && value !== _properties.subscribeToVideo) {
                _session.sendMessage(
                    OT.WebSocketMessage.modifySubscriber(_stream.streamId, "hasVideo", value)
                );
            }
        }

        _properties.subscribeToVideo = value;

        return this;
    };

    this.streamOrientationDidChange = function(width, height, videoOrientation) {
        _streamContainer.orientation = videoOrientation;
    };

    this.streamHasVideoDidChange = function(hasVideo) {
        if(_container) {
            _container.showPoster = !(hasVideo && _properties.subscribeToVideo);
        }
    };

    this.streamHasAudioDidChange = function(hasAudio) {

    };

    Object.defineProperties(this, {
        id: {
            get: function() { return _domId; }
        },

        stream: {
            get: function() { return _stream; }
        },

        targetElement: {
            get: function() { return _streamContainer ? _streamContainer.domElement : null; }
        },

        subscribing: {
            get: function() { return _state.subscribing; }
        },

        isWebRTC: {
            get: function() { return true; }
        },

        loading: {
            get: function(){ return _container && _container.loading }
        }
    });

    this.on('styleValueChanged', updateChromeForStyleChange, this);

    _state = new OT.SubscribingState(stateChangeFailed);
};

})(window);

(function(window) {
    OT.SessionInfo = function(xmlDocument) {
        var sessionXML = null;

        this.sessionId = null;
        this.partnerId = null;
        this.sessionStatus = null;
        this.p2pEnabled = false;

        this.messagingServer = null;
        this.iceServers = null;

        OT.log("SessionInfo Response:")
        OT.log(xmlDocument);

        if (xmlDocument && xmlDocument.documentElement && xmlDocument.documentElement.firstElementChild !== null) {
            sessionXML = xmlDocument.documentElement.firstElementChild;
        }

        var element = sessionXML.firstElementChild;
        do {
            switch (element.localName) {
            case "session_id":
                this.sessionId = element.textContent;
                break;

            case "partner_id":
                this.partnerId = element.textContent;
                break;

            case "session_status":
                this.sessionStatus = element.textContent;
                break;

            case "messaging_server_url":
                this.messagingServer = element.textContent;
                break;

            case "ice_servers":
                // <ice_servers>
                //     <ice_server url="foo.com" />
                //     <ice_server url="bar.com" credential="xxx" />
                // </ice_servers>

                this.iceServers = [];

                var children = element.childNodes,
                    iceServer,
                    attributes;

                for (var i=0, numNodes=children.length; i<numNodes; ++i) {
                    if (children[i].localName === 'ice_server') {
                        // @todo parse either a URL node, or a URL and credentials
                        attributes = children[i].attributes;
                        iceServer = {
                            url: attributes.getNamedItem('url').nodeValue
                        };

                        if (attributes.getNamedItem('credential') && attributes.getNamedItem('credential').nodeValue.length) {
                            iceServer.credential = attributes.getNamedItem('credential').nodeValue;
                        }

                        this.iceServers.push(iceServer);
                    }
                }

                break;

            case "properties":
                var property = element.firstElementChild;
                if (property) {
                    do {
                        if (property.localName === "p2p" && property.firstElementChild !== null) {
                            this.p2pEnabled = (property.firstElementChild.textContent === "enabled");
                            break;
                        }
                    } while (property = property.nextElementSibling);
                }

                break;

            default:
                // OT.debug("OT.SessionInfo element was not handled (" + element.localName + ")");
                break;
            }

        } while (element = element.nextElementSibling);

        //we've parsed the XML into the object

        sessionXML = null;
    };


// Retrieves Session Info for +session+. The SessionInfo object will be passed
// to the +onSuccess+ callback. The +onFailure+ callback will be passed an error
// object and the DOMEvent that relates to the error.
OT.SessionInfo.get = function(session, onSuccess, onFailure) {
    var sessionInfoURL = OT.properties.apiURL + '/session/' + session.id + "?extended=true",

        startTime = OT.$.now(),

        validateRawSessionInfo = function(sessionInfo) {
            session.logEvent('Instrumentation', null, 'gsi', OT.$.now() - startTime);

            var error = parseErrorFromXMLDocument(sessionInfo);

            if (error === false) {
                onGetResponseCallback(session, onSuccess, sessionInfo);
            }
            else {
                onGetErrorCallback(session, onFailure, error);
            }
        };

    session.logEvent('getSessionInfo', 'Attempt', 'api_url', OT.properties.apiURL);

    OT.$.getXML(sessionInfoURL, {
        headers: {"X-TB-TOKEN-AUTH": session.token, "X-TB-VERSION": 1},

        success: validateRawSessionInfo,

        error: function(event) {
            onGetErrorCallback(session, onFailure, parseErrorFromXMLDocument(event.target.responseXML));
        }
    });
};

var messageServerToClientErrorCodes = {};
messageServerToClientErrorCodes['404'] = OT.ExceptionCodes.INVALID_SESSION_ID;
messageServerToClientErrorCodes['403'] = OT.ExceptionCodes.AUTHENTICATION_ERROR;

// Return the error in +xmlDocument+, if there is one. Otherwise it will return
// false.
parseErrorFromXMLDocument = function(xmlDocument) {
    if (xmlDocument && xmlDocument.documentElement && xmlDocument.documentElement.firstElementChild !== null) {
        var errorNodes = xmlDocument.evaluate('//error', xmlDocument.documentElement, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null ),
            numErrorNodes = errorNodes.snapshotLength;

        if (numErrorNodes === 0) return false;

        for (var i=0; i<numErrorNodes; ++i) {
            var errorNode = errorNodes.snapshotItem(i);

            return {
                code: errorNode.getAttribute('code'),
                message: errorNode.firstElementChild.getAttribute('message')
            };
        }
    }

    // There was an error, but we couldn't find the error info.
    return {
        code: null,
        message: "Unknown error: getSessionInfo XML response was badly formed"
    };
};

onGetResponseCallback = function(session, onSuccess, rawSessionInfo) {
  session.logEvent('getSessionInfo', 'Success', 'api_url', OT.properties.apiURL);

  onSuccess( new OT.SessionInfo(rawSessionInfo) );
};

onGetErrorCallback = function(session, onFailure, error) {
    TB.handleJsException("TB.SessionInfoError :: Unable to get session info " + error.message, messageServerToClientErrorCodes[error.code], {
        session: session
    });

    session.logEvent('getSessionInfo', 'Failure', 'errorMessage', "TB.SessionInfoError :: Unable to get session info " + error.message);
    onFailure(error, session);
};

})(window);
(function(window) {
	/**
	 * A class defining properties of the <code>capabilities</code> property of the
     * Session class. See <a href="Session.html#capabilites">Session.capabilites</a>.
	 *
	 * For more information on token roles, see the <a href="server_side_libraries.html#generate_token">generate_token()</a>
     * method of the OpenTok server-side libraries.
	 *
	 * @class Capabilities
	 *
	 * @property {Number} forceDisconnect Specifies whether you can call
     the <code>Session.forceDisconnect()</code> method (1) or not (0). To call the <code>Session.forceDisconnect()</code> method,
     the user must have a token that is assigned the role of moderator.
	 * @property {Number} forceUnpublish Specifies whether you can call
     the <code>Session.forceUnpublish()</code> method (1) or not (0). To call the <code>Session.forceUnpublish()</code> method,
     the user must have a token that is assigned the role of moderator.
	 * @property {Number} publish Specifies whether you can publish to the session (1) or not (0).
     The ability to publish is based on a few factors. To publish, the user must have a token that
     is assigned a role that supports publishing. There must be a connected camera and microphone.
	 * @property {Number} subscribe Specifies whether you can subscribe to streams
     in the session (1) or not (0). Currently, this capability is available for all users on all platforms.
	 * @property {Number} supportsWebRTC Whether the client supports WebRTC (1) or not (0).
	 */
	OT.Capabilities = function(permissions) {
	    this.publish = permissions.indexOf('publish') !== -1 ? 1 : 0;
	    this.subscribe = permissions.indexOf('subscribe') !== -1 ? 1 : 0;
	    this.forceUnpublish = permissions.indexOf('forceunpublish') !== -1 ? 1 : 0;
	    this.forceDisconnect = permissions.indexOf('forcedisconnect') !== -1 ? 1 : 0;
	    this.supportsWebRTC = OT.$.supportsWebRTC() ? 1 : 0;
    };

})(window);
(function(window) {

// Wraps up some common error handling for implementing callbacks
// for work requests made to the OT backend via the Messenger.
var RemoteWork = function RemoteWork (parent, success, error, options) {
  var REQUEST_TIMEOUT = 30000,
      timeoutInterval,
      exceptionCodesIndicatingFailure = {};

  var destroy = function() {
        clearTimeout(timeoutInterval);
        parent.off('exception', onException);
      },

      onException = function(event) {
        if (!exceptionCodesIndicatingFailure.hasOwnProperty(event.code)) return;

        // We don't even know if this relates to this particular forceDisconnct...
        this.failed(exceptionCodesIndicatingFailure[event.code]);
      },

      onTimeout = function() {
        var reason = options && options.timeoutMessage ? options.timeoutMessage : "Timed out while waiting for the server to respond.";
        this.failed(reason);
      };


  this.failsOnExceptionCodes = function(codes) {
    exceptionCodesIndicatingFailure = codes;
  };

  this.succeeded = function() {
    destroy();
    if (success) OT.$.callAsync(success);
  };

  this.failed = function(reason) {
    destroy();
    if (error) OT.$.callAsync(error, reason);
  };

  parent.on('exception', onException, this);
  timeoutInterval = setTimeout(onTimeout.bind(this), REQUEST_TIMEOUT);
};


/**
 * The Session object returned by the <code>TB.initSession()</code> method provides access to much of the OpenTok functionality.
 *
 * @class Session
 * @augments EventDispatcher
 *
 * @property {Capabilities} capabilities A {@link Capabilities} object that includes information about the capabilities of the client.
 * @property {Connection} connection The {@link Connection} object for this session. The connection property is only available once the
 * Session object dispatches the sessionConnected event. The Session object asynchronously dispatches a sessionConnected event in response
 * to a successful call to the connect() method. See: <a href="Session#connect">connect</a> and {@link Connection}.
 * @property {String} sessionId The session ID for this session. You pass this value into the <code>TB.initSession()</code> method when you create
 * the Session object. (Note: a Session object is not connected to the TokBox server until you
 * call the connect() method of the object and the object dispatches a connected event. See {@link TB.initSession} and {@link connect}).
 * 	For more information on sessions and session IDs, see
 * <a href="http://www.tokbox.com/opentok/api/tools/documentation/overview/session_creation.html">Session creation</a>.
 */
OT.Session = function(sessionId) {
  // Check that the client meets the minimum requirements, if they don't the upgrade
  // flow will be triggered.
  if (!OT.checkSystemRequirements()) {
      OT.upgradeSystemRequirements();
      return;
  }

  var _stream,
      _connected = false,
      _initialConnection = true,
      _connecting = false,
      _connectionId,
      _publishers = {},
      _subscribers = {},
      _streams = {},
      _apiKey,
      _token,
      _sessionId = sessionId,
      _sessionInfoSuccess = false,
      _messenger,
      _capabilities = {},
      _widgetId = uuid(),
      _publisherCleanupEvents = {},
      _analytics = new OT.Analytics(),
      _wrangler = new OT.SessionMessageWrangler(sessionId),
      _callbacks = {
        forceDisconnect: {},
        forceUnpublish: {}
      };


  OT.$.eventing(this);

  function getPublisherByStreamId(streamId) {
    for (var id in _publishers) {
      var publisher = _publishers[id];

      if (streamId === publisher.streamId) {
          return publisher;
      }
    }

    return null;
  }

  function validConnectionOnStream (stream) {
      if (!stream.connection || !_wrangler.connections[stream.connection.connectionId]) {
          OT.warn("Received a stream for a connection that doesn't exist");
          OT.debug(stream);
          return false;
      }
      return true;
  }

  function getStream(streamId) {
    return _streams[streamId];
  }

  function addStreams(streams) {
    streams.forEach(addStream);
  }

  function addStream(stream) {
    _streams[stream.id] = stream;
  }

  function removeStream(streamId) {
    delete _streams[streamId];
  }

  function updateStreamProperty(streamId, key, newValue) {
    var stream = getStream(streamId),
        oldValue = stream[key];

    stream.update(key, newValue);
    return oldValue;
  }


	//--------------------------------------
	//  MESSAGE HANDLERS
	//--------------------------------------

	var
	sessionConnectedHandler = function(packet) {

		_connected = true;
        _connecting = false;
		_connectionId = packet.connectionId;
		_capabilities = new OT.Capabilities(packet.permissions);

    // Reject any streams that are against connections that we don't recognise,
    // or ones that the user shouldn't be notified about.
    packet.streams = packet.streams.filter(function(stream){
      return validConnectionOnStream(stream);
    });

    addStreams(packet.streams);

    this.dispatchEvent(new OT.SessionConnectEvent(
      OT.Event.names.SESSION_CONNECTED,
      packet.connections,
      packet.streams,
      packet.archives
    ));
	},

  // The duplication of this and sessionConnectionFailed will go away when
  // session and messenger are refactored
  sessionConnectFailed = function(reason, code) {
    _connected = false;
    _connecting = false;

    OT.error(reason);

    this.trigger('sessionConnectFailed', reason);

    TB.handleJsException(reason, code || OT.ExceptionCodes.CONNECT_FAILED, {
      session: this
    });
  },

	sessionConnectionFailed = function(packet) {
    var reason,
        code;

    switch (packet.code) {
      case 409:
        reason = "TB.SessionConnectionFailed :: The P2P session already has two participants.";
        code = OT.ExceptionCodes.CONNECT_REJECTED;

        break;

      case 410:
        reason = "TB.SessionConnectionFailed :: The session already has four participants.";
        code = OT.ExceptionCodes.CONNECT_REJECTED;

        break;

      default:
        reason = "TB.SessionConnectionFailed :: The session failed to connect.";

        break;
    }

    sessionConnectFailed.call(this, reason, code);
	},

	exceptionHandler = function(message, code) {
    // if we received an exception while we were attempting to connect
    // let them know
    if (_connecting) {
      sessionConnectFailed.call(this, message);
    }
    else {
      TB.handleJsException(message, code, {
        session: this
      });
    }
	},

	sessionDisconnectedHandler = function(packet) {
		var event = new OT.SessionDisconnectEvent('sessionDisconnected', packet.reason);

    reset.call(this);
    disconnectComponents.call(this);

		var defaultAction = function() {
      if (!event.isDefaultPrevented()) destroyComponents.call(this);
		}.bind(this);

		this.dispatchEvent(event, defaultAction);
	},

  connectionCreatedHandler = function(packet) {
      packet.connections = [packet.connection];
      delete packet.connection;

      this.dispatchEvent(new OT.ConnectionEvent(
          OT.Event.names.CONNECTION_CREATED,
          packet.connections
      ));
  },

	connectionDestroyedHandler = function(packet) {
    // Don't delete the connection if it's ours. This only happens when
    // we're about to receive a session disconnected and session disconnected
    // will also clean up our connection.
    if (_connectionId !== packet.connection.connectionId) {
      delete _wrangler.connections[packet.connection.connectionId];
    }

    // Cleanup any subscribers from this connection
    for (var guid in _publishers) {
      _publishers[guid].cleanupSubscriber(packet.connection.connectionId);
    }

    // Handle success callbacks
    if (_callbacks.forceDisconnect[packet.connection.connectionId]) {
      var callback = _callbacks.forceDisconnect[packet.connection.connectionId];
      delete _callbacks.forceDisconnect[packet.connection.connectionId];


      if (packet.reason !== 'forceDisconnected') {
        OT.warn("Expected a forceDisconnect for connection " + packet.connection.connectionId + ", but a regular connection destroy was received instead.");
      }

      callback.succeeded();
    }

    packet.connections = [packet.connection];
    delete packet.connection;

    this.dispatchEvent(
      new OT.ConnectionEvent(
        OT.Event.names.CONNECTION_DESTROYED,
        packet.connections,
        packet.reason
      )
    );
	},

  // This is notification that one or more streams that relate to our publishers
  // have been created.
  streamRegisteredHandler = function(packet) {
    OT.debug(packet.streams);
    if (packet.streams.length === 0) return;

    addStreams(packet.streams);

    var publisher;

    packet.streams.forEach(function(stream) {
      // If this is one of our streams, add it to whichever publisher
      if (stream.publisherId) {
        publisher = _publishers[stream.publisherId];
        delete stream.publisherId;
      }
      else {
        publisher = this.getPublisherForStream(stream.id);
      }

      if (publisher) {
        publisher._.streamRegisteredHandler(stream);
      }
    });
  },

  streamCreatedHandler = function(packet) {
    // Reject any streams that are against connections that we don't recognise,
    // or ones that the user shouldn't be notified about.
    packet.streams = packet.streams.filter(validConnectionOnStream);

    OT.debug(packet.streams);

    if (packet.streams.length > 0) {
        addStreams(packet.streams);

        this.dispatchEvent(new OT.StreamEvent(
          OT.Event.names.STREAM_CREATED,
          packet.streams,
          packet.reason
        ));
    }
  },

  streamPropertyModifiedHandler = function(packet) {
    OT.debug(packet);

    var propertyKeyToPropertyName = {
      orientation: 'videoDimensions',
      hasAudio: 'hasAudio',
      hasVideo: 'hasVideo'
    };

    var key = packet.key.split("/"),
        stream = getStream(packet.streamId),
        subscriber = _subscribers[packet.streamId],
        propertyName,
        eventPayload,
        newValue = packet.value,
        oldValue;

    key = key.length > 0 ? key[key.length-1] : null;

    if (!key || !propertyKeyToPropertyName[key]) {
      OT.warn("Unknown stream property was modified.");
      return;
    }

    propertyName = propertyKeyToPropertyName[key];
    oldValue = updateStreamProperty(packet.streamId, propertyName, packet.value);

    if (key === 'orientation') {
        if (subscriber) {
          subscriber.streamOrientationDidChange(packet.value.width, packet.value.height, packet.value.videoOrientation);
        }

        newValue = {width: newValue.width, height: newValue.height};
    } else if (key === 'hasVideo' || key === 'hasAudio') {
        if (subscriber) {
            if (key === 'hasVideo') {
                subscriber.streamHasVideoDidChange(packet.value);
            } else if (key === 'hasAudio') {
                subscriber.streamHasAudioDidChange(packet.value);
            }
        }
    }

    this.dispatchEvent(new OT.StreamPropertyChangedEvent(
      OT.Event.names.STREAM_PROPERTY_CHANGED,
      stream,
      propertyName,
      oldValue,
      newValue
    ));
  },

	streamDestroyedHandler = function(packet) {
    if (packet.streams.length <= 0) return;

    // Reject any streams that are against connections that we don't recognise.
    packet.streams = packet.streams.filter(function(stream){
      return validConnectionOnStream(stream);
    });

    packet.streams.forEach(function(stream) {
      // Handle success callbacks
      if (_callbacks.forceUnpublish[stream.id]) {
        var callback = _callbacks.forceUnpublish[stream.id];
        delete _callbacks.forceUnpublish[stream.id];

        if (packet.reason !== 'forceUnpublished') {
          OT.warn("Expected a forceUnpublish for stream " + stream.id + ", but a regular stream destroyed was received instead.");
        }

        callback.succeeded();
      }
    });

    var event = new OT.StreamEvent('streamDestroyed', packet.streams, packet.reason);

    var defaultAction = function() {
      var doDefault = !event.isDefaultPrevented();

      packet.streams.forEach(function(stream) {
        // If the stream is one of ours then we need to cleanup
        // a publisher.
        var publisher = getPublisherByStreamId(stream.id);
        if (publisher) {
          publisher.disconnect();
          if (doDefault) {
            destroyPublisher(publisher);
          }
          delete _publishers[publisher.guid];
        }

        // If we are subscribed to any of the streams we should unsubscribe
        for (var streamId in _subscribers) {
          if (streamId === stream.id) {
            var subscriber = _subscribers[streamId];
            subscriber.disconnect();
            if (doDefault) this.unsubscribe(subscriber);
            delete _subscribers[streamId];
          }
        }

        removeStream(stream.id);
      }, this);
		}.bind(this);

		this.dispatchEvent(event, defaultAction);
	},


	jsepMessageHandler = function(packet) {
    OT.log("jsepMessageHandler: " + JSON.stringify(packet));

		if (!_wrangler.connections[packet.fromAddress]) {
			OT.warn("OT.Session.onMessage: Received peerConnectionData from an unknown connection.");
//			return;
			_wrangler.connections[packet.fromAddress] = new OT.Connection(packet.fromAddress, new Date(), null, { supportsWebRTC : true });
		}

    if (packet.hasOwnProperty('streamId')) {
        var actor = null;

        if (packet.type == OT.WebSocketMessageType.JSEP_SUBSCRIBE || packet.type == OT.WebSocketMessageType.JSEP_UNSUBSCRIBE) {
            actor = getPublisherByStreamId(packet.streamId, true);
        } else {
            actor = getPublisherByStreamId(packet.streamId, true) || _subscribers[packet.streamId];
        }

        if (!actor) {
            OT.warn("OT.Session.onMessage: Received peerConnectionData for an unknown publisher.");
            return;
        }

        actor.processMessage(packet.type, _wrangler.connections[packet.fromAddress], packet);
    }
	},

  // session.on("signal", function(SignalEvent))
  // session.on("signal:{type}", function(SignalEvent))
  signalHandler = function(packet) {
    var fromConnection = _wrangler.connections[packet.fromAddress] || new OT.Connection(packet.fromAddress, OT.$.now(), null, {}),
        data = packet.messagePayload.data,
        event = new OT.SignalEvent(packet.messagePayload.type, data, fromConnection);

    event.target = this;

    // signal a "signal" event
    // NOTE: trigger doesn't support defaultAction, and therefore preventDefault.
    this.trigger(OT.Event.names.SIGNAL, event);

    // signal an "signal:{type}" event" if there was a custom type
    if (packet.messagePayload.type) this.dispatchEvent(event);
  },

  subscriberVideoDisabledHandler = function(packet) {
      var subscriber = _subscribers[packet.streamId];
      subscriber.processVideoDisabled();
  },

	// Put ourselves into a pristine state
	reset = function() {
    _apiKey = null;
    _token = null;
    _connectionId = null;
    _connected = false;
    _capabilities = null;

    _wrangler.connections = {};
    _streams = {};
	},

  disconnectComponents = function() {
    for (var guid in _publishers) {
      _publishers[guid].disconnect();
    }

    for (var streamId in _subscribers) {
      _subscribers[streamId].disconnect();
    }
  },

  destroyPublisher = function(publisher) {
      if (_publisherCleanupEvents[publisher.guid]) {
        publisher.off('destroyed', _publisherCleanupEvents[publisher.guid]);
        delete _publisherCleanupEvents[publisher.guid];
      }

      publisher.destroy();
  },

  destroyComponents = function() {
    for (var guid in _publishers) {
      destroyPublisher(_publishers[guid]);
    }
    _publishers = {};
    _publisherCleanupEvents = {};

    for (var streamId in _subscribers) {
      _subscribers[streamId].destroy();
    }
    _subscribers = {};
  },

  // Make sure we do any final clean up in the session if the
  // publisher is destroyed.
  cleanupPublisherOnDestroy = function(publisher) {
    _publisherCleanupEvents[publisher.guid] = function() {
      this.unpublish(publisher);
    }.bind(this);

    publisher.on('destroyed', _publisherCleanupEvents[publisher.guid]);
  },


	connectMessenger = function() {
    TB.log("connectToMessenger");

    this.properties = { requireConnectionObjects: true };

    _messenger = new OT.Messenger(
      this.sessionInfo.messagingServer,
      _wrangler
    ).on({
        SessionConnected: sessionConnectedHandler,
        SessionConnectFailed: sessionConnectionFailed,
        ConnectionClosed: sessionDisconnectedHandler,
        ConnectionCreated: connectionCreatedHandler,
        ConnectionDestroyed: connectionDestroyedHandler,
        StreamRegistered: streamRegisteredHandler,
        StreamCreated: streamCreatedHandler,
        StreamModified: streamPropertyModifiedHandler,
        StreamDestroyed: streamDestroyedHandler,
        JSEPMessageReceived: jsepMessageHandler,
        SignalReceived: signalHandler,
        SubscriberVideoDisabled: subscriberVideoDisabledHandler,
        exception: exceptionHandler
    }, this);

    _messenger.connect(_sessionId, _token,{
      requireConnectionObjects: this.properties.requireConnectionObjects,
      p2pEnabled: this.sessionInfo.p2pEnabled,
      widgetId: _widgetId,
      partnerId: _apiKey
    });
	},

  getSessionInfo = function() {
    if (_connecting) {
      OT.SessionInfo.get(
        this,
        onSessionInfoResponse.bind(this),
        function(error) {
          sessionConnectFailed.call(this, error.message + (error.code ? ' (' + error.code + ')' : ''));
        }.bind(this)
      );
    }
  },

  onSessionInfoResponse = function(sessionInfo) {
    if (_connecting) {
      this.sessionInfo = sessionInfo;
      if (this.sessionInfo.partnerId && this.sessionInfo.partnerId != _apiKey) {
          _apiKey = this.sessionInfo.partnerId;

          var reason = "Authentication Error: The apiKey passed into the session.connect method does not match the apiKey in the token or session you are trying to connect to.";
          sessionConnectFailed.call(this, reason, OT.ExceptionCodes.AUTHENTICATION_ERROR);
      } else {
          connectMessenger.call(this);
      }
    }
  },

  // Check whether we have permissions to perform the action.
  permittedTo = function(action) {
      return _capabilities[action] === 1;
  };


  this.logEvent = function(action, variation, payload_type, payload) {
    _analytics.logEvent({
      action: action,
      variation: variation,
      payload_type: payload_type,
      payload: payload,
      session_id: _sessionId,
      partner_id: _apiKey,
      widget_id: _widgetId,
      widget_type: 'Controller'
    });
  };

 /**
 * Connects to an OpenTok session. Pass your API key as the <code>apiKey</code> parameter. You get an API key when you
 * <a href="https://dashboard.tokbox.com/users/sign_in">sign up</a> for an OpenTok account. Pass a token string as
 * the <code>token</code> parameter. You generate a token using the
 * <a href="/opentok/api/tools/documentation/api/server_side_libraries.html">OpenTok server-side libraries</a>
 * or the <a href="https://dashboard.tokbox.com/projects">Dashboard</a> page. For more information, see
 * <a href="/opentok/api/tools/js/documentation/overview/token_creation.html">Connection token creation</a>.
 *  <p>
 *  	Upon a successful connection, the Session object dispatches a <code>sessionConnected</code> event. Call the
 * <code>addEventListener()</code> method to set up an event listener to process this event before calling other methods of the Session object.
 *  </p>
 *  <p>
 *  	The Session object dispatches a <code>connectionCreated</code> event when other clients create connections to the session.
 *  </p>
 *  <p>
 *  	The TB object dispatches an <code>exception</code> event if the session ID,
 *    API key, or token string are invalid. See <a href="ExceptionEvent.html">ExceptionEvent</a>
 *    and <a href="TB.html#addEventListener">TB.addEventListener()</a>.
 *  </p>
 *  <p>
 *  	The application throws an error if the system requirements are not met
 *    (see <a href="TB.html#checkSystemRequirements">TB.checkSystemRequirements()</a>).
 *  	The application also throws an error if the session has peer-to-peer streaming enabled
 *  	and two clients are already connected to the session (see the
 *  	<a href="server_side_libraries.html">OpenTok server-side libraries reference</a>).
 *  </p>
 *
 * <p>
 * 	With the peer-to-peer option enabled for a session, the session supports two connections. Without the peer-to-peer option
 * 	enabled, the session supports up to four connections. On clients that attempt to a session that already has the maximum
 * 	number of connections, the TB object dispatches an `exception` event (with the `code` property set to 1007). See
 * 	<a href="http://www.tokbox.com/opentok/api/tools/js/documentation/overview/session_creation.html">Session Creation documentation</a>.
 * </p>
 *
 *
 *  <h5>
 *  Example
 *  </h5>
 *  <p>
 *  The following code initializes a session and sets up an event listener for when the session connects:
 *  </p>
 *  <pre>
 *  var apiKey = ""; // Replace with your API key. See https://dashboard.tokbox.com/projects
 *  var sessionID = ""; // Replace with your own session ID.
 *                      // See https://dashboard.tokbox.com/projects
 *  var token = ""; // Replace with a generated token that has been assigned the moderator role.
 *                  // See https://dashboard.tokbox.com/projects
 *
 *  var session = TB.initSession(sessionID);
 *  session.addEventListener("sessionConnected", sessionConnectHandler);
 *  session.connect(apiKey, token);
 *
 *  function sessionConnectHandler(sessionConnectEvent) {
 *      //
 *  }
 *  </pre>
 *  <p>
 *  <p>
 *  	In this example, the <code>sessionConnectHandler()</code> function is passed an event object of type {@link SessionConnectEvent}.
 *  </p>
 *
 *  <h5>
 *  Events dispatched:
 *  </h5>
 *
 *  <p>
 *  	<code>exception</code> (<a href="ExceptionEvent.html">ExceptionEvent</a>) &#151; Dispatched by the TB class
 *  	locally in the event of an error.
 *  </p>
 *  <p>
 *  	<code>connectionCreated</code> (<a href="ConnectionEvent.html">ConnectionEvent</a>) &#151;
 *      Dispatched by the Session object on all clients connected to the session.
 *  </p>
 *  <p>
 *  	<code>sessionConnected</code> (<a href="SessionConnectEvent.html">SessionConnectEvent</a>) &#151;
 *      Dispatched locally by the Session object when the connection is established.
 *  </p>
 *
  * @param {String} apiKey The API key that TokBox provided you when you registered for the OpenTok API.
  *
  * @param {String} token The session token. You generate a session token using the
  * <a href="/opentok/api/tools/documentation/api/server_side_libraries.html">
  * OpenTok server-side libraries</a> or the
  * <a href="https://dashboard.tokbox.com/projects">Dashboard</a> page. For more information, see
  * <a href="/opentok/api/tools/js/documentation/overview/token_creation.html">Connection token creation</a>.
  *
  * @method #connect
  * @memberOf Session
  */
  this.connect = function(apiKey, token, properties) {
    if (_connected) {
      OT.warn("OT.Session: Cannot connect, already connected.");
      return;
    }

    if (_connecting) {
      OT.warn("OT.Session: Cannot connect, already connecting.");
      return;
    }

    _connecting = true;

    // Get a new widget ID when reconnecting.
    if (_initialConnection) {
      _initialConnection = false;
    } else {
        widgetId = uuid();
    }

    reset.call(this);

    _apiKey = apiKey.toString();

    // Ugly hack, make sure OT.APIKEY is set
    if (OT.APIKEY.length === 0) {
        OT.APIKEY = _apiKey;
    }

    _token = token;

    if (properties && properties.success) this.once(OT.Event.names.SESSION_CONNECTED, properties.success);
    if (properties && properties.error) this.once('sessionConnectFailed', properties.error);

    getSessionInfo.call(this);
  };

 /**
  * Disconnects from the OpenTok session.
  *
  * <p>
  * Calling the <code>disconnect()</code> method ends your connection with the session. In the course of terminating your connection,
  * it also ceases publishing any stream(s) you were publishing.
  * </p>
  * <p>
  * Session objects on remote clients dispatch <code>streamDestroyed</code> events for any stream you were publishing.
  * The Session object dispatches a <code>sessionDisconnected</code> event locally. The Session objects on remote clients dispatch
  * <code>connectionDestroyed</code> events, letting other connections know you have left the session. The {@link SessionDisconnectEvent}
  * and {@link StreamEvent} objects that define the <code>sessionDisconnect</code> and <code>connectionDestroyed</code> events each have
  * a <code>reason</code> property. The <code>reason</code> property lets the developer determine whether the connection is being
  * terminated voluntarily and whether any streams are being destroyed as a byproduct of the underlying connection's voluntary destruction.
  * </p>
  * <p>
  * If the session is not currently connected, calling this method causes a warning to be logged.
  * See <a "href=TB.html#setLogLevel">TB.setLogLevel()</a>.
  * </p>
  *
  * <p>
  * <i>Note:</i> If you intend to reuse a Publisher object created using <code>TB.initPublisher()</code>
  * to publish to different sessions sequentially, call either <code>Session.disconnect()</code> or
  * <code>Session.unpublish()</code>. Do not call both. Then call the <code>preventDefault()</code> method
  * of the <code>streamDestroyed</code> or <code>sessionDisconnected</code> event object to prevent the
  * Publisher object from being removed from the page. Be sure to call <code>preventDefault()</code> only
  * if the <code>connection.connectionId</code> property of the Stream object in the event matches the
  * <code>connection.connectionId</code> property of your Session object (to ensure that you are preventing
  * the default behavior for your published streams, not for other streams that you subscribe to).
  * </p>
  *
  * <h5>
  * Events dispatched:
  * </h5>
  * <p>
  * <code>sessionDisconnected</code> (<a href="SessionDisconnectEvent.html">SessionDisconnectEvent</a>)
  * &#151; Dispatched locally when the connection is disconnected.
  * </p>
  * <p>
  * <code>connectionDestroyed</code> (<a href="ConnectionEvent.html">ConnectionEvent</a>) &#151;
  * Dispatched on other connections, along with the <code>streamDestroyed</code> event (as warranted).
  * </p>
  *
  * <p>
  * <code>streamDestroyed</code> (<a href="StreamEvent.html">StreamEvent</a>) &#151;
  * Dispatched if streams are lost as a result of the session disconnecting.
  * </p>
  *
  * @method #disconnect
  * @memberOf Session
  */
  this.disconnect = function() {
    _connecting = false;

    if (_messenger) {
      _messenger.disconnect();
      _messenger = null;
      _sessionInfoSuccess = false;
    }
  };

 /**
  * The <code>publish()</code> method starts publishing an audio-video stream to the session.
  * The audio-video stream is captured from a local microphone and webcam. Upon successful publishing,
  * the Session objects on all connected clients dispatch the <code>streamCreated</code> event.
  * </p>
  *
  * <!--JS-ONLY-->
  * <p>You pass a Publisher object as the one parameter of the method. You can initialize a Publisher object by calling the
  * <a href="TB.html#initPublisher">TB.initPublisher()</a> method. Before calling <code>Session.publish()</code>.
  * </p>
  *
  * <p>This method takes an alternate form: <code>publish([replaceElementId:String, properties:Object]):Publisher</code> &#151;
  * In this form, you do <i>not</i> pass a Publisher object into the function. Instead, you pass in a <code>replaceElementId</code>
  * (the ID of the DOM element that the Publisher will replace) and a <code>properties</code> object that defines
  * options for the Publisher (see <a href="TB.html#initPublisher">TB.initPublisher()</a>.) The method
  * returns a new Publisher object, which starts sending an audio-video stream to the session.
  * The remainder of this documentation describes the form that takes a single Publisher object as a parameter.
  *
  * <p>
  * 	A local display of the published stream is created on the web page by replacing
  *         the specified element in the DOM with a streaming video display. The video stream
  *         is automatically mirrored horizontally so that users see themselves and movement
  *         in their stream in a natural way. If the width and height of the display do not match
  *         the 4:3 aspect ratio of the video signal, the video stream is cropped to fit the display.
  * </p>
  *
  * <p>
  * 	If calling this method creates a new Publisher object and the OpenTok library does not have access to
  * 	the camera or microphone, the web page alerts the user to grant access to the camera and microphone.
  * </p>
  *
  * <p>
  * The TB object dispatches an <code>exception</code> event if the user's role does not
  * include permissions required to publish. For example, if the user's role is set to subscriber,
  * then they cannot publish. You define a user's role when you create the user token using the <code>generate_token()</code> method
  * of the <a href="/opentok/api/tools/documentation/api/server_side_libraries.html">OpenTok
  * server-side libraries</a> or the <a href="https://dashboard.tokbox.com/projects">Dashboard</a> page.
  * You pass the token string as a parameter of the <code>connect()</code> method of the Session object.
  * See <a href="ExceptionEvent.html">ExceptionEvent</a> and <a href="TB.html#addEventListener">TB.addEventListener()</a>.
  * </p>
  *     <p>
  *     The application throws an error if the session is not connected.
  *     </p>
  *
  * <h5>Events dispatched:</h5>
  * <p>
  * <code>exception</code> (<a href="ExceptionEvent.html">ExceptionEvent</a>) &#151; Dispatched by the TB object. This
  * can occur when user's role does not allow publishing (the <code>code</code> property of event object is set to 1500);
  * it can also occur if the connection fails to connect (the <code>code</code> property of event object is set to 1013).
  * WebRTC is a peer-to-peer protocol, and it is possible that connections will fail to connect. The most common cause
  * for failure is a firewall that the protocol cannot traverse.</li>
  * </p>
  * <p>
  * <code>streamCreated</code> (<a href="StreamEvent.html">StreamEvent</a>) &#151;
  * The stream has been published. The Session object dispatches this on all clients
  * subscribed to the stream, as well as on the publisher's client.
  * </p>
  *
  * <h5>Example</h5>
  *
  * <p>
  * 	The following example publishes a video once the session connects:
  * </p>
  * <pre>
  * var apiKey = ""; // Replace with your API key. See https://dashboard.tokbox.com/projects
  * var sessionId = ""; // Replace with your own session ID.
  *                     // See https://dashboard.tokbox.com/projects
  * var token = ""; // Replace with a generated token that has been assigned the moderator role.
  *                 // See https://dashboard.tokbox.com/projects
  * var session = TB.initSession(sessionID);
  * session.addEventListener("sessionConnected", sessionConnectHandler);
  * session.connect(apiKey, token);
  *
  * function sessionConnectHandler(event) {
  *     var divProps = {width: 400, height:300, name:"Bob's stream"};
  *     publisher = TB.initPublisher(apiKey, 'publisher', divProps);
  *                       // This assumes that there is a DOM element with the ID 'publisher'.
  *     session.publish(publisher);
  * }
  * </pre>
  *
  * @param publisher A Publisher object, which you initialize by calling the <a href="TB.html#initPublisher">TB.initPublisher()</a>
  * method.
  *
  * @returns The Publisher object for this stream.
  *
  * @method #publish
  * @memberOf Session
  */
  this.publish = function(publisher, properties) {
    var errorMsg,
        success;

    if (properties && properties.success) {
      success = properties.success;
      delete properties.success;
    }


    if (!_connected) {
      _analytics.logError(1010, 'tb.exception', "We need to be connected before you can publish", null, {
        action: 'publish',
        variation: 'Failure',
        payload_type: "reason",
        payload: "We need to be connected before you can publish",
        session_id: _sessionId,
        partner_id: _apiKey,
        widgetId: _widgetId,
        widget_type: 'Controller'
      });

      errorMsg = "We need to be connected before you can publish";
      OT.error(errorMsg);
      throw new Error(errorMsg);
    }

    if (!permittedTo("publish")) {
      _analytics.logEvent({
        action: 'publish',
        variation: 'Failure',
        payload_type: "reason",
        payload: "This token does not allow publishing. The role must be at least `publisher` to enable this functionality",
        session_id: _sessionId,
        partner_id: _apiKey,
        widgetId: _widgetId,
        widget_type: 'Controller'
      });

      TB.handleJsException("This token does not allow publishing. The role must be at least `publisher` to enable this functionality", OT.ExceptionCodes.UNABLE_TO_PUBLISH, {
        session: this
      });
      return null;
    }

    // If the user has passed in an ID of a element then we create a new publisher.
    if (!publisher || typeof(publisher)==='string'){
      // Initiate a new Publisher with the new session credentials
     publisher = OT.initPublisher(this.apiKey, publisher, properties);
    }
    else if (publisher instanceof OT.Publisher){

      // If the publisher already has a session attached to it we can
      if( "session" in publisher && publisher.session && "sessionId" in publisher.session ){
        // send a warning message that we can't publish again.
        if( publisher.session.sessionId === this.sessionId){
          OT.warn("Cannot publish " + publisher.guid + " again to " + this.sessionId + ". Please call session.unpublish(publisher) first.");
        }
        else {
          OT.warn("Cannot publish " + publisher.guid + " publisher already attached to " + publisher.session.sessionId+ ". Please call session.unpublish(publisher) first.");
        }
      }

      if (properties && properties.error) {
        publisher.off('publishError', properties.error);
        publisher.once('publishError', properties.error);
      }
    }
    else {
      errorMsg = "Session.publish :: First parameter passed in is neither a string nor an instance of the Publisher";
      OT.error(errorMsg);
      throw new Error(errorMsg);
    }

    if (success) publisher.once('publishSuccess', success);

    // Add publisher reference to the session
    _publishers[publisher.guid] = publisher;
    publisher._.publishToSession(this);

    cleanupPublisherOnDestroy.call(this, publisher);

    // return the embed publisher
    return publisher;
  };

 /**
  * Ceases publishing the specified publisher's audio-video stream
  * to the session. By default, the local representation of the audio-video stream is removed from the
  * web page.< Upon successful termination, the Session object on every connected
  * web page dispatches
  * a <code>streamDestroyed</code> event.
  * </p>
  *
  * <p>
  * To prevent the Publisher from being removed from the DOM, add an event listener for the
  * <code>streamDestroyed</code> event and call the <code>preventDefault()</code> method of the event object.
  * </p>
  *
  * <p>
  * <i>Note:</i> If you intend to reuse a Publisher object created using <code>TB.initPublisher()</code>
  * to publish to different sessions sequentially, call either <code>Session.disconnect()</code> or
  * <code>Session.unpublish()</code>. Do not call both. Then call the <code>preventDefault()</code> method
  * of the <code>streamDestroyed</code> or <code>sessionDisconnected</code> event object to prevent the
  * Publisher object from being removed from the page. Be sure to call <code>preventDefault()</code> only
  * if the <code>connection.connectionId</code> property of the Stream object in the event matches the
  * <code>connection.connectionId</code> property of your Session object (to ensure that you are preventing
  * the default behavior for your published streams, not for other streams that you subscribe to).
  * </p>
  *
  * <h5>Events dispatched:</h5>
  *
  * <p>
  * <code>streamDestroyed</code> (<a href="StreamEvent.html">StreamEvent</a>) &#151;
  * The stream associated with the Publisher has been destroyed. Dispatched on
  * the Publisher's browser and on the browser for all connections subscribing
  * to the publisher's stream.
  *                </p>
  *
  * <h5>Example</h5>
  *
  * The following example publishes a stream to a session and adds a Disconnect link to the web page. Clicking this link causes the stream to stop being published.
  *
  * <pre>
  * &lt;script&gt;
  *     var apiKey = ""; // Replace with your API key. See https://dashboard.tokbox.com/projects
  *     var sessionID = ""; // Replace with your own session ID.
  *                      // See https://dashboard.tokbox.com/projects
  *     var token = "Replace with the TokBox token string provided to you."
  *     var session = TB.initSession(sessionID);
  *     session.addEventListener("sessionConnected", sessionConnectHandler);
  *     session.connect(apiKey, token);
  *     var publisher;
  *
  *     function sessionConnectHandler(event) {
  *         publisher = TB.initPublisher(apiKey, 'publisher');
  *                         // This assumes that there is a DOM element with the ID 'publisher'.
  *         session.publish(publisher);
  *     }
  *     function unpublsh() {
  *         session.unpublish(publisher);
  *     }
  * &lt;/script&gt;
  *
  * &lt;body&gt;
  *
  *     &lt;div id="publisherContainer/&gt;
  *     &lt;br/&gt;
  *
  *     &lt;a href="javascript:unpublish()"&gt;Stop Publishing&lt;/a&gt;
  *
  * &lt;/body&gt;
  *
  * </pre>
  *
  * @see <a href="#publish">publish()</a>
  *
  * @see <a href="StreamEvent.html">streamDestroyed event</a>
  *
  * @param {Publisher} publisher</span> The Publisher object to stop streaming.
  *
  * @method #unpublish
  * @memberOf Session
  */
  this.unpublish = function(publisher) {
    if (!publisher) {
      OT.error('OT.Session.unpublish: publisher parameter missing.');
      return;
    }

    // Unpublish the localMedia publisher
    publisher._.unpublishFromSession(this);
  };

  this.modifyStream = function(streamId, key, value) {

    if (!streamId || !key || !value) {
      OT.error('OT.Session.modifyStream: must provide streamId, key and value to modify a stream property.');
    }

    _messenger.sendMessage(OT.WebSocketMessage.modifyStream(streamId, key, value));
  };

 /**
  * Subscribes to a stream that is available to the session. You can get an array of
  * available streams from the <code>streams</code> property of the <code>sessionConnected</code>
  * and <code>streamCreated</code> events (see <a href="SessionConnectEvent.html">SessionConnectEvent</a> and
  * <a href="StreamEvent.html">StreamEvent</a>).
  * </p>
  * <p>
  * The subscribed stream is displayed on the local web page by replacing the specified element in the DOM with a streaming video display.
  * If the width and height of the display do not match the 4:3 aspect ratio of the video signal, the video stream is cropped to fit
  * the display. If the stream lacks a video component, a blank screen with an audio indicator is displayed in place of the video stream.
  * </p>
  *
  * <p>
  * The application throws an error if the session is not connected<!--JS-ONLY--> or if the
  * <code>replaceElementId</code> does not exist in the HTML DOM<!--/JS-ONLY-->.
  * </p>
  *
  * <h5>Example</h5>
  *
  * The following code subscribes to available streams at the time that a session is connected
  *
  * <pre>
  * var apiKey = ""; // Replace with your API key. See https://dashboard.tokbox.com/projects
  * var sessionID = ""; // Replace with your own session ID.
  *                     // See https://dashboard.tokbox.com/projects
  *
  * var session = TB.initSession(sessionID);
  * session.addEventListener("sessionConnected", sessionConnectHandler);
  * session.connect(apiKey, token);
  *
  * function sessionConnectHandler(event) {
  *     for (var i = 0; i &lt; event.streams.length; i++) {
  *         var stream = event.streams[i];
  *         displayStream(stream);
  *     }
  * }
  *
  * function displayStream(stream) {
  *     var div = document.createElement('div');
  *     div.setAttribute('id', 'stream' + stream.streamId);
  *     var streamsContainer = document.getElementById('streamsContainer');
  *     streamsContainer.appendChild(div);
  *     subscriber = session.subscribe(stream, 'stream' + stream.streamId);
  * }
  * </pre>
  * <p>
  * You can also add an event listener for the <code>streamCreated</code> event. The Session object dispatches this event when a new stream is created.
  * </p>
  * <pre>
  * session.addEventListener("streamCreated", streamCreatedHandler);
  *
  * function streamCreatedHandler(event) {
  *     for (var i = 0; i &lt; event.streams.length; i++) {
  *         var stream = event.streams[i];
  *         displayStream(stream);
  *     }
  * }
  * </pre>
  *
  * @param {Stream} stream The Stream object representing the stream to which we are trying to subscribe.
  *
  * @param {String} replaceElementId The ID of the existing DOM element
  * that the Subscriber replaces. If you do not specify a <code>replaceElementId</code>, the application
  * appends a new DOM element to the HTML <code>body</code>.
  *
  * @param {Object} properties This is an object that contains the following properties:
  *    <ul>
  *       <li><code>audioVolume</code> (Number) &#151; The desired audio volume, between 0 and 100, when the Subscriber
  *       is first opened (default: 50). After you subscribe to the stream, you can adjust the volume by calling
  *       the <a href="Subscriber.html#setAudioVolume"><code>setAudioVolume()</code> method</a> of the Subscriber
  *       object. This volume setting affects local playback only; it does not affect the stream's volume on other
  *       clients.</li>
  *
  *       <li><code>styles.nameDisplayMode</code> (String) &#151; This property determines whether to display the
  *       stream name. Possible values are: <code>"auto"</code> (the name is displayed when the stream is first
  *       displayed and when the user mouses over the display), <code>"off"</code> (the name is not displayed),
  *       and <code>"on"</code> (the name is displayed).</li>
  *    </ul>
  *
  * @signature subscribe(stream, replaceElementId, properties)
  * @returns {Subscriber} The Subscriber object for this stream. Stream control functions are exposed through the Subscriber object.
  * @method #subscribe
  * @memberOf Session
  */
  this.subscribe = function(stream, replaceElementId, properties) {
    var errorMsg;

    if (!this.connection || !this.connection.connectionId) {
      errorMsg = "Session.subscribe :: Connection required to subscribe";
      OT.error(errorMsg);
      throw new Error(errorMsg);
    }

    if (!stream) {
      errorMsg = "Session.subscribe :: stream cannot be null";
      OT.error(errorMsg);
      throw new Error(errorMsg);
    }

    if (!stream.hasOwnProperty("streamId")) {
      errorMsg = "Session.subscribe :: invalid stream object";
      OT.error(errorMsg);
      throw new Error(errorMsg);
    }

    var subscriber = new OT.Subscriber(replaceElementId, OT.$.extend(properties || {}, {
        session: this
    }));

    if (properties && properties.success) subscriber.once('subscribeSuccess', properties.success);
    if (properties && properties.error) subscriber.once('subscribeError', properties.error);

    _subscribers[stream.streamId] = subscriber;
    subscriber.subscribe(stream);

    return subscriber;
  };

 /**
  * Stops subscribing to a stream in the session. the display of the audio-video stream is removed from the local web page.
  *
  * <h5>Example</h5>
  * <p>
  * The following code subscribes to available streams at the time that a session is connected. For each stream, the code also
  * adds an Unsubscribe link.
  * </p>
  * <pre>
  * var apiKey = ""; // Replace with your API key. See https://dashboard.tokbox.com/projects
  * var sessionID = ""; // Replace with your own session ID.
  *                     // See https://dashboard.tokbox.com/projects
  * var streams = [];
  *
  * var session = TB.initSession(sessionID);
  * session.addEventListener("sessionConnected", sessionConnectHandler);
  * session.connect(apiKey, token);
  *
  * function sessionConnectHandler(event) {
  *     for (var i = 0; i &lt; event.streams.length; i++) {
  *         var stream = event.streams[i];
  *         displayStream(stream);
  *     }
  * }
  *
  * function displayStream(stream) {
  *     var div = document.createElement('div');
  *     div.setAttribute('id', 'stream' + stream.streamId);
  *
  *
  *
  *     var subscriber = session.subscribe(stream, 'stream' + stream.streamId);
  *     subscribers.push(subscriber);
  *
  *
  *     var aLink = document.createElement('a');
  *     aLink.setAttribute('href', 'javascript: unsubscribe("' + subscriber.id + '")');
  *     aLink.innerHTML = "Unsubscribe";
  *
  *     var streamsContainer = document.getElementById('streamsContainer');
  *     streamsContainer.appendChild(div);
  *     streamsContainer.appendChild(aLink);
  *
  *     streams = event.streams;
  * }
  *
  * function unsubscribe(subscriberId) {
  *     console.log("unsubscribe called");
  *     for (var i = 0; i &lt; subscribers.length; i++) {
  *         var subscriber = subscribers[i];
  *         if (subscriber.id == subscriberId) {
  *             session.unsubscribe(subscriber);
  *         }
  *     }
  * }
  * </pre>
  *
  * @param {Subscriber} subscriber The Subscriber object to unsubcribe.
  *
  * @see <a href="#subscribe">subscribe()</a>
  *
  * @method #unsubscribe
  * @memberOf Session
  */
  this.unsubscribe = function(subscriber) {
    if (!subscriber) {
      var errorMsg = "OT.Session.unsubscribe: subscriber cannot be null";
      OT.error(errorMsg);
      throw new Error(errorMsg);
    }

    if (!subscriber.stream) {
        OT.warn("OT.Session.unsubscribe:: tried to unsubscribe a subscriber that had no stream");
        return false;
    }

    OT.debug("OT.Session.unsubscribe: subscriber " + subscriber.id);

    delete _subscribers[subscriber.stream.id];

    subscriber.destroy();

    return true;
  };

 /**
  * Returns an array of local Subscriber objects for a given stream.
  *
  * @param {Stream} stream The stream for which you want to find subscribers.
  *
  * @returns {Array} An array of {@link Subscriber} objects for the specified stream.
  *
  * @see <a href="#unsubscribe">unsubscribe()</a>
  * @see <a href="Subscriber.html">Subscriber</a>
  * @see <a href="StreamEvent.html">StreamEvent</a>
  * @method #getSubscribersForStream
  * @memberOf Session
  */
  this.getSubscribersForStream = function(stream) {
      return [_subscribers[stream.id]];
  };

 /**
  * Returns the local Publisher object for a given stream.
  *
  * @param {Stream} stream The stream for which you want to find the Publisher.
  *
  * @returns {Publisher} A Publisher object for the specified stream. Returns <code>null</code> if there is no local Publisher object
  * for the specified stream.
  *
  * @see <a href="#forceUnpublish">forceUnpublish()</a>
  * @see <a href="Subscriber.html">Subscriber</a>
  * @see <a href="StreamEvent.html">StreamEvent</a>
  *
  * @method #getPublisherForStream
  * @memberOf Session
  */
  this.getPublisherForStream = function(stream) {
    var streamId;

    if (typeof(stream) == "string") {
      streamId = stream;
    } else if (typeof(stream) == "object" && stream && stream.hasOwnProperty("id")) {
      streamId = stream.id;
    } else {
      errorMsg = "Session.getPublisherForStream :: Invalid stream type";
      OT.error(errorMsg);
      throw new Error(errorMsg);
    }

    return getPublisherByStreamId(streamId);
  };


  // Proxy sendMessage messages to _messenger (message!). This should be made private
  // it isn't part of any public API and is dangerous to expose.
  this.sendMessage = function() {
    return _messenger.sendMessage.apply(_messenger, arguments);
  };

  // Client signal API entry point
  this.signal = function(options) {
    _messenger.signal(options);
  };

  this.sendJSEPMessage = function(toConnection, jsepType, payload) {
    if (_messenger && _messenger.connectionId) {
      _messenger.sendMessage(
        OT.WebSocketMessage.jsepMessage(_messenger.connectionId,
                                        toConnection.connectionId,
                                        jsepType,
                                        payload)
      );
    } else {
      OT.warn("Session.sendJSEPMessage :: Tried to send a message without a _messenger");
    }
  };

 /**
  * 	Forces a remote connection to leave the session.
  *
  * <p>
  * 	The <code>forceDisconnect()</code> method is normally used as a moderation tool
  *        to remove users from an ongoing session.
  * </p>
  * <p>
  * 	When a connection is terminated using the <code>forceDisconnect()</code>,
  *        <code>sessionDisconnected</code>, <code>connectionDestroyed</code> and
  *        <code>streamDestroyed</code> events are dispatched in the same way as they
  *        would be if the connection had terminated itself using the <code>disconnect()</code> method. However,
  *        the <code>reason</code> property of a {@link ConnectionEvent} or {@link StreamEvent} object specifies
  *        <code>"forceDisconnected"</code> as the reason for the destruction of the connection and stream(s).
  * </p>
  * <p>
  * 	While you can use the <code>forceDisconnect()</code> method to terminate your own connection,
  *        calling the <code>disconnect()</code> method is simpler.
  * </p>
  * <p>
  * 	The TB object dispatches an <code>exception</code> event if the user's role
  * 	does not include permissions required to force other users to disconnect.
  *        You define a user's role when you create the user token using the <code>generate_token()</code>
  *        method using <a href="/opentok/api/tools/documentation/api/server_side_libraries.html">OpenTok
  * 	server-side libraries</a> or the <a href="https://dashboard.tokbox.com/projects">Dashboard</a> page.
  * 	See <a href="ExceptionEvent.html">ExceptionEvent</a> and <a href="TB.html#addEventListener">TB.addEventListener()</a>.
  * </p>
  * <p>
  * 	The application throws an error if the session is not connected.
  * </p>
  *
  * <h5>Events dispatched:</h5>
  *
  * <p>
  * 	<code>connectionDestroyed</code> (<a href="ConnectionEvent.html">ConnectionEvent</a>) &#151;
  *     On clients other than which had the connection terminated.
  * </p>
  * <p>
  * 	<code>exception</code> (<a href="ExceptionEvent.html">ExceptionEvent</a>) &#151;
  *     The user's role does not allow forcing other user's to disconnect (<code>event.code = 1530</code>),
  * 	or the specified stream is not publishing to the session (<code>event.code = 1535</code>).
  * </p>
  * <p>
  * 	<code>sessionDisconnected</code> (<a href="SessionDisconnectEvent.html">SessionDisconnectEvent</a>) &#151;
  *     On the client which has the connection terminated.
  * </p>
  * <p>
  * 	<code>streamDestroyed</code> (<a href="StreamEvent.html">StreamEvent</a>) &#151;
  *     If streams are stopped as a result of the connection ending.
  * </p>
  *
  * @param {Connection} connection The connection to be disconnected from the session.
  * This value can either be a <a href="Connection.html">Connection</a> object or a connection ID (which can be
  * obtained from the <code>connectionId</code> property of the Connection object).
  *
  * @method #forceDisconnect
  * @memberOf Session
  */

  this.forceDisconnect = function(connectionOrConnectionId, callbacks) {
    var notPermittedErrorMsg = "This token does not allow forceDisconnect. The role must be at least `moderator` to enable this functionality";

    if (permittedTo("forceDisconnect")) {
      var connectionId = typeof(connectionOrConnectionId) === 'string' ? connectionOrConnectionId : connectionOrConnectionId.id;

      if (callbacks && !!(callbacks.success || callbacks.error)) {
        var work = new RemoteWork(this, callbacks.success, callbacks.error, {
          timeoutMessage: "Timed out while waiting for connection " + connectionId + " to be force Disconnected."
        });

        work.failsOnExceptionCodes({
          1520: notPermittedErrorMsg
        });

        _callbacks.forceDisconnect[connectionId] = work;
      }

      _messenger.sendMessage(
        OT.WebSocketMessage.forceDisconnect(connectionId)
      );
    } else {
      // if this throws an error the handleJsException won't occur
      if (callbacks && callbacks.error) OT.$.callAsync(callbacks.error, notPermittedErrorMsg);

      TB.handleJsException(notPermittedErrorMsg, OT.ExceptionCodes.UNABLE_TO_FORCE_DISCONNECT, {
        session: this
      });
    }
  };

 /**
  * Forces the publisher of the specified stream to stop publishing the stream.
  *
  * <p>
  * Calling this method causes the Session object to dispatch a <code>streamDestroyed</code>
  * event on all clients that are subscribed to the stream (including the client that is
  * publishing the stream). The <code>reason</code> property of the StreamEvent object is
  * set to <code>"forceUnpublished"</code>.
  * </p>
  * <p>
  * The TB object dispatches an <code>exception</code> event if the user's role
  * does not include permissions required to force other users to unpublish.
  * You define a user's role when you create the user token using the <code>generate_token()</code>
  * method using the <a href="/opentok/api/tools/documentation/api/server_side_libraries.html">OpenTok
  * server-side libraries</a> or the <a href="https://dashboard.tokbox.com/projects">Dashboard</a> page page.
  * You pass the token string as a parameter of the <code>connect()</code> method of the Session object.
  * See <a href="ExceptionEvent.html">ExceptionEvent</a> and <a href="TB.html#addEventListener">TB.addEventListener()</a>.
  * </p>
  *
  * <h5>Events dispatched:</h5>
  *
  * <p>
  * 	<code>exception</code> (<a href="ExceptionEvent.html">ExceptionEvent</a>) &#151;
  *     The user's role does not allow forcing other users to unpublish.
  * </p>
  * <p>
  * 	<code>streamDestroyed</code> (<a href="StreamEvent.html">StreamEvent</a>) &#151;
  *     The stream has been unpublished. The Session object dispatches this on all clients
  *     subscribed to the stream, as well as on the publisher's client.
  * </p>
  *
  * @param {Stream} stream The stream to be unpublished.
  *
  * @method #forceUnpublish
  * @memberOf Session
  */
  this.forceUnpublish = function(streamOrStreamId, callbacks) {
    var notPermittedErrorMsg = "This token does not allow forceUnpublish. The role must be at least `moderator` to enable this functionality";

    if (permittedTo("forceUnpublish")) {
      var streamId = typeof(streamOrStreamId) === 'string' ? streamOrStreamId : streamOrStreamId.id;

      if (callbacks && !!(callbacks.success || callbacks.error)) {
        var work = new RemoteWork(this, callbacks.success, callbacks.error, {
          timeoutMessage: "Timed out while waiting for stream " + streamId + " to be force unpublished."
        });

        work.failsOnExceptionCodes({
          1530: notPermittedErrorMsg
        });

        _callbacks.forceUnpublish[streamId] = work;
      }

      _messenger.sendMessage(
        OT.WebSocketMessage.forceUnpublish(streamId)
      );
    } else {
      // if this throws an error the handleJsException won't occur
      if (callbacks && callbacks.error) OT.$.callAsync(callbacks.error, notPermittedErrorMsg);

      TB.handleJsException(notPermittedErrorMsg, OT.ExceptionCodes.UNABLE_TO_FORCE_UNPUBLISH, {
        session: this
      });
    }
  };

  this.getStateManager = function() {
      OT.warn("Fixme: Have not implemented session.getStateManager");
  };

  this.__defineGetter__("apiKey", function() { return _apiKey; });
  this.__defineGetter__("token", function() { return _token; });
  this.__defineGetter__("connected", function() { return _connected; });
  this.__defineGetter__("connection", function() { return _wrangler.connections[_connectionId]; });
  this.__defineSetter__("connection", function(value) {
      if (value.hasOwnProperty("connectionId")) {
          _connectionId = value.connectionId;
          _wrangler.connections[_connectionId] = value;
      }
  });

  this.__defineGetter__("capabilities", function() { return _capabilities; });
  this.__defineGetter__("sessionId", function() { return _sessionId; });
  this.__defineGetter__("id", function() { return _sessionId; });

  this.__defineGetter__('connections', function() { return _wrangler.connections; });

  // DO NOT USE: Exposed for interopt with the old TB.js, this will be removed
  this.__defineGetter__("publishers", function() { return _publishers; });

	/**
	 * A new connection to this session has been created.
	 * @name connectionCreated
	 * @event
	 * @memberof Session
	 * @see ConnectionEvent
	 * @see <a href="TB.html#initSession">TB.initSession()</a>
	 */

	/**
	 * A connection to this session has ended.
	 * @name connectionDestroyed
	 * @event
	 * @memberof Session
	 * @see ConnectionEvent
	 */

	/**
	 * The page has connected to a session on the TokBox server. This event is dispatched asynchronously in response to
	 * a successful call to the <code>connect()</code> method of a Session object. Before calling the <code>connect()</code>
	 * method, initialize the session by calling the <code>TB.initSession()</code> method. For a code example and more details,
	 * see <a href="#connect">Session.connect()</a>.
	 * @name sessionConnected
	 * @event
	 * @memberof Session
	 * @see SessionConnectEvent
	 * @see <a href="#connect">Session.connect()</a>
	 * @see <a href="TB.html#initSession">TB.initSession()</a>
	 */

	/**
	 * The session has disconnected. This event may be dispatched asynchronously in response to a successful call to the
	 * <code>disconnect()</code> method of the Session object. The event may also be disptached if a session connection is lost
	 * inadvertantly, as in the case of a lost network connection.
	 * @event
	 * @memberof Session
	 * @see <a href="#disconnect">Session.disconnect()</a>
	 * @see <a href="#disconnect">Session.forceDisconnect()</a>
	 * @see SessionDisconnectEvent
	 */

	/**
	 * A new stream has been created on this session. For a code example and more details, see {@link StreamEvent}.
	 * @name streamCreated
	 * @event
	 * @memberof Session
	 * @see StreamEvent
	 * @see <a href="Session.html#publish">Session.publish()</a>
	 */

	/**
	 * A stream has closed on this connection. For a code example and more details, see {@link StreamEvent}.
	 * @name streamDestroyed
	 * @event
	 * @memberof Session
	 * @see StreamEvent
	 */

	/**
	 * A stream has started or stopped publishing audio or video (see <a href="Publisher.html#publishAudio">Publisher.publishAudio()</a> and
	 * <a href="Publisher.html#publishVideo">Publisher.publishVideo()</a>); or the <code>videoDimensions</code> property of the Stream
	 * object has changed (see <a href="Stream.html#"videoDimensions>Stream.videoDimensions</a>).
	 * @name streamPropertyChanged
	 * @event
	 * @memberof Session
	 * @see StreamPropertyChangedEvent
	 * @see <a href="Publisher.html#publishAudio">Publisher.publishAudio()</a>
	 * @see <a href="Publisher.html#publishVideo">Publisher.publishVideo()</a>
	 * @see <a href="Stream.html#"hasAudio>Stream.hasAudio</a>
	 * @see <a href="Stream.html#"hasVideo>Stream.hasVideo</a>
	 * @see <a href="Stream.html#"videoDimensions>Stream.videoDimensions</a>
	 */

};

})(window);
(function(window) {

// Massages the data that comes back from the WebSocket into a more palatable
// format. Also does some minor house keeping. This was extracted from OT.Session
// to keep it a little leaner.
OT.SessionMessageWrangler = function (sessionId) {
    var _connections = {};
    this.__defineGetter__('connections', function() { return _connections; });
    
  var processConnectionPacket = function (connectionPacket) {
        var connection = new OT.Connection(connectionPacket.connectionId,
                                  connectionPacket.creationTime,
                                  connectionPacket.data,
                                  {
                                    supportsWebRTC: connectionPacket.supportsWebRTC
                                  });
        _connections[connection.connectionId] = connection;
        return connection;
      },

      processConnectionPackets = function (connectionPackets) {
        return Object.keys(connectionPackets).map(function(key) {
          return processConnectionPacket(connectionPackets[key]);
        });
      },

      processStreamPacket = function (streamPacket, newConnections) {
        function getConnection(connectionId) {
          if (_connections[streamPacket.connection.connectionId]) {
            return _connections[streamPacket.connection.connectionId];
          }
          else if (newConnections) {
            for (var i=0,numConnections=newConnections.length; i<numConnections; ++i) {
              if (connectionId === newConnections[i].id) {
                return newConnections[i];
              }
            }
          }

          return null;
        }

        var stream = new OT.Stream(
          streamPacket.streamId,
          getConnection(streamPacket.connection.connectionId),
          streamPacket.name,
          streamPacket.streamData,
          streamPacket.type,
          streamPacket.creationTime,
          streamPacket.hasAudio,
          streamPacket.hasVideo,
          streamPacket.orientation ? streamPacket.orientation : { videoOrientation: OT.VideoOrientation.ROTATED_NORMAL, width: 640, height: 480 },
          streamPacket.peerId,
          streamPacket.quality,
          streamPacket.orientation ? streamPacket.orientation.width : 640,
          streamPacket.orientation ? streamPacket.orientation.height : 480
        );

        // This is a code smell, but it's necessary for now as the part of the code
        // that re-parents streams to publishers is in a different object that cannot
        // access the raw stream packet
        if (streamPacket.publisherId) {
          stream.publisherId = streamPacket.publisherId;
        }

        return stream;
      },

      processStreamPackets = function (streamPackets, newConnections) {
        var streams = [];

        for (var key in streamPackets) {
            // Right now streamPackets could be an object or an array depending on whether it came from
            // streamCreated or sessionConnected. ToDo: we need to clean this up and make it consistent.
            if (streamPackets.hasOwnProperty(key)) {
                var stream = processStreamPacket(streamPackets[key], newConnections);
                if (stream) streams.push(stream);
            }
        }

        return streams;
      };


  this.wrangle = function (message) {
    if (message.sessionState) {
      if (message.sessionState.CONNECTIONS) {
        message.connections = processConnectionPackets(message.sessionState.CONNECTIONS);
      }

      if (message.sessionState.STREAMS) {
        message.streams = processStreamPackets(message.sessionState.STREAMS, message.connections);
      }
    } else {
      if (message.streams) {
        message.streams = processStreamPackets(message.streams, message.connections);
      }

      if (message.connection) {
        message.connection = processConnectionPacket(message.connection);
      }
    }

    return message;
  };
};

})(window);
(function(window) {
  var style = document.createElement('link');
  style.type = 'text/css';
  style.media = 'screen';
  style.rel = 'stylesheet';
  style.href = OT.properties.cssURL;
  var head = document.head || document.getElementsByTagName('head')[0];
  head.appendChild(style);
})(window);
