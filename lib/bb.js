/*  ____  _            _      ____                     _       _~
 * | __ )| | __ _  ___| | __ | __ )  ___  __ _ _ __ __| |  _~ )_)_~
 * |  _ \| |/ _` |/ __| |/ / |  _ \ / _ \/ _` | '__/ _` |  )_))_))_)
 * | |_) | | (_| | (__|   <  | |_) |  __/ (_| | | | (_| |  _!__!__!_
 * |____/|_|\__,_|\___|_|\_\ |____/ \___|\__,_|_|  \__,_|  \_____EB/
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Pirate Metrics for Node.js
 *
 * https://github.com/onmodulus/blackbeard
 *
 * Copyright (c) 2012 Modulus
 * Licensed under the MIT license.
 */

module.exports = {
  /**
   * Pirate Metrics API key.
   * This must before any API calls can be made.
   * @type {string}
   */
  key : '',

  /**
   * Request API instance.
   * @type {Request}
   */
  _r : require('request'),

  /**
   * The base URL for the Pirate Metrics api.
   * @type {string}
   */
  _url : 'http://piratemetrics.com/api/v1/',

  /**
   * When true, every call will log request
   * information to the console.
   * @type {boolean}
   */
  debug : false,

  /**
   * Makes a POST to the Pirate Metrics API.
   * @param  {string}   url  The trailing end of the URL
   * for the API call, IE 'aqiusitions' or 'revenues'.
   * @param  {object}   data The data to send with the request.
   * @param  {Function} cb   The callback function to call when
   * the request has completed. Takes err and result as arguments.
   */
  _go : function(url, data, cb) {
    if(this.key.length < 1) {
      cb('API key required!', null);
    }

    data = {
      api_key : this.key,
      data : data
    };

    if(this.debug) {
      console.log(this._url + url, JSON.stringify(data));
    }

    this._r({
      url : this._url + url,
      method : 'POST',
      json : true,
      body: JSON.stringify(data)
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        cb(null, body);
      } else {
        cb(error, null);
      }
    });
  },

  /**
   * Validates an array of data, then calls _go with the data.
   * @param  {string}   validation The internal function to call
   * on each data element to validate it.
   * @param  {string}   url        URL to be used in the _go call.
   * @param  {object}   data       The data to be validated and sent
   * @param  {Function} cb         The function to call when
   * the request has completed. Error and Result are passed
   * as arguments.
   */
  _bulk : function(validation, url, data, cb) {
    var valid = true;

    for(var i = 0; i < data.length; i++) {
      data[i] = this[validation](data[i]);
      if(data[i] === null) {
        valid = false;
        break;
      }
    }

    if(valid) {
      this._go(url, data, cb);
    } else {
      cb('Unable to validate data.', null);
    }
  },

  /**
   * Validates an acquisition object. Also removes any empty
   * optional arguments.
   * @param  {object} data The acquisition to be validated.
   * @return {null|object} Sanitized acquisition object, or
   * null if email is not a string (required).
   */
  _acquisition : function(data) {
    if(typeof data.email !== 'string') {
      return null;
    }

    if(typeof data.level !== 'number') {
      delete data.level;
    }

    if(typeof data.occurred_at !== 'string') {
      delete data.occurred_at;
    }

    return data;
  },

  /**
   * Send a single acquisition.
   * @param  {string}   email Email for the acquisition.
   * @param  {number}   level Optional. Meta information to
   * help track any important numberical value. Used as the callback
   * if it is a function.
   * @param  {string}   date  Optional. The time at which the acquisition
   * occured. Used as the callback if it is a function.
   * @param  {Function} cb    The function to call when
   * the request is complete. Error and Result are passed
   * as arguments.
   */
  acquisition : function(email, level, date, cb) {
    if(typeof level === 'function') {
      cb = level;
    }

    if(typeof date === 'function') {
      cb = date;
    }

    var data = this._acquisition({
      email : email,
      level :  level,
      occurred_at : date
    });

    if(data === null) {
      cb('At least email is required.', null);
    } else {
      this._go('acquisitions', [data], cb);
    }
  },

  /**
   * Send a bundle of acquisitions.
   * @param  {string}   data  An array of acquisitions.
   * @param  {Function} cb    The callback function to call when
   * the request is complete.
   */
  acquisitions : function(data, cb) {
    this._bulk('_acquisition', 'acquisitions', data, cb);
  },

  /**
   * Validates an activation object. Also removes any empty
   * optional arguments.
   * @param  {object} data The activation to be validated.
   * @return {null|object} Sanitized activation object, or
   * null if email is not a string (required).
   */
  _activation : function(data) {
    if(typeof data.email !== 'string') {
      return null;
    }

    if(typeof data.occurred_at !== 'string') {
      delete data.occurred_at;
    }

    return data;
  },

  /**
   * Send a single activation.
   * @param  {string}   email Email to activate.
   * @param  {string}   date  Optional. The time at which the activation
   * occured. Used as the callback if it is a function.
   * @param  {Function} cb    The function to call when
   * the request is complete. Error and Result are passed
   * as arguments.
   */
  activation : function(email, date, cb) {
    if(typeof date === 'function') {
      cb = date;
    }

    var data = this._activation({
      email : email,
      occurred_at : date
    });

    if(data === null) {
      cb('At least email is required.', null);
    } else {
      this._go('activations', [data], cb);
    }
  },

  /**
   * Send a bundle of activations.
   * @param  {string}   data  An array of activations.
   * @param  {Function} cb    The callback function to call when
   * the request is complete.
   */
  activations : function(data, cb) {
    this._bulk('_activation', 'activations', data, cb);
  },

  /**
   * Validates a retention object. Also removes any empty
   * optional arguments.
   * @param  {object} data The retention to be validated.
   * @return {null|object} Sanitized retention object, or
   * null if email is not a string (required).
   */
  _retention : function(data) {
    if(typeof data.email !== 'string') {
      return null;
    }

    if(typeof data.occurred_at !== 'string') {
      delete data.occurred_at;
    }

    return data;
  },

  /**
   * Send a single retention.
   * @param  {string}   email Email that has performed a key event.
   * @param  {string}   date  Optional. The time at which the retention
   * occured. Used as the callback if it is a function.
   * @param  {Function} cb    The function to call when
   * the request is complete. Error and Result are passed
   * as arguments.
   */
  retention : function(email, date, cb) {
    if(typeof date === 'function') {
      cb = date;
    }

    var data = this._retention({
      email : email,
      occurred_at : date
    });
    
    if(data === null) {
      cb('At least email is required.', null);
    } else {
      this._go('retentions', [data], cb);
    }
  },

  /**
   * Send a bundle of retentions.
   * @param  {string}   data  An array of retentions.
   * @param  {Function} cb    The callback function to call when
   * the request is complete.
   */
  retentions : function(data, cb) {
    this._bulk('_retention', 'retentions', data, cb);
  },

  /**
   * Validates a referral object. Also removes any empty
   * optional arguments.
   * @param  {object} data The referral to be validated.
   * @return {null|object} Sanitized referral object, or
   * null if customer_email or referree_email are not a
   * string (both are required).
   */
  _referral : function(data) {
    if(typeof data.customer_email !== 'string' ||
      typeof data.referree_email !== 'string') {
      return null;
    }

    if(typeof data.occurred_at !== 'string') {
      delete data.occurred_at;
    }

    return data;
  },

  /**
   * Send a single referral.
   * @param  {string}   email    Email of the referrer.
   * @param  {string}   referree Email of the new customer.
   * @param  {string}   date     Optional. The time at which the
   * referral occured. Used as the callback if it is a function.
   * @param  {Function} cb       The function to call when
   * the request is complete. Error and Result are passed
   * as arguments.
   */
  referral : function(email, referree, date, cb) {
    if(typeof date === 'function') {
      cb = date;
    }

    var data = this._referral({
      customer_email : email,
      referree_email : referree,
      occurred_at : date
    });

    if(data === null) {
      cb('Customer and referree emails are required.', null);
    } else {
      this._go('referrals', [data], cb);
    }
  },

  /**
   * Send a bundle of referrals.
   * @param  {string}   data  An array of referrals.
   * @param  {Function} cb    The callback function to call when
   * the request is complete.
   */
  referrals : function(data, cb) {
    this._bulk('_referral', 'referrals', data, cb);
  },

  /**
   * Validates a revenue object. Also removes any empty
   * optional arguments.
   * @param  {object} data The revenue to be validated.
   * @return {null|object} Sanitized revenue object, or
   * null if email is not a string or if amount_in_cents is not a
   * number (both are required).
   */
  _revenue : function(data) {
    if(typeof data.email !== 'string' ||
      typeof data.amount_in_cents !== 'number') {
      return null;
    }

    if(typeof data.occurred_at !== 'string') {
      delete data.occurred_at;
    }

    return data;
  },

  /**
   * Send a single revenue.
   * @param  {string}   email    Email of the payer.
   * @param  {number}   cents    Amount given (in american cents).
   * @param  {string}   date     Optional. The time at which the
   * referral occured. Used as the callback if it is a function.
   * @param  {Function} cb       The function to call when
   * the request is complete. Error and Result are passed
   * as arguments.
   */
  revenue : function(email, cents, date, cb) {
    if(typeof date === 'function') {
      cb = date;
    }

    var data = this._revenue({
      email : email,
      amount_in_cents : cents,
      occurred_at : date
    });

    if(data === null) {
      cb('Email and an amount in cents are required.', null);
    } else {
      this._go('revenues', [data], cb);
    }
  },

  /**
   * Send a bundle of revenues.
   * @param  {string}   data  An array of revenues.
   * @param  {Function} cb    The callback function to call when
   * the request is complete.
   */
  revenues : function(data, cb) {
    this._bulk('_revenue', 'revenues', data, cb);
  }
};