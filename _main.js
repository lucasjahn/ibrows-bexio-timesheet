var menubar = require('menubar');
var request = require('request');
const {BrowserWindow} = require('electron');

var mb = menubar();

mb.on('ready', function ready () {
    console.log('app is ready');
    getAccessToken();
});

require('request-debug')(request);


function getAccessToken() {
    // bexio Applications Credentials
    var options = {
        client_id: '6777100542.apps.bexio.com',
        client_secret: 'FfdjCu3Q3Rp8Ujmcch2iFGHJC3o=',
        redirectUrl: 'http://www.google.de',
        state: Math.random().toString(36).substring(7),
        scopes: [
            'article_show',
            'calendar_show',
            'contact_show',
            'lead_show',
            'task_show'
        ]
    };

    // Build the OAuth consent page URL
    var authWindow = new BrowserWindow({width: 800, height: 600, show: false, 'node-integration': false});
    var bexiobUrl = 'https://office.bexio.com/oauth/authorize';
    var authUrl = bexiobUrl + '?client_id=' + options.client_id + '&redirect_uri=' + options.redirectUrl + '&state=' + options.state + '&scope=' + options.scopes.join('%20');
    authWindow.loadURL(authUrl);
    authWindow.show();

    function handleCallback(url) {
        var raw_code = /code=([^&]*)/.exec(url) || null;
        var code = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
        var error = /\?error=(.+)$/.exec(url);

        if (code || error) {
            // Close the browser if code found or error
            //authWindow.destroy();
        }

        // If there is a code, proceed to get token from github
        if (code) {
            requestToken(options, code);
        } else if (error) {
            alert('Oops! Something went wrong and we couldn\'t' +
                'log you in using Bexio. Please try again.');
        }
    }

    function requestToken(options, code) {
        request({
                method: 'post',
                qs: {
                    'client_id': options.client_id,
                    'client_secret': options.client_secret,
                    'redirect_uri': options.redirectUrl,
                    'code': code
                },
                json: true,
                url: 'https://office.bexio.com/oauth/access_token'
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body)
                }
            }
        );
    }

    authWindow.webContents.on('will-navigate', function (event, url) {
        handleCallback(url);
        console.log(`Will navigate: \n ${url} \n-------------\n`);
    });

   authWindow.webContents.on('did-get-redirect-request', function (event, oldUrl, newUrl) {
       console.log(`did-get-redirect-request: \n${oldUrl} to ${newUrl} \n-------------\n`);
        handleCallback(newUrl);
    });

    // Reset the authWindow on close
    authWindow.on('close', function () {
        authWindow = null;
    }, false);
}

// Set the client credentials and the OAuth2 server
var credentials = {
    clientID: '6777100542.apps.bexio.com',
    clientSecret: 'FfdjCu3Q3Rp8Ujmcch2iFGHJC3o=',
    site: 'https://office.bexio.com/oauth/access_token'
};

// Initialize the OAuth2 Library
var oauth2 = require('simple-oauth2')(credentials);

// Authorization oauth2 URI
var authorization_uri = oauth2.authCode.authorizeURL({
    redirect_uri: 'http://www.google.de',
    scope: [
        'article_show',
        'calendar_show',
        'contact_show',
        'lead_show',
        'task_show'
    ],
    state: Math.random().toString(36).substring(7)
});

// Redirect example using Express (see http://expressjs.com/api.html#res.redirect)
res.redirect(authorization_uri);

// Get the access token object (the authorization code is given from the previous step).
var token;
var tokenConfig = {
    code: '<code>',
    redirect_uri: 'http://localhost:3000/callback'
};

// Callbacks
// Save the access token
oauth2.authCode.getToken(tokenConfig, function saveToken(error, result) {
    if (error) { console.log('Access Token Error', error.message); }

    token = oauth2.accessToken.create(result);
});

// Promises
// Save the access token
oauth2.authCode.getToken(tokenConfig)
    .then(function saveToken(result) {
        token = oauth2.accessToken.create(result);
    })
    .catch(function logError(error) {
        console.log('Access Token Error', error.message);
    });