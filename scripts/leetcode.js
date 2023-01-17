/* Enum for languages supported by LeetCode. */
const languages = {
    //algo & concurrency
    'C++': '.cpp',
    Java: '.java',
    Python: '.py',
    Python3: '.py',
    C: '.c',
    'C#': '.cs',
    JavaScript: '.js',
    Ruby: '.rb',
    Swift: '.swift',
    Go: '.go',
    Scala: '.scala',
    Kotlin: '.kt',
    Rust: '.rs',
    PHP: '.php',
    TypeScript: '.ts',
    Racket: '.rkt',
    Erlang: '.erl',
    Elixir: '.ex',
    Dart: '.dart',
    //sql
    MySQL: '.sql',
    'MS SQL Server': '.sql',
    Oracle: '.sql',
    //shell
    Bash: '.sh'
};

/* Commit messages */
const readmeMsg = 'Create README - LeetHub';
const discussionMsg = 'Prepend discussion post - LeetHub';
const createNotesMsg = 'Attach NOTES - LeetHub';

// problem types
const NORMAL_PROBLEM = 0;
const EXPLORE_SECTION_PROBLEM = 1;

/* Difficulty of most recenty submitted question */
let difficulty = '';

/* state of upload for progress */
let uploadState = { uploading: false };

/************
util functions 
*/

/* inject css style required for the upload progress feature */
function injectStyle() {
  const style = document.createElement('style');
  style.textContent =
    '.leethub_progress {pointer-events: none;width: 2.0em;height: 2.0em;border: 0.4em solid transparent;border-color: #eee;border-top-color: #3E67EC;border-radius: 50%;animation: loadingspin 1s linear infinite;} @keyframes loadingspin { 100% { transform: rotate(360deg) }}';
  document.head.append(style);
}

/* Get file extension for submission */
const findLanguage = () => {
    const languageSelected = document.getElementsByClassName('ant-select-selection-selected-value')[0].innerText;
    return languages[languageSelected];
}

/* Util function to check if an element exists */
function checkElem(elem) {
  return elem && elem.length > 0;
}

