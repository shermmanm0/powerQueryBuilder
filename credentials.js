var https = require('https');
var url = require('url');
var fs = require('fs');
var args = process.argv.splice(2);
var powerschoolServerUrl = "https://cristoreyrichmond.powerschool.com/";
var id = "e534cabc-b960-44ed-b3f5-6db090b07a33";
var secret = "f5c63bfc-e708-40bc-b21e-a7ade83d57d8";

var credentials = (new Buffer(id + ":" +secret)).toString('base64');

var options = url.parse(powerschoolServerUrl);
options.path = '/oauth/access_token';
options.method = 'POST';
options.headers = {
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    'Authorization': 'Basic ' + credentials
};

var req = https.request(options, function(res) {
    console.log('statusCode: ', res.statusCode);
    var data = '';
    res.on('data', function(d) {
        data += d;
    });
    res.on('end', function(){
        if (data !== '') {
            try {
                var obj = JSON.parse(data);
                console.log(require('util').inspect(obj, false, null));
                fs.writeFileSync('credentials.txt',require('util').inspect(obj, false, null));
            } catch ( exception ) {
                if (exception instanceof SyntaxError ) {
                    console.log(data);
                } else {
                    throw exception;
                } 
            }		           
        }
    });
});

req.write("grant_type=client_credentials");
req.end();

req.on('error', function(e) {
    console.error('Powerschool test server not found, please check the PowerSchool URL and try again\n' + e);
});