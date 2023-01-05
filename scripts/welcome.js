const option = () => $('#type').val(); //new for create new repo, link for link existing repo

const repositoryName = () => $('#name').val().trim(); //name of new/existing repo

const GITHUB_REPO_API = 'https://api.github.com/user/repos';

const createRepo = (token, repoName) => {
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
    .then(res => res.text())
    .then(responseText => showMessageCreateRepo(res.status, responseText));
}

const showMessageCreateRepo = (status, res) => {

    const { name, html_url, full_name } = res;

    switch (status) {
        case 304: 
            $('#success').hide();
            $('#error').text('Error creating repo: Not modified');
            $('#error').show();
            break;
        case 400: 
            $('#success').hide();
            $('#error').text('Error creating repo: Bad Request');
            $('#error').show();
            break;
        case 401: 
            $('#success').hide();
            $('#error').text('Error creating repo: Requires authentication');
            $('#error').show();
            break;
        case 403: 
            $('#success').hide();
            $('#error').text('Error creating repo: Forbidden');
            $('#error').show();
            break;
        case 404: 
            $('#success').hide();
            $('#error').text('Error creating repo: Resource not found');
            $('#error').show();
            break;
        case 422: 
            $('#success').hide();
            $('#error').text('Error creating repo: Validation failed / endpoint being spammed');
            $('#error').show();
            break;
            
        default: //status == 201: created
            chrome.storage.local.set({mode_type: 'commit'}, () => {
                $('#error').hide();
                $('#success').html(
                `Successfully created <a target="blank" href="${html_url}">${name}</a>. 
                Start <a href="http://leetcode.com">LeetCoding</a>!`,
                );
                $('#success').show();
                $('#unlink').show();

                document.getElementById('hook_mode').style.display = 'none';
                document.getElementById('commit_mode').style.display = 'inherit';
            });

            //set repo hook
            chrome.storage.local.set({leethub_hook: full_name}, 
                () => console.log('Successfully set new repo hook'));
            break;

        
    }
}

const linkRepo = (token, repoName) => {
    console.log('try to link repo')
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

    chrome.storage.local.get('leethub_token', (data) => {
      const token = data.leethub_token;
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
                linkRepo(token, `${username}/${repositoryName()}`);
            }
          });
      }
    });
  }
});
