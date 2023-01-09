const option = () => $('#type').val(); //new for create new repo, link for link existing repo

const repositoryName = () => $('#name').val().trim(); //name of new/existing repo

const createRepo = (token, repoName) => {
    const GITHUB_REPO_API = 'https://api.github.com/user/repos';
    const options = {
        method: 'POST',
        headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${token}`,
            'X-GitHub-Api-Version' : '2022-11-28'
        },
        body: JSON.stringify({
            name: repoName,
            description: 'Collection of LeetCode questions -- Created using My-LeetHub',
            private: true
        }) 
    };

    fetch(GITHUB_REPO_API, options)
    .then(res => showMessageCreateRepo(res.status, res.text()));
}

const showMessageCreateRepo = async (status, responseText) => {
    switch (status) {
        case 304: 
            $('#success').hide();
            $('#error').text('Error creating repo: Unable to modify repo');
            $('#error').show();
            break;
        case 400: 
            $('#success').hide();
            $('#error').text('Error creating repo: Bad Request');
            $('#error').show();
            break;
        case 401: 
            $('#success').hide();
            $('#error').text('Error creating repo: Unauthorized access to repo');
            $('#error').show();
            break;
        case 403: 
            $('#success').hide();
            $('#error').text('Error creating repo: Forbidden access to repo');
            $('#error').show();
            break;
        case 404: 
            $('#success').hide();
            $('#error').text('Error creating repo: Resource not found');
            $('#error').show();
            break;
        case 422: 
            $('#success').hide();
            $('#error').text('Error creating repo: Repo with the same name already exists');
            $('#error').show();
            break;
            
        default: //status == 201: created
            responseText = await responseText;
            const { name, html_url, full_name } = JSON.parse(responseText);

            chrome.storage.local.set({mode_type: 'commit'}, () => {
                $('#error').hide();
                $('#success').html(
                `Successfully created <a target="_blank" href="${html_url}">${name}</a>. 
                Start <a href="http://leetcode.com">LeetCoding</a>!`,
                );
                $('#success').show();
                $('#unlink').show();

                document.getElementById('hook_mode').style.display = 'none';
                document.getElementById('commit_mode').style.display = 'inherit';
            });
            //set repo hook
            chrome.storage.local.set({my_leethub_hook: full_name}, 
                () => console.log('Successfully set new repo hook'));
            break;
    }
}

/* 
    Method for linking hook with an existing repository 
    Steps:
    1. Check if existing repository exists and the user has write access to it.
    2. Link Hook to it (chrome Storage).
*/
const linkRepo = (token, hook) => {
    // GET REPO API: https://api.github.com/repos/OWNER/REPO
    const GET_REPO_API = `https://api.github.com/repos/${hook}`;

    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'X-GitHub-Api-Version' : '2022-11-28'
      }
    }

    fetch(GET_REPO_API, options)
    .then(res => showMessageLinkRepo(res.status, res.text()))
    .then(hasError => {
      if (hasError) {
        //failed to link repo --> switch to hook mode
        chrome.storage.local.set({ mode_type: 'hook' }, () => {
          console.log(`Error linking repo to LeetHub`);
        });
        /* Set Repo Hook to NONE */
        chrome.storage.local.set({ my_leethub_hook: null }, () => {
          console.log('Defaulted repo hook to NONE');
        });

        /* Hide accordingly */
        document.getElementById('hook_mode').style.display = 'inherit';
        document.getElementById('commit_mode').style.display = 'none';
      }
    });
}

const showMessageLinkRepo = async (status, responseText) => {
  let hasError = true;

  switch(status) {
    case 301: 
      $('#success').hide();
      $('#error').text('Error linking repo: Repo has been moved permanently');
      $('#error').show();
      break;
    case 403: 
      $('#success').hide();
      $('#error').text('Error linking repo: No write access to repo');
      $('#error').show();
      break;
    case 404: 
      $('#success').hide();
      $('#error').text('Error linking repo: Repo not found');
      $('#error').show();
      break;
    default: 
      responseText = await responseText;
      const { name, html_url, full_name } = JSON.parse(responseText);
      /* Successfully linked repo
        Change mode type to commit
        Save repo url to chrome storage */
        chrome.storage.local.set({
          mode_type: 'commit', 
          repo: html_url
        }, () => {
          $('#error').hide();
          $('#success').html(
            `Successfully linked <a target="_blank" href="${html_url}">${name}</a> to LeetHub. 
            Start <a href="http://leetcode.com">LeetCoding</a> now!`,
          ); //show success message
          $('#success').show();
          $('#unlink').show(); //show the line to allow unlink
        });

        /* Hide accordingly */
        document.getElementById('hook_mode').style.display = 'none';
        document.getElementById('commit_mode').style.display = 'inherit';

        /* set up repo hook */
        chrome.storage.local.set({my_leethub_hook: full_name}, 
          () => console.log('Successfully set new repo hook'));
        hasError = false;
        break;
  }
  return hasError;
}