function convertToSlug(string) {
  const a =
    'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;';
  const b =
    'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------';
  const p = new RegExp(a.split('').join('|'), 'g');

  return string
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

function getProblemNameSlug() {
  const questionElem = document.getElementsByClassName(
    'content__u3I1 question-content__JfgR',
  );
  const questionDescriptionElem = document.getElementsByClassName(
    'question-description__3U1T',
  );
  let questionTitle = 'unknown-problem';
  if (checkElem(questionElem)) {
    let qtitle = document.getElementsByClassName('css-v3d350');
    if (checkElem(qtitle)) {
      questionTitle = qtitle[0].innerHTML;
    }
  } else if (checkElem(questionDescriptionElem)) {
    let qtitle = document.getElementsByClassName('question-title');
    if (checkElem(qtitle)) {
      questionTitle = qtitle[0].innerText;
    }
  }
  return addLeadingZeros(convertToSlug(questionTitle));
}

function addLeadingZeros(title) {
  const maxTitlePrefixLength = 4;
  var len = title.split('-')[0].length;
  if (len < maxTitlePrefixLength) {
    return '0'.repeat(4 - len) + title;
  }
  return title;
}

/* Parser function for the question and tags */
function parseQuestion() {
  var questionUrl = window.location.href;
  if (questionUrl.endsWith('/submissions/')) {
    questionUrl = questionUrl.substring(
      0,
      questionUrl.lastIndexOf('/submissions/') + 1,
    );
  }
  const questionElem = document.getElementsByClassName(
    'content__u3I1 question-content__JfgR',
  );
  const questionDescriptionElem = document.getElementsByClassName(
    'question-description__3U1T',
  );
  if (checkElem(questionElem)) {
    const qbody = questionElem[0].innerHTML;

    // Problem title.
    let qtitle = document.getElementsByClassName('css-v3d350');
    if (checkElem(qtitle)) {
      qtitle = qtitle[0].innerHTML;
    } else {
      qtitle = 'unknown-problem';
    }

    // Problem difficulty, each problem difficulty has its own class.
    const isHard = document.getElementsByClassName('css-t42afm');
    const isMedium = document.getElementsByClassName('css-dcmtd5');
    const isEasy = document.getElementsByClassName('css-14oi08n');

    if (checkElem(isEasy)) {
      difficulty = 'Easy';
    } else if (checkElem(isMedium)) {
      difficulty = 'Medium';
    } else if (checkElem(isHard)) {
      difficulty = 'Hard';
    }
    // Final formatting of the contents of the README for each problem
    const markdown = `<h2><a href="${questionUrl}">${qtitle}</a></h2><h3>${difficulty}</h3><hr>${qbody}`;
    return markdown;
  } else if (checkElem(questionDescriptionElem)) {
    let questionTitle = document.getElementsByClassName(
      'question-title',
    );
    if (checkElem(questionTitle)) {
      questionTitle = questionTitle[0].innerText;
    } else {
      questionTitle = 'unknown-problem';
    }

    const questionBody = questionDescriptionElem[0].innerHTML;
    const markdown = `<h2>${questionTitle}</h2><hr>${questionBody}`;

    return markdown;
  }
  return null;
}

/* Parser function for time/space stats */
function parseStats() {
  const probStats = document.getElementsByClassName('data__HC-i');
  if (!checkElem(probStats)) {
    return null;
  }
  const time = probStats[0].textContent;
  const timePercentile = probStats[1].textContent;
  const space = probStats[2].textContent;
  const spacePercentile = probStats[3].textContent;

  // Format commit message
  return `Time: ${time} (${timePercentile}), Space: ${space} (${spacePercentile}) - LeetHub`;
}

/* function to get the notes if there is any
 the note should be opened atleast once for this to work
 this is because the dom is populated after data is fetched by opening the note */
function getNotesIfAny() {
  // there are no notes on expore
  if (document.URL.startsWith('https://leetcode.com/explore/'))
    return '';

  notes = '';
  if (
    checkElem(document.getElementsByClassName('notewrap__eHkN')) &&
    checkElem(
      document
        .getElementsByClassName('notewrap__eHkN')[0]
        .getElementsByClassName('CodeMirror-code'),
    )
  ) {
    notesdiv = document
      .getElementsByClassName('notewrap__eHkN')[0]
      .getElementsByClassName('CodeMirror-code')[0];
    if (notesdiv) {
      for (i = 0; i < notesdiv.childNodes.length; i++) {
        if (notesdiv.childNodes[i].childNodes.length == 0) continue;
        text = notesdiv.childNodes[i].childNodes[0].innerText;
        if (text) {
          notes = `${notes}\n${text.trim()}`.trim();
        }
      }
    }
  }
  return notes.trim();
}


/* we will need specific anchor element that is specific to the page you are in Eg. Explore */
function insertToAnchorElement(elem) {
  if (document.URL.startsWith('https://leetcode.com/explore/')) {
    // means we are in explore page
    action = document.getElementsByClassName('action');
    if (
      checkElem(action) &&
      checkElem(action[0].getElementsByClassName('row')) &&
      checkElem(
        action[0]
          .getElementsByClassName('row')[0]
          .getElementsByClassName('col-sm-6'),
      ) &&
      action[0]
        .getElementsByClassName('row')[0]
        .getElementsByClassName('col-sm-6').length > 1
    ) {
      target = action[0]
        .getElementsByClassName('row')[0]
        .getElementsByClassName('col-sm-6')[1];
      elem.className = 'pull-left';
      if (target.childNodes.length > 0)
        target.childNodes[0].prepend(elem);
    }
  } else {
    if (checkElem(document.getElementsByClassName('action__38Xc'))) {
      target = document.getElementsByClassName('action__38Xc')[0];
      elem.className = 'runcode-wrapper__8rXm';
      if (target.childNodes.length > 0)
        target.childNodes[0].prepend(elem);
    }
  }
}

/* start upload will inject a spinner on left side to the "Run Code" button */
function startUpload() {
  try {
    elem = document.getElementById('leethub_progress_anchor_element');
    if (!elem) {
      elem = document.createElement('span');
      elem.id = 'leethub_progress_anchor_element';
      elem.style = 'margin-right: 20px;padding-top: 2px;';
    }
    elem.innerHTML = `<div id="leethub_progress_elem" class="leethub_progress"></div>`;
    target = insertToAnchorElement(elem);
    // start the countdown
    startUploadCountDown();
  } catch (error) {
    // generic exception handler for time being so that existing feature doesnt break but
    // error gets logged
    console.log(error);
  }
}

/* Since we dont yet have callbacks/promises that helps to find out if things went bad */
/* we will start 10 seconds counter and even after that upload is not complete, then we conclude its failed */
function startUploadCountDown() {
  uploadState.uploading = true;
  uploadState['countdown'] = setTimeout(() => {
    if ((uploadState.uploading = true)) {
      // still uploading, then it failed
      uploadState.uploading = false;
      markUploadFailed();
    }
  }, 10000);
}

/* This will create a tick mark before "Run Code" button signalling LeetHub has done its job */
function markUploaded() {
  elem = document.getElementById('leethub_progress_elem');
  if (elem) {
    elem.className = '';
    style =
      'display: inline-block;transform: rotate(45deg);height:24px;width:12px;border-bottom:7px solid #78b13f;border-right:7px solid #78b13f;';
    elem.style = style;
  }
}

/* This will create a failed tick mark before "Run Code" button signalling that upload failed */
function markUploadFailed() {
  elem = document.getElementById('leethub_progress_elem');
  if (elem) {
    elem.className = '';
    style =
      'display: inline-block;transform: rotate(45deg);height:24px;width:12px;border-bottom:7px solid red;border-right:7px solid red;';
    elem.style = style;
  }
}

/************* 
 main functions 
*/

const upload = (token, hook, code, directory, filename, sha, msg, cb = undefined) => {
  //from github docs: api endpoint for creating or updating file contents
    const UPLOAD_URL = `https://api.github.com/repos/${hook}/contents/${directory}/${filename}`;

    const options = {
        method: 'PUT',
        headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            message: msg,
            content: code,
            sha
        })
    }
    
    fetch(UPLOAD_URL, options)
    .then(res => res.status == 200 || res.status == 201 ? res.text() : null)
    .then(responseText => {
        if (responseText) {
            const updatedSha = JSON.parse(responseText).content.sha;
    
            chrome.storage.local.get('stats', (data) => {
                let {stats} = data;
                if (!stats) {
                    // create stats object
                    stats = {};
                    stats.solved = 0;
                    stats.easy = 0;
                    stats.medium = 0;
                    stats.hard = 0;
                    stats.sha = {};
                }
                const filePath = directory + filename;
                // Only increment solved problems statistics once
                // New submission commits twice (README and problem)
                if (filename === 'README.md' && sha === null) {
                    stats.solved += 1;
                    stats.easy += difficulty === 'Easy' ? 1 : 0;
                    stats.medium += difficulty === 'Medium' ? 1 : 0;
                    stats.hard += difficulty === 'Hard' ? 1 : 0;
                }
                stats.sha[filePath] = updatedSha; // update sha key.
                chrome.storage.local.set({ stats }, () => {
                    console.log(`Successfully committed ${filename} to github`);

                    // if callback is defined, call it
                    if (cb !== undefined) {
                        cb();
                    }
                })
            })
        }
    })
}

