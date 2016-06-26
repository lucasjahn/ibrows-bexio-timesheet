const electron = require('electron');
const app = electron.app;  // Module to control application life.

const storage = require('electron-json-storage');
const request = require('request');
const queryString = require('querystring');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform != 'darwin') {
        app.quit();
    }
});


var menubar = require('menubar');

var mb = menubar({
    index: 'file://' + __dirname + '/app/index.html',
    width: 400,
    height: 400,
    resizable: false,
    'preload-window': true
});

//var AutoLaunch = require('auto-launch');

/*var appLauncher = new AutoLaunch({
    name: 'My NW.js or Electron app'
});

appLauncher.isEnabled().then(function(enabled){
    if(enabled) return;
    return appLauncher.enable()
}).then(function(err){

});

appLauncher.enable(); */

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
    console.log('opened!');
    /*storage.clear(function(error) {
        if (error) throw error;
    });*/

    /*storage.has('token', function(error, hasKey) {
        if (error) throw error;

        if (!hasKey) {
            getAcessToken();
        } else {
            mb.showWindow();
            getTimes();
        }
    });*/
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