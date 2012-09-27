var bb = require('../lib/bb.js');
var http = require('http');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()

  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

//Generates a random email
var getEmail = function() {
  var d = new Date();
  return 'usr' +
    d.getDate() + '.' +
    d.getHours() + '.' +
    d.getMinutes() + '.' +
    d.getSeconds() +
    '@example.com';
};

//Current request count
var tc = 0;

//Expected requests
var te = 0;

//Callback to keep track of when to
//complete the current test suite
var callback = function(test) {
  tc++;
  if(tc === te) {
    test.done();
  }
};

//Message for a successful request
var msgGood = 'Go Good';

//Create a mock server to POST to.
http.createServer(function (req, res) {
  req.body = '';

  req.on('data', function(data) {
    req.body += data;
  });

  req.on('end', function() {
    var body = JSON.parse(req.body);

    res.writeHead(200, {'Content-Type': 'text/plain'});

    //Test the POST for the required data.
    if(!body.api_key || body.api_key.length < 1) {
      res.end('API key is not defined.');
    } else if(!body.data) {
      res.end('Request has no data.');
    } else {
      res.end(msgGood);
    }
  });
}).listen(9001);

module.exports = {
  setUp: function(done) {
    bb.key = 'KEY1234567890';
    bb._url = 'http://localhost:9001/';
    bb.debug = true;

    done();
  },

  'acquisitions': function(test) {
    te = 14;
    test.expect(te);

    var email = getEmail();
    var obj = {
      email : email
    };

    test.deepEqual(
      bb._acquisition(obj),
      {email : email},
      'validation should accept email as a string.'
    );

    obj.email = 1;

    test.strictEqual(
      bb._acquisition(obj),
      null,
      'validation should only accept email as a string.'
    );

    obj.email = email;
    obj.level = 1;

    test.deepEqual(
      bb._acquisition(obj),
      {email : email, level : 1},
      'validation should accept email(string) and level(number).'
    );

    obj.level = '';

    test.deepEqual(
      bb._acquisition(obj),
      {email : email},
      'validation should strip level if not a number.'
    );

    obj.level = 1;
    obj.occurred_at = 'DATE';

    test.deepEqual(
      bb._acquisition(obj),
      {email : email, level : 1, occurred_at : 'DATE'},
      'validation should accept email(string), level(number) and occurred_at(string).'
    );

    obj.occurred_at = 1;

    test.deepEqual(
      bb._acquisition(obj),
      {email : email, level : 1},
      'validation should strip date if not a string.'
    );

    tc = 6;

    bb.acquisition(email, 1, function(err, res) {
      test.strictEqual(
        err, null,
        'err should be null when sending a single acquisition.'
      );

      callback(test);

      test.strictEqual(
        res, msgGood,
        'response should be "' + msgGood + '" when sending a single acquisition.'
      );

      callback(test);
    });

    bb.acquisition(1, 1, function(err, res) {
      test.notStrictEqual(
        err, null,
        'err should not be null when sending an invalid acquisition.'
      );

      callback(test);

      test.strictEqual(
        res, null,
        'response should be null when sending an invalid acquisition.'
      );

      callback(test);
    });

    bb.acquisitions([
      {email : getEmail()},
      {email : getEmail()},
      {email : getEmail()},
      {email : getEmail()}
    ], function(err, res) {
      test.strictEqual(
        err, null,
        'err should be null when sending multiple acquisitions.'
      );

      callback(test);

      test.strictEqual(
        res, msgGood,
        'response should be "' + msgGood + '" when sending multiple acquisitions.'
      );

      callback(test);
    });

    bb.acquisitions([
      {email : getEmail()},
      {email : getEmail()},
      {},
      {email : getEmail()}
    ], function(err, res) {
      test.notStrictEqual(
        err, null,
        'err should not be null when sending multiple acquisitions with any invalid entries.'
      );

      callback(test);

      test.strictEqual(
        res, null,
        'response should be null when sending multiple acquisitions with one or more invalid.'
      );

      callback(test);
    });
  },

  'activations': function(test) {
    te = 12;
    test.expect(te);

    var email = getEmail();
    var obj = {
      email : email
    };

    test.deepEqual(
      bb._activation(obj),
      {email : email},
      'validation should accept email as a string.'
    );

    obj.email = 1;

    test.strictEqual(
      bb._activation(obj),
      null,
      'validation should only accept email as a string.'
    );

    obj.email = email;
    obj.occurred_at = 'DATE';

    test.deepEqual(
      bb._activation(obj),
      {email : email, occurred_at : 'DATE'},
      'validation should accept email(string) and occurred_at(string).'
    );

    obj.occurred_at = 1;

    test.deepEqual(
      bb._activation(obj),
      {email : email},
      'validation should strip date if not a string.'
    );

    tc = 4;

    bb.activation(email, 1, function(err, res) {
      test.strictEqual(
        err, null,
        'err should be null when sending a single activation.'
      );

      callback(test);

      test.strictEqual(
        res, msgGood,
        'response should be "' + msgGood + '" when sending a single activation.'
      );

      callback(test);
    });

    bb.activation(1, 1, function(err, res) {
      test.notStrictEqual(
        err, null,
        'err should not be null when sending an invalid activation.'
      );

      callback(test);

      test.strictEqual(
        res, null,
        'response should be null when sending an invalid activation.'
      );

      callback(test);
    });

    bb.activations([
      {email : getEmail()},
      {email : getEmail()},
      {email : getEmail()},
      {email : getEmail()}
    ], function(err, res) {
      test.strictEqual(
        err, null,
        'err should be null when sending multiple activations.'
      );

      callback(test);

      test.strictEqual(
        res, msgGood,
        'response should be "' + msgGood + '" when sending multiple activations.'
      );

      callback(test);
    });

    bb.activations([
      {email : getEmail()},
      {email : getEmail()},
      {},
      {email : getEmail()}
    ], function(err, res) {
      test.notStrictEqual(
        err, null,
        'err should not be null when sending multiple activations with any invalid entries.'
      );

      callback(test);

      test.strictEqual(
        res, null,
        'response should be null when sending multiple activation with one or more invalid.'
      );

      callback(test);
    });
  },

  'retentions': function(test) {
    te = 12;
    test.expect(te);

    var email = getEmail();
    var obj = {
      email : email
    };

    test.deepEqual(
      bb._retention(obj),
      {email : email},
      'validation should accept email as a string.'
    );

    obj.email = 1;

    test.strictEqual(
      bb._retention(obj),
      null,
      'validation should only accept email as a string.'
    );

    obj.email = email;
    obj.occurred_at = 'DATE';

    test.deepEqual(
      bb._retention(obj),
      {email : email, occurred_at : 'DATE'},
      'validation should accept email(string) and occurred_at(string).'
    );

    obj.occurred_at = 1;

    test.deepEqual(
      bb._retention(obj),
      {email : email},
      'validation should strip date if not a string.'
    );

    tc = 4;

    bb.retention(email, 1, function(err, res) {
      test.strictEqual(
        err, null,
        'err should be null when sending a single retention.'
      );

      callback(test);

      test.strictEqual(
        res, msgGood,
        'response should be "' + msgGood + '" when sending a single retention.'
      );

      callback(test);
    });

    bb.retention(1, 1, function(err, res) {
      test.notStrictEqual(
        err, null,
        'err should not be null when sending an invalid retention.'
      );

      callback(test);

      test.strictEqual(
        res, null,
        'response should be null when sending an invalid retention.'
      );

      callback(test);
    });

    bb.retentions([
      {email : getEmail()},
      {email : getEmail()},
      {email : getEmail()},
      {email : getEmail()}
    ], function(err, res) {
      test.strictEqual(
        err, null,
        'err should be null when sending multiple retentions.'
      );

      callback(test);

      test.strictEqual(
        res, msgGood,
        'response should be "' + msgGood + '" when sending multiple retentions.'
      );

      callback(test);
    });

    bb.retentions([
      {email : getEmail()},
      {email : getEmail()},
      {},
      {email : getEmail()}
    ], function(err, res) {
      test.notStrictEqual(
        err, null,
        'err should not be null when sending multiple retentions with any invalid entries.'
      );

      callback(test);

      test.strictEqual(
        res, null,
        'response should be null when sending multiple retention with one or more invalid.'
      );

      callback(test);
    });
  },

 'referrals': function(test) {
    te = 13;
    test.expect(te);

    var email = getEmail();
    var obj = {
      customer_email : email,
      referree_email : email
    };

    test.deepEqual(
      bb._referral(obj),
      {customer_email : email, referree_email : email},
      'validation should accept customer_email and referree_email, both as a string.'
    );

    obj.customer_email = 1;

    test.strictEqual(
      bb._referral(obj),
      null,
      'validation should only accept customer_email as a string'
    );

    obj.customer_email = email;
    obj.referree_email = 1;

    test.strictEqual(
      bb._referral(obj),
      null,
      'validation should only accept referree_email as a string'
    );

    obj.referree_email = email;
    obj.occurred_at = 'DATE';

    test.deepEqual(
      bb._referral(obj),
      {customer_email : email, referree_email : email, occurred_at : 'DATE'},
      'validation should accept customer_email(string), referree_email(string), and occurred_at(string).'
    );

    obj.occurred_at = 1;

    test.deepEqual(
      bb._referral(obj),
      {customer_email : email, referree_email : email},
      'validation should strip date if not a string.'
    );

    tc = 5;

    bb.referral(email, email, function(err, res) {
      test.strictEqual(
        err, null,
        'err should be null when sending a single referral.'
      );

      callback(test);

      test.strictEqual(
        res, msgGood,
        'response should be "' + msgGood + '" when sending a single referral.'
      );

      callback(test);
    });

    bb.referral(1, 1, function(err, res) {
      test.notStrictEqual(
        err, null,
        'err should not be null when sending an invalid referral.'
      );

      callback(test);

      test.strictEqual(
        res, null,
        'response should be null when sending an invalid referral.'
      );

      callback(test);
    });

    bb.referrals([
      {customer_email : email, referree_email : email},
      {customer_email : email, referree_email : email},
      {customer_email : email, referree_email : email},
      {customer_email : email, referree_email : email}
    ], function(err, res) {
      test.strictEqual(
        err, null,
        'err should be null when sending multiple referrals.'
      );

      callback(test);

      test.strictEqual(
        res, msgGood,
        'response should be "' + msgGood + '" when sending multiple referrals.'
      );

      callback(test);
    });

    bb.referrals([
      {customer_email : email, referree_email : email},
      {customer_email : email, referree_email : email},
      {customer_email : email, referree_email : email},
      {}
    ], function(err, res) {
      test.notStrictEqual(
        err, null,
        'err should not be null when sending multiple referrals with invalid entries.'
      );

      callback(test);

      test.strictEqual(
        res, null,
        'response should be null when sending multiple referrals with one or more invalid.'
      );

      callback(test);
    });
  },

 'revenues': function(test) {
    te = 13;
    test.expect(te);

    var email = getEmail();
    var amount = 421;
    var obj = {
      email : email,
      amount_in_cents : amount
    };

    test.deepEqual(
      bb._revenue(obj),
      {email : email, amount_in_cents : amount},
      'validation should accept email(string) and amount_in_cents(number).'
    );

    obj.email = 1;

    test.strictEqual(
      bb._revenue(obj),
      null,
      'validation should only accept email as a string.'
    );

    obj.email = email;
    obj.amount_in_cents = '';

    test.strictEqual(
      bb._revenue(obj),
      null,
      'validation should only accept amount_in_cents as a number.'
    );

    obj.amount_in_cents = amount;
    obj.occurred_at = 'DATE';

    test.deepEqual(
      bb._revenue(obj),
      {email : email, amount_in_cents : amount, occurred_at : 'DATE'},
      'validation should accept email(string), amount_in_cents(number), and occurred_at(string).'
    );

    obj.occurred_at = 1;

    test.deepEqual(
      bb._revenue(obj),
      {email : email, amount_in_cents : amount},
      'validation should strip date if not a string.'
    );

    tc = 5;

    bb.revenue(email, amount, function(err, res) {
      test.strictEqual(
        err, null,
        'err should be null when sending a single revenue.'
      );

      callback(test);

      test.strictEqual(
        res, msgGood,
        'response should be "' + msgGood + '" when sending a single revenue.'
      );

      callback(test);
    });

    bb.revenue(1, '', function(err, res) {
      test.notStrictEqual(
        err, null,
        'err should not be null when sending an invalid revenue.'
      );

      callback(test);

      test.strictEqual(
        res, null,
        'response should be null when sending an invalid revenue.'
      );

      callback(test);
    });

    bb.revenues([
      {email : email, amount_in_cents : amount},
      {email : email, amount_in_cents : amount},
      {email : email, amount_in_cents : amount},
      {email : email, amount_in_cents : amount}
    ], function(err, res) {
      test.strictEqual(
        err, null,
        'err should be null when sending multiple revenues.'
      );

      callback(test);

      test.strictEqual(
        res, msgGood,
        'response should be "' + msgGood + '" when sending multiple revenues.'
      );

      callback(test);
    });

    bb.revenues([
      {email : email, amount_in_cents : amount},
      {email : email, amount_in_cents : amount},
      {email : email, amount_in_cents : amount},
      {}
    ], function(err, res) {
      test.notStrictEqual(
        err, null,
        'err should not be null when sending multiple revenues with invalid entries.'
      );

      callback(test);

      test.strictEqual(
        res, null,
        'response should be null when sending multiple revenues with one or more invalid.'
      );

      callback(test);
    });
  }
};