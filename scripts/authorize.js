const localAuth = {
  
    init() {
        this.KEY = 'my_leethub_token';
        this.ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';
        this.AUTHORIZATION_URL = 'https://github.com/login/oauth/authorize';
        this.AUTHENTICATION_URL = 'https://api.github.com/user';
        this.CLIENT_ID = '79ff9c138224ad3504ba';
        this.CLIENT_SECRET = '182d799f25b522dcd654d77eee85a88e01e20144';
        this.REDIRECT_URL = 'https://github.com/'; 
        this.SCOPES = ['repo'];
    },

    parseAccessCode(url) {
        if (url.match(/\?error=(.+)/)) { //close current tab if there's any error
            chrome.tabs.getCurrent(function (tab) {
                chrome.tabs.remove(tab.id, function () {});
            }); 
        } else { //extract the session code, use this code to exchange for a oauth2 access token
            this.requestToken(url.match(/\?code=([\w\/\-]+)/)[1]);
        }
    },

    requestToken(code) {
        const options = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                client_id: this.CLIENT_ID,
                client_secret: this.CLIENT_SECRET,
                code: code
            })
        }

        fetch(this.ACCESS_TOKEN_URL, options) //post request to this url, passing in code in request body
        .then(res => res.text()) //response contains the issued access token 
        .then(responseText => {
            console.log(responseText)
            this.finish(responseText.match(/access_token=([^&]*)/)[1]); //extract the access token from response
        })
            
    },

    finish(token) {
        /* Get username */
        // To validate user, load user object from GitHub.
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }

        fetch(this.AUTHENTICATION_URL, options)
        .then(res => res.text())
        .then(responseText => JSON.parse(responseText).login) //extracts github username
        .then(username => {
            chrome.runtime.sendMessage({
                closeWebPage: true,
                isSuccess: true,
                token,
                username,
                KEY: this.KEY
            })
        })
    },
}

localAuth.init();
const link = window.location.href; 
//after redirecting, the url will be https://github.com/?code=<the-returned-session-code>

/* Check for open pipe established from oauth2 */
if (window.location.host === 'github.com') {
  chrome.storage.local.get('my_pipe_leethub', (data) => {
    if (data && data.my_pipe_leethub) {
      localAuth.parseAccessCode(link);
    }
  });
}
