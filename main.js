const electronOauth2 = require('electron-oauth2');
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
    'task_show'
];

mb.on('ready', () => {
    const windowParams = {
        alwaysOnTop: true,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false
        },
        closable: false
    }

    const options = {
        scope: scopes.join('%20'),
        state: Math.random().toString(36).substring(7)
    };

    const myApiOauth = electronOauth2(config, windowParams);

    myApiOauth.getAccessToken(options)
        .then(token => {
        console.log(token);
    });
});