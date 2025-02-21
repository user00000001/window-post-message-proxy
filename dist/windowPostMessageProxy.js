/*! window-post-message-proxy v0.2.14 | (c) 2016 Microsoft Corporation MIT */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["window-post-message-proxy"] = factory();
	else
		root["window-post-message-proxy"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var WindowPostMessageProxy = /** @class */ (function () {
	    function WindowPostMessageProxy(options) {
	        if (options === void 0) { options = {
	            processTrackingProperties: {
	                addTrackingProperties: WindowPostMessageProxy.defaultAddTrackingProperties,
	                getTrackingProperties: WindowPostMessageProxy.defaultGetTrackingProperties
	            },
	            isErrorMessage: WindowPostMessageProxy.defaultIsErrorMessage,
	            extractErrorMessage: WindowPostMessageProxy.defaultExtractErrorMessage,
	            receiveWindow: window,
	            name: WindowPostMessageProxy.createRandomString()
	        }; }
	        var _this = this;
	        this.pendingRequestPromises = {};
	        // save options with defaults
	        this.addTrackingProperties = (options.processTrackingProperties && options.processTrackingProperties.addTrackingProperties) || WindowPostMessageProxy.defaultAddTrackingProperties;
	        this.getTrackingProperties = (options.processTrackingProperties && options.processTrackingProperties.getTrackingProperties) || WindowPostMessageProxy.defaultGetTrackingProperties;
	        this.isErrorMessage = options.isErrorMessage || WindowPostMessageProxy.defaultIsErrorMessage;
	        this.extractErrorMessage = options.extractErrorMessage || WindowPostMessageProxy.defaultExtractErrorMessage;
	        this.receiveWindow = options.receiveWindow || window;
	        this.name = options.name || WindowPostMessageProxy.createRandomString();
	        this.target = options.target;
	        this.logMessages = options.logMessages || false;
	        this.eventSourceOverrideWindow = options.eventSourceOverrideWindow;
	        this.suppressWarnings = options.suppressWarnings || false;
	        if (this.logMessages) {
	            console.log("new WindowPostMessageProxy created with name: " + this.name + " receiving on window: " + this.receiveWindow.document.title);
	        }
	        // Initialize
	        this.handlers = [];
	        this.windowMessageHandler = function (event) { return _this.onMessageReceived(event); };
	        this.start();
	    }
	    // Static
	    WindowPostMessageProxy.defaultAddTrackingProperties = function (message, trackingProperties) {
	        message[WindowPostMessageProxy.messagePropertyName] = trackingProperties;
	        return message;
	    };
	    WindowPostMessageProxy.defaultGetTrackingProperties = function (message) {
	        return message[WindowPostMessageProxy.messagePropertyName];
	    };
	    WindowPostMessageProxy.defaultIsErrorMessage = function (message) {
	        return !!message.error;
	    };
	    WindowPostMessageProxy.defaultExtractErrorMessage = function (message) {
	        return message.error;
	    };
	    /**
	     * Utility to create a deferred object.
	     */
	    // TODO: Look to use RSVP library instead of doing this manually.
	    // From what I searched RSVP would work better because it has .finally and .deferred; however, it doesn't have Typings information. 
	    WindowPostMessageProxy.createDeferred = function () {
	        var deferred = {
	            resolve: null,
	            reject: null,
	            promise: null
	        };
	        var promise = new Promise(function (resolve, reject) {
	            deferred.resolve = resolve;
	            deferred.reject = reject;
	        });
	        deferred.promise = promise;
	        return deferred;
	    };
	    /**
	     * Utility to generate random sequence of characters used as tracking id for promises.
	     */
	    WindowPostMessageProxy.createRandomString = function () {
	        return (Math.random() + 1).toString(36).substring(7);
	    };
	    /**
	     * Adds handler.
	     * If the first handler whose test method returns true will handle the message and provide a response.
	     */
	    WindowPostMessageProxy.prototype.addHandler = function (handler) {
	        this.handlers.push(handler);
	    };
	    /**
	     * Removes handler.
	     * The reference must match the original object that was provided when adding the handler.
	     */
	    WindowPostMessageProxy.prototype.removeHandler = function (handler) {
	        var handlerIndex = this.handlers.indexOf(handler);
	        if (handlerIndex === -1) {
	            throw new Error("You attempted to remove a handler but no matching handler was found.");
	        }
	        this.handlers.splice(handlerIndex, 1);
	    };
	    /**
	     * Start listening to message events.
	     */
	    WindowPostMessageProxy.prototype.start = function () {
	        this.receiveWindow.addEventListener('message', this.windowMessageHandler);
	    };
	    /**
	     * Stops listening to message events.
	     */
	    WindowPostMessageProxy.prototype.stop = function () {
	        this.receiveWindow.removeEventListener('message', this.windowMessageHandler);
	    };
	    /**
	     * Post message to target window with tracking properties added and save deferred object referenced by tracking id.
	     */
	    WindowPostMessageProxy.prototype.postMessage = function (targetWindow, message) {
	        // Add tracking properties to indicate message came from this proxy
	        var trackingProperties = {
	            id: WindowPostMessageProxy.createRandomString(),
	            source: this.name,
	            target: this.target
	        };
	        this.addTrackingProperties(message, trackingProperties);
	        if (this.logMessages) {
	            console.warn("Proxy(" + this.name + "): Sending:", JSON.stringify(message, null, '  '));
	        }
	        targetWindow.postMessage(message, "*");
	        var deferred = WindowPostMessageProxy.createDeferred();
	        this.pendingRequestPromises[trackingProperties.id] = deferred;
	        return deferred.promise;
	    };
	    /**
	     * Send response message to target window.
	     * Response messages re-use tracking properties from a previous request message.
	     */
	    WindowPostMessageProxy.prototype.sendResponse = function (targetWindow, message, trackingProperties) {
	        this.addTrackingProperties(message, trackingProperties);
	        if (this.logMessages) {
	            console.warn("Proxy(" + this.name + "): Responding:", JSON.stringify(message, null, '  '));
	        }
	        targetWindow.postMessage(message, "*");
	    };
	    /**
	     * Message handler.
	     */
	    WindowPostMessageProxy.prototype.onMessageReceived = function (event) {
	        var _this = this;
	        var sendingWindow = this.eventSourceOverrideWindow || event.source;
	        var message = event.data;
	        if (typeof message !== "object") {
	            if (!this.suppressWarnings) {
	                console.warn("Proxy(" + this.name + "): Received message that was not an object. Discarding message");
	            }
	            return;
	        }
	        var trackingProperties;
	        try {
	            trackingProperties = this.getTrackingProperties(message);
	            if (trackingProperties && trackingProperties.target != null) {
	                if (trackingProperties.target !== this.name) {
	                    // skips messages which are not for me
	                    return;
	                }
	            }
	            if (this.logMessages) {
	                console.warn("Proxy(" + this.name + "): Receiving:", JSON.stringify(event.data, null, '  '));
	            }
	        }
	        catch (e) {
	            if (!this.suppressWarnings) {
	                console.warn("Proxy(" + this.name + "): Error occurred when attempting to get tracking properties from incoming message:", JSON.stringify(message, null, '  '), "Error: ", e);
	            }
	        }
	        var deferred;
	        if (trackingProperties) {
	            deferred = this.pendingRequestPromises[trackingProperties.id];
	        }
	        // If message does not have a known ID, treat it as a request
	        // Otherwise, treat message as response
	        if (!deferred) {
	            var handled = this.handlers.some(function (handler) {
	                var canMessageBeHandled = false;
	                try {
	                    canMessageBeHandled = handler.test(message);
	                }
	                catch (e) {
	                    if (!_this.suppressWarnings) {
	                        console.warn("Proxy(" + _this.name + "): Error occurred when handler was testing incoming message:", JSON.stringify(message, null, '  '), "Error: ", e);
	                    }
	                }
	                if (canMessageBeHandled) {
	                    var responseMessagePromise = void 0;
	                    try {
	                        responseMessagePromise = Promise.resolve(handler.handle(message));
	                    }
	                    catch (e) {
	                        if (!_this.suppressWarnings) {
	                            console.warn("Proxy(" + _this.name + "): Error occurred when handler was processing incoming message:", JSON.stringify(message, null, '  '), "Error: ", e);
	                        }
	                        responseMessagePromise = Promise.resolve();
	                    }
	                    responseMessagePromise
	                        .then(function (responseMessage) {
	                        if (!responseMessage) {
	                            var warningMessage = "Handler for message: " + JSON.stringify(message, null, '  ') + " did not return a response message. The default response message will be returned instead.";
	                            if (!_this.suppressWarnings) {
	                                console.warn("Proxy(" + _this.name + "): " + warningMessage);
	                            }
	                            responseMessage = {
	                                warning: warningMessage
	                            };
	                        }
	                        trackingProperties.target = trackingProperties.source;
	                        trackingProperties.source = _this.name;
	                        _this.sendResponse(sendingWindow, responseMessage, trackingProperties);
	                    });
	                    return true;
	                }
	            });
	            /**
	             * TODO: Consider returning an error message if nothing handled the message.
	             * In the case of the Report receiving messages all of them should be handled,
	             * however, in the case of the SDK receiving messages it's likely it won't register handlers
	             * for all events. Perhaps make this an option at construction time.
	             */
	            if (!handled && !this.suppressWarnings) {
	                console.warn("Proxy(" + this.name + ") did not handle message. Handlers: " + this.handlers.length + "  Message: " + JSON.stringify(message, null, '') + ".");
	                // this.sendResponse({ notHandled: true }, trackingProperties);
	            }
	        }
	        else {
	            /**
	             * If error message reject promise,
	             * Otherwise, resolve promise
	             */
	            var isErrorMessage = true;
	            try {
	                isErrorMessage = this.isErrorMessage(message);
	            }
	            catch (e) {
	                console.warn("Proxy(" + this.name + ") Error occurred when trying to determine if message is consider an error response. Message: ", JSON.stringify(message, null, ''), 'Error: ', e);
	            }
	            if (isErrorMessage) {
	                deferred.reject(this.extractErrorMessage(message));
	            }
	            else {
	                deferred.resolve(message);
	            }
	            // TODO: Move to .finally clause up where promise is created for better maitenance like original proxy code.
	            delete this.pendingRequestPromises[trackingProperties.id];
	        }
	    };
	    WindowPostMessageProxy.messagePropertyName = "windowPostMessageProxy";
	    return WindowPostMessageProxy;
	}());
	exports.WindowPostMessageProxy = WindowPostMessageProxy;


/***/ })
/******/ ])
});
;
//# sourceMappingURL=windowPostMessageProxy.js.map