/* Main function for updating code on GitHub Repo */
/* Currently only used for prepending discussion posts to README */
/* callback cb is called on success if it is defined */
const update = (token, hook, addition, directory, msg, prepend, cb = undefined) => {
  //existing content of README 
  const URL = `https://api.github.com/repos/${hook}/contents/${directory}/README.md`;

  const options = {
      method: 'GET',
      headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
          message: msg,
          content: code,
          sha
      })
  }

  fetch(URL, options)
  .then(res => res.status == 200 || res.status == 201 ? res.text() : null)
  .then(responseText => {
    if (responseText) {
       const existingContent = decodeURIComponent(
          escape(atob(responseText.content)),
        );
        let newContent = '';

        /* Discussion posts prepended at top of README */
        /* Future implementations may require appending to bottom of file */
        if (prepend) {
          newContent = btoa(
            unescape(encodeURIComponent(addition + existingContent)),
          );
        }

        /* Write file with new content to GitHub */
        upload(token, hook, newContent, directory, 'README.md', response.sha, msg, cb);
    }
  })

}

const uploadGit = (code, problemName, fileName, msg, action, prepend = true, cb = undefined, _diff = undefined) => {
  //assign difficulty
  if (_diff) difficulty = _diff.trim();

  console.log("upload git called with " + msg);

  ///get necessary payload data
  chrome.storage.local.get('my_leethub_token', data => {
    const token = data.my_leethub_token;
    if (token) {
      chrome.storage.local.get('mode_type', data2 => {
        const mode = data2.mode_type;
        if (mode === 'commit') {
          //get hook
          chrome.storage.local.get('my_leethub_hook', data3 => {
            const hook = data3.my_leethub_hook;
            if (hook) {
              const filePath = problemName + fileName;
              chrome.storage.local.get('stats', data4 => {
                const stats = data4.stats;
                let sha = null;
                if (
                  stats !== undefined &&
                  stats.sha !== undefined &&
                  stats.sha[filePath] !== undefined
                ) {
                  sha = stats.sha[filePath];
                }

                if (action === 'upload') upload(token, hook, code, problemName, fileName, sha, msg, cb);

                else if (action === 'update') update(token, hook, code, problemName, msg, prepend, cb);
              })
            }
          })
        }
      })
    }

  })
}