/* disable get started button until a dropdown value has been selected */
$('#type').on('change', function () {
  const valueSelected = this.value;
  if (valueSelected) {
    $('#hook_button').attr('disabled', false);
  } else {
    $('#hook_button').attr('disabled', true);
  }
});

$('#hook_button').on('click', () => {
  /* on click should generate: 1) option 2) repository name */
  if (!option()) { //no dropdown value selected
    $('#error').text(
      'No option selected - Pick an option from dropdown menu below that best suits you!',
    );
    $('#error').show(); //show error prompt
  } else if (!repositoryName()) { //no repo name entered 
    $('#error').text(
      'No repository name added - Enter the name of your repository!',
    );
    $('#name').focus(); //highlight name field for which name should be entered 
    $('#error').show(); //show error prompt
  } else {
    $('#error').hide();
    $('#success').text('Attempting to create Hook... Please wait.'); //show success prompt
    $('#success').show(); 
  
    /*
    perform processing
    */
    chrome.storage.local.get('my_leethub_token', (data) => {
      const token = data.my_leethub_token;
      if (token === null || token === undefined) {
        /* Not authorized yet. */
        $('#error').text('Authorization error: LeetHub token not found');
        $('#error').show();
        $('#success').hide();
      } else if (option() == 'new') { //choose to create new repo
        createRepo(token, repositoryName());
      } else { //choose to link to existing repo
        chrome.storage.local.get('leethub_username', (data2) => {
            const username = data2.leethub_username;
            if (!username) {
              $('#error').text('Authorization error: LeetHub username not found');
              $('#error').show();
              $('#success').hide();
            } else {
              const hook = `${username}/${repositoryName()}`
              linkRepo(token, hook);
            }
          });
      }
    });
  }
});

const unlinkRepo = () => {
    /* Set Repo Hook to NONE */
    chrome.storage.local.set({ my_leethub_hook: null }, () => {
      console.log('Defaulted repo hook to NONE');
    });
    /* Set mode type to hook */
    chrome.storage.local.set({ mode_type: 'hook' }, () => {
      console.log(`Setting mode type back to hook`);
    });
    document.getElementById('hook_mode').style.display = 'inherit';
    document.getElementById('commit_mode').style.display = 'none';
}

$('#unlink a').on('click', () => {
  unlinkRepo();
  $('#unlink').hide();
  $('#success').text(
    'Successfully unlinked your current git repo. Please create/link a new hook.',
  );
});

/* Detect mode type and determine which content to display */
chrome.storage.local.get('mode_type', (data) => {
  const mode = data?.mode_type;

  if (mode && mode === 'commit') {
    /* Check if still access to repo 
    my_leethub_token is stored after authorizing leethub to access your github account*/
    chrome.storage.local.get('my_leethub_token', (data2) => {
      const token = data2.my_leethub_token;
      if (token === null || token === undefined) {
        /* Not authorized yet. */
        onError('Authorization error: Grant My-LeetHub access to your GitHub account first');
      } else {
        /* Get access to repo 
        my_leethub_hook is stored after linking your repo to leethub*/
        chrome.storage.local.get('my_leethub_hook', (data3) => {
          const hook = data3.my_leethub_hook; //full name of linked repo
          if (!hook) {
            /* Not authorized yet -- display hook mode */
            onError('Error: No repo linked');
          } else {
            linkRepo(token, hook);
            document.getElementById('hook_mode').style.display = 'none';
            document.getElementById('commit_mode').style.display = 'inherit';
          }
        });
      }
    });

  } else {
    //mode type is hook
    document.getElementById('hook_mode').style.display = 'inherit';
    document.getElementById('commit_mode').style.display = 'none';
  }
});

const onError = (message) => {
    $('#error').text(message);
    $('#error').show();
    $('#success').hide();
    /* Hide accordingly */
    chrome.storage.local.set({ mode_type: 'hook' }, () => {
      console.log(`Setting mode type back to hook`);
    });
    document.getElementById('hook_mode').style.display = 'inherit';
    document.getElementById('commit_mode').style.display = 'none';
}