const oAuth2 = {

    init() {
        this.KEY = 'my_leethub_token';
        this.ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';
        this.AUTHORIZATION_URL = 'https://github.com/login/oauth/authorize';
        this.CLIENT_ID = '79ff9c138224ad3504ba';
        this.CLIENT_SECRET = '182d799f25b522dcd654d77eee85a88e01e20144';
        this.REDIRECT_URL = 'https://github.com/'; 
        this.SCOPES = ['repo'];
    },

    async begin() {
        this.init();

        let url = `${this.AUTHORIZATION_URL}?client_id=${this.CLIENT_ID}&redirect_uri=${this.REDIRECT_URL}&scope=${this.SCOPES[0]}`;
        //https://github.com/login/oauth/authorize?client_id=79ff9c138224ad3504ba&redirect_uri=https://github.com/&scope=repo

        await chrome.storage.local.set({my_pipe_leethub: true});
        await chrome.tabs.create({url, active: true}); //open up redirect url in a new tab
        //will trigger content script authorize.js to run (because content script is configured to run when url matches github.com/*)
        //will check if there's a open pipe, and if so, issue a leethub token
    }
}