/* Function for finding and parsing the full code. */
/* - At first find the submission details url. */
/* - Then send a request for the details page. */
/* - Finally, parse the code from the html reponse. */
/* - Also call the callback if available when upload is success */
const findCode = (uploadGit, problemName, fileName, msg, action, cb = undefined) => {
  let submissionURL;

  const e = document.getElementsByClassName('status-column__3SUg');
  if (checkElem(e)) {
    //for normal problem submission
    const submissionRef = e[1].innerHTML.split(' ')[1]; 
    //innerHTML gives: <a href="/submissions/detail/875139897/" target="_blank" class="ac__35gz" data-submission-id="875139897">Accepted</a>
    //after split and getting the 1-th element, it's smth like: href="/submissions/detail/875139897/"
    submissionURL = 'https://leetcode.com' + submissionRef.split('=')[1].slice(1, -1);
    //extracting the '/submissions/detail/875139897/' part

  } else {
    //for submission in explore section
    // const submissionRef = document.getElementById('result-state');
    // submissionURL = submissionRef.href;
  }

  if (submissionURL) {
    //request for submission details page
    const options = { method: 'GET' }

    fetch(submissionURL, options)
    .then(res => res.status == 200 || res.status == 201 ? res.text() : null)
    .then(html => {
      if (html) {
        const {code, message} = extractCodeAndMsg(html, msg);
        if (code != null) {
            setTimeout(() => {
              uploadGit(btoa(unescape(encodeURIComponent(code))), problemName, fileName, message, action, true, cb);
            }, 2000);
        }
      }
    })
  }
}

const extractCodeAndMsg = (html, message) => {
    let doc = new DOMParser().parseFromString(html, 'text/html');

    var scripts = doc.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var text = scripts[i].innerText;
      if (text.includes('pageData')) {
        /* Considering the pageData as text and extract the substring
        which has the full code */
        var firstIndex = text.indexOf('submissionCode');
        var lastIndex = text.indexOf('editCodeUrl');
        var slicedText = text.slice(firstIndex, lastIndex);
        /* slicedText has code as like as. (submissionCode: 'Details code'). */
        /* So finding the index of first and last single inverted coma. */
        var firstInverted = slicedText.indexOf("'");
        var lastInverted = slicedText.lastIndexOf("'");
        /* Extract only the code */
        var codeUnicoded = slicedText.slice(
          firstInverted + 1,
          lastInverted,
        );
        /* The code has some unicode. Replacing all unicode with actual characters */
        var code = codeUnicoded.replace(
          /\\u[\dA-F]{4}/gi,
          function (match) {
              return String.fromCharCode(
                parseInt(match.replace(/\\u/g, ''), 16),
              );
            },
          );
        }
      }

      if (!message) {
        slicedText = text.slice(
          text.indexOf('runtime'),
          text.indexOf('memory'),
        );
        const resultRuntime = slicedText.slice(
          slicedText.indexOf("'") + 1,
          slicedText.lastIndexOf("'"),
        );
        slicedText = text.slice(
          text.indexOf('memory'),
          text.indexOf('total_correct'),
        );
        const resultMemory = slicedText.slice(
          slicedText.indexOf("'") + 1,
          slicedText.lastIndexOf("'"),
        );
        message = `Time: ${resultRuntime}, Memory: ${resultMemory} - LeetHub`;
      }

      return {code, message};
}

