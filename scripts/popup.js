
let action = false;

$('#authenticate').on('click', () => {
  if (action) {
    oAuth2.begin();
  }
});

/* Get URL for welcome page */
$('#welcome_URL').attr(
  'href',
  chrome.runtime.getURL('welcome.html')
);
$('#hook_URL').attr(
  'href',
  chrome.runtime.getURL('welcome.html')
);


chrome.storage.local.get('my_leethub_token', data => {
  const token = data.my_leethub_token;
  if (token === null || token === undefined) {
    /* no leethub token means user hasn't granted leethub access to user's github account
      display auth mode
    */
    console.log('no leethub token, begin oAuth');
    action = true;
    $('#auth_mode').show();
  } else {
    /*user has already granted leethub access to github
    still need to use the token issued (by github) upon granting permission to verify user 
    token is used as a ticket for leethub service to access github service on hehalf of user
    so we put this token into request body and send this request to github to seek verification
    */
    const GITHUB_AUTH_URL = 'https://api.github.com/user';
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    fetch(GITHUB_AUTH_URL, options)
    .then(res => {
      if (res.status == 200) {
        /*user authenticated
        show main features
        */
        chrome.storage.local.get('mode_type', data2 => {
          const mode = data2.mode_type;
          if (mode && mode === 'commit') {
            //commit mode
            $('#commit_mode').show();

            chrome.storage.local.get('stats', data3 => {
              const stats = data3.stats;
              if (stats) {
                const {easy, medium, hard, solved} = stats;
                $('#p_solved').text(solved);
                $('#p_solved_easy').text(easy);
                $('#p_solved_medium').text(medium);
                $('#p_solved_hard').text(hard);
              }
            });

            chrome.storage.local.get('my_leethub_hook', data4 => {
              const leethubHook = data4.my_leethub_hook;
                if (leethubHook) {
                  $('#repo_url').html(
                    `<a target="blank" style="color: cadetblue !important; font-size:0.8em;" href="https://github.com/${leethubHook}">${leethubHook}</a>`,
                  );
              }
            });
          } else {
            //hook mode
            $('#hook_mode').show();
          }
        })
      } else {
         /*user not authenticated
        redirect to oAuth step
        */
        console.log('BAD oAuth');
        action = true;
        $('#auth_mode').show();
      }
    });
  }
});




