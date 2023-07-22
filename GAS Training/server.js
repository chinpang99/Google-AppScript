const express = require('express')
const fs = require('fs');
//const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

const app = express()
const port = 3000

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Drive API.
    credentials = JSON.parse(content)
    //authorize(JSON.parse(content), listFiles);
  });

app.get('/', (req, res) => {
  res.send('Hello Dunia!')
})

function authorize(credentials, callback, req, res) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
  
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      //if (err) return getAccessToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client, req, res);
    });
  }

  function listFiles(auth, req, resB) {
    const drive = google.drive({version: 'v3', auth});
    drive.files.list({
      pageSize: 10,
      fields: 'nextPageToken, files(id, name)',
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const files = res.data.files;
      let FilesText = ''
      if (files.length) {
        console.log('Files:');
        files.map((file) => {
          console.log(`${file.name} (${file.id})`);
          FilesText += `${file.name} (${file.id}) <br/>` 
        });
      } else {
        console.log('No files found.');
      }
      resB.send(FilesText)
    });
  }

// nodemon => can straight save and refresh the page
// nodemon installation method:npm install -g nodemon

app.get('/getDrive/:chinpang_id',(req, res) =>{
    authorize(credentials, listFiles, req, res)
    //res.send('Hello ap222a....' + req.params['chinpang_id'])
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})