document.addEventListener('click', (event) => {
  const element = event.target;
  const oldPath = window.location.pathname;

  /* Act on Post button click */
  /* Complex since "New" button shares many of the same properties as "Post button */
  if (
    element.classList.contains('icon__3Su4') ||
    element.parentElement.classList.contains('icon__3Su4') ||
    element.parentElement.classList.contains(
      'btn-content-container__214G',
    ) ||
    element.parentElement.classList.contains('header-right__2UzF')
  ) {
    setTimeout(function () {
      /* Only post if post button was clicked and url changed */
      if (
        oldPath !== window.location.pathname &&
        oldPath ===
          window.location.pathname.substring(0, oldPath.length) &&
        !Number.isNaN(window.location.pathname.charAt(oldPath.length))
      ) {
        const date = new Date();
        const currentDate = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} at ${date.getHours()}:${date.getMinutes()}`;
        const addition = `[Discussion Post (created on ${currentDate})](${window.location})  \n`;
        const problemName = window.location.pathname.split('/')[2]; // must be true.

        uploadGit(
          addition,
          problemName,
          'README.md',
          discussionMsg,
          'update',
        );
      }
    }, 1000);
  }
});

const load = () => {
  let probStatement = null;
  let probStats = null;
  let probType;

  const successTag = document.getElementsByClassName('success__3Ai7'); 
  const resultState = document.getElementById('result-state');
  //success tag only shows if the submission is success (won't show if wrong answer / TLE / MLE

  let success = false;
  if (
    checkElem(successTag) &&
    successTag[0].className === 'success__3Ai7' &&
    successTag[0].innerText.trim() === 'Success'
  ) {
    success = true;
    probType = NORMAL_PROBLEM;
  }

  // check success state for a explore section problem
  else if (
    resultState &&
    resultState.className === 'text-success' &&
    resultState.innerText === 'Accepted'
  ) {
    success = true;
    probType = EXPLORE_SECTION_PROBLEM;
  }

  if (!success) return;

  probStatement = parseQuestion();
  probStats = parseStats();
  
  if (probStatement) {

    switch (probType) {
      case NORMAL_PROBLEM: 
        successTag[0].classList.add('marked_as_success');
        break;
      case EXPLORE_SECTION_PROBLEM:
        resultState.classList.add('marked_as_success');
        break;
      default:
        console.error(`Unknown problem type ${probType}`);
        return;
    }

    const probName = getProblemNameSlug();
    const language = findLanguage();
    if (language) {
      startUpload();
      
      chrome.storage.local.get('stats', data => {
        const stats = data.stats;
        const filePath = probName + probName + language;
        let sha = null;
        if (
          stats !== undefined &&
          stats.sha !== undefined &&
          stats.sha[filePath] !== undefined
        ) {
          sha = stats.sha[filePath];
        }

        //only create README if not already created
        if (!sha) {
          console.log(sha)
          console.log("sha is null")
          uploadGit(btoa(unescape(encodeURIComponent(probStatement))), probName, 'README.md', readmeMsg, 'upload');
        }

        /* get the notes and upload it */
        /* only upload notes if there is any */
        notes = getNotesIfAny();
        if (notes.length > 0) {
          setTimeout(function () {
            if (notes != undefined && notes.length != 0) {
              console.log('Create Notes');
              // means we can upload the notes too
              uploadGit(
                btoa(unescape(encodeURIComponent(notes))),
                probName,
                'NOTES.md',
                createNotesMsg,
                'upload',
              );
            }
          }, 500);
        }

        /* Upload code to Git */
        setTimeout(() => {
          findCode(uploadGit, probName, probName + language, probStats, 'upload', 
            () => {
              if (uploadState['countdown'])
                    clearTimeout(uploadState['countdown']);
                  delete uploadState['countdown'];
                  uploadState.uploading = false;
                  markUploaded();
            }
          );
        }, 1000);

      })
    }
  }
}

const loader = setInterval(load, 1000); //kick start the entire process after 1s

/* Sync to local storage */
chrome.storage.local.get('isSync', (data) => {
  keys = [
    'my_leethub_token',
    'leethub_username',
    'my_pipe_leethub',
    'stats',
    'my_leethub_hook',
    'mode_type',
  ];
  if (!data || !data.isSync) {
    keys.forEach((key) => {
      chrome.storage.sync.get(key, (data) => {
        chrome.storage.local.set({ [key]: data[key] });
      });
    });
    chrome.storage.local.set({ isSync: true }, () => {
      console.log('LeetHub Synced to local values');
    });
  } else {
    console.log('LeetHub Local storage already synced!');
  }
});

// inject the style
injectStyle();


