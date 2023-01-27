function handleMessage(request) {
  if (request && request.closeWebPage && request.isSuccess) {
    //these conditions are specified in the message body after successful authorization 
    /* Set username */
    chrome.storage.local.set({ leethub_username: request.username }); //same as extracted github username

    /* Set token */
    chrome.storage.local.set({ my_leethub_token: request.token });

    /* Close pipe */
    chrome.storage.local.set(
        { pipe_leethub: false }, 
        () => console.log('Closed pipe. Going to onboarding page')
    );

    chrome.tabs.query({ active: true }, tabs => chrome.tabs.remove(tabs[0].id)); 

    /* Go to onboarding for UX */
    const urlOnboarding = chrome.runtime.getURL('welcome.html');
    chrome.tabs.create({ url: urlOnboarding, active: true }); // creates new tab

  } else {
    alert('Something went wrong while trying to authenticate your profile!');
    chrome.tabs.query({ active: true }, tabs => chrome.tabs.remove(tabs[0].id)); 
  }
}

chrome.runtime.onMessage.addListener(handleMessage); //background function only triggered on message
