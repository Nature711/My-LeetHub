
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


chrome.storage.local.get('my_leethub_token', (data) => {
  const token = data.my_leethub_token;
  if (token === null || token === undefined) {
    action = true;
    $('#auth_mode').show();
  } else {
    $('#hook_mode').show();
  }
});




