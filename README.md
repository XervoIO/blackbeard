<pre>
  ____  _            _      ____                     _       _~
 | __ )| | __ _  ___| | __ | __ )  ___  __ _ _ __ __| |  _~ )_)_~
 |  _ \| |/ _` |/ __| |/ / |  _ \ / _ \/ _` | '__/ _` |  )_))_))_)
 | |_) | | (_| | (__|   &lt;  | |_) |  __/ (_| | | | (_| |  _!__!__!_ 
 |____/|_|\__,_|\___|_|\_\ |____/ \___|\__,_|_|  \__,_|  \_____EB/   
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 Pirate Metrics for Node.js
</pre>

A simple API for pushing events to Pirate Metrics.

## Getting Started

Install the module:

    npm install blackbeard

Use it in your script, set your API key:

    var bb = require('blackbeard');
    bb.key = 'PMKey';

## Usage

Make an AARRR call:

    bb.acquisition('pirate@example.com', function(err, res) {
      // Handle stuff...
    });

Maybe you want to do a few at once:

    var pirates = [
      {email : 'jacksparrow@example.com'},
      {email : 'barbossa@example.com'}
      {email : 'davyjones@example.com'}
    ];

    bb.acquisitions(pirates, function(err, res) {
     // Handle stuff...
    });

## API

Each of the five __AARRR__ events is represented, along with sister functions for bulk events. The *email* and *occurred_at* properties should always be strings.

Any invalid optional params will be striped before pushing the event. For example, if *level* is passed to __acquisition__ as a string, it will be omitted from the event because it is expected to be a number.

All callbacks take two arguments: *error* and *response*. 

    callback(error, response) { ... }

If there is an error, *response* will be null.

### Functions

* __acquisition__(email[,level][,occurred_at], callback) - *level* should always be a number.

* __acquisitions__(data, callback) - *data* is an array of acquisition objects *{email:""[,level:0][,occurred_at:""]}*.

* __activation__(email[,occurred_at], callback)

* __activations__(data, callback) - *data* is an array of activation objects *{email:""[,occurred_at:""]}*.

* __retention__(email[,occurred_at], callback)

* __retentions__(data, callback) - *data* is an array of retention objects *{email:""[,occurred_at:""]}*.

* __referral__(customer\_email, referree\_email[,occurred_at], callback) - *referree\_email* is the customer gained and *customer\_email* is the email who referred them. Both should always be strings.

* __referrals__(data, callback) - *data* is an array of referral objects *{customer_email:"",referree_email:""[,occurred_at:""]}*.

* __revenue__(email, amount\_in\_cents[,occurred_at], callback) - *amount\_in\_cents* should always be a number.

* __revenues__(data, callback) - *data* is an array of referral objects *{customer_email:"",amount_in_cents:0[,occurred_at:""]}*.