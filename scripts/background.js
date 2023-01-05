function handleMessage(request) {
  if (request && request.closeWebPage && request.isSuccess) {
    //these conditions are specified in the message body after successful authorization 
    /* Set username */
    chrome.storage.local.set(
      { leethub_username: request.username }, //the extracted github username
      () => { window.localStorage.leethub_username = request.username; }
    );

    /* Set token */
    chrome.storage.local.set(
        { leethub_token: request.token }, 
        () => { window.localStorage[request.KEY] = request.token; }
    );

    /* Close pipe */
    chrome.storage.local.set(
        { pipe_leethub: false }, 
        () => console.log('Closed pipe.')
    );

    chrome.tabs.getSelected(null, tab => chrome.tabs.remove(tab.id));

    /* Go to onboarding for UX */
    const urlOnboarding = chrome.runtime.getURL('welcome.html');
    chrome.tabs.create({ url: urlOnboarding, active: true }); // creates new tab

  } else {
    alert('Something went wrong while trying to authenticate your profile!');
    chrome.tabs.getSelected(null, tab => chrome.tabs.remove(tab.id));
  }
}

chrome.runtime.onMessage.addListener(handleMessage); //background function only triggered on message
