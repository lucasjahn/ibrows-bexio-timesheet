const electronOauth2 = require('electron-oauth2');
const storage = require('electron-json-storage');
const request = require('request');
const queryString = require('querystring');
var menubar = require('menubar');

var mb = menubar();

var config = {
    clientId: '6777100542.apps.bexio.com',
    clientSecret: 'FfdjCu3Q3Rp8Ujmcch2iFGHJC3o=',
    authorizationUrl: 'https://office.bexio.com/oauth/authorize',
    tokenUrl: 'https://office.bexio.com/oauth/access_token',
    useBasicAuthorizationHeader: false
};

let scopes = [
    'article_show',
    'calendar_show',
    'contact_show',
    'lead_show',
    'task_show',
    'monitoring_show',
    'monitoring_edit',

];

mb.on('ready', () => {
    /*storage.clear(function(error) {
        if (error) throw error;
    });*/

    storage.has('token', function(error, hasKey) {
        if (error) throw error;

        if (!hasKey) {
            getAcessToken();
        } else {
            mb.showWindow();
            getTimes();
        }
    });
});

mb.on('after-create-window', () => {

});

function getAcessToken() {
    const windowParams = {
        width: 800,
        height: 600,
        alwaysOnTop: true,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false
        },
        closable: false,
        frame: false,
        center: true
    };

    const options = {
        scope: scopes.join(' '),
        state: Math.random().toString(36).substring(7)
    };

    const myApiOauth = electronOauth2(config, windowParams);

    // Get access token promise (electron-oauth2)
    myApiOauth.getAccessToken(options)
        .then(token => {
            if(token.access_token) {
                storage.set('token', token, function(error) {
                    if (error) throw error;
                });

                return true;
            } else {
                return false;
            }
        });
}

function getTimes() {
    storage.get('token', function(error, data) {
        const header = {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + data['access_token']
        };


        if (error) {
            getAcessToken();
        } else {
            /*return fetch('https://office.bexio.com/' + data.org + '/timesheet', {
                method: 'GET',
                headers: header,
                body: queryString.stringify(data)
            }).then(res => {

                return res.json();
            }).then(function(json) {
                console.log('lol');
                console.log(json);
            });*/

            //Lets configure and request

            request({
                url: 'https://office.bexio.com/api2.php/' + data.org + '/timesheet/search', //URL to hit
                qs: {}, //Query string data
                method: 'POST', //Specify the method
                headers: { //We can define headers too
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + data['access_token']
                },
                body: `[
                    {
                        "field": "user_id",
                        "value": ${data['user_id']}
                    }
                ]`
            }, function(error, response, body){
                if(error) {
                    console.log(error);
                } else {
                    console.log(response.statusCode, body);
                }
            });
        }
    });
}