
let action = false;

const authenticateButton = document.getElementById('authenticate');

authenticateButton.addEventListener('click', () => {
    console.log(action ? 'action' : 'no action');
})

const authModeDiv = document.getElementById('auth_mode');
let loginModeDiv = document.getElementById('login_mode');

chrome.storage.local.get('my_leethub_token', (data) => {
  const token = data.leethub_token;
  if (token === null || token === undefined) {
    action = true;
    authModeDiv.style.display = 'block';
  } else {
    loginModeDiv.style.display = 'block';
    loginModeDiv.innerHTML = `<p>Token: ${token}</p>`
  }
});




