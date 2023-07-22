
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file'
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.

const TOKEN_PATH = 'token.json';

let credentials = null

const express = require('express');
const { resolve } = require('path');
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('Hello Dunia 2!')
})

app.get('/getSpreadsheet/', (req, res) => {
    // res.send('spreadsheet without any id')
    getSpreadsheet('no id', 'no range').then((result) =>
        res.send(result))
})

app.get('/getSpreadsheet/:kelvin_id/:range', (req, res) => {
    // res.send(`value received <br> <b>${req.params['kelvin_id']} </b><br>${req.params['range']}`)
    getSpreadsheet(req.params.kelvin_id, req.params.range).then((kelvin_result) => {
        res.send(kelvin_result)
    })
})

function getSpreadsheet(id, range) {
    return new Promise((resolve, reject) => {
        authorize(credentials).then((kelvin_oAuth) => {
            listMajors(kelvin_oAuth).then((kelvin_result_text) => {
                resolve(kelvin_result_text)
            })
        })
        // resolve(`!!!value received <br> <b> ${id} </b> <br> ${range}`)
    })
}

function listMajors(auth) {

    return new Promise((resolve, reject) => {
        let returnText = ""
        const sheets = google.sheets({ version: 'v4', auth });
        sheets.spreadsheets.values.get({
            spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
            range: 'Class Data!A2:E',
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const rows = res.data.values;
            if (rows.length) {
                returnText += 'Name, Major:';
                // Print columns A and E, which correspond to indices 0 and 4.
                rows.map((row) => {
                    returnText += `${row[0]}, ${row[4]}`;
                });
                console.log('returnText2', returnText)
                resolve(returnText)
            } else {
                console.log('No data found.');
            }
        });
    })
}

function authorize(credentials) {
    return new Promise((resolve, reject) => {
        const { client_secret, client_id, redirect_uris } = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) {
                reject(err)
            };
            oAuth2Client.setCredentials(JSON.parse(token));
            // callback(oAuth2Client);
            resolve(oAuth2Client)                 // if everything ok return the token
        });
    })
}

let sheetsService = google.sheets('v4')

function createSpreadsheet(auth) {
    return new Promise((resolve, reject) => {
        const resource = {
            properties: {
                title: "hallo world",
            },

        };
        sheetsService.spreadsheets.create({
            resource,
            auth: auth
            // fields: 'spreadsheetId' (only specifies that we need the spreadsheet ID here)
        }, (err, spreadsheet) => {
            if (err) {
                // Handle error.
                console.log(err);
            } else {
                // console.log(`Spreadsheet ID: ${spreadsheet.data.spreadsheetUrl}`);
                // spreadsheet.data.spreadsheetId returns the spreadsheet ID
                // spreadsheet.data.spreadsheetUrl returns the spreadsheet URL
                resolve({
                    "spreadsheetUrl": spreadsheet.data.spreadsheetUrl
                })  // return the spreadsheet URL in a JSON format
            }
        });
    })
}

function playWith2D() {
    return new Promise((resolve, reject) => {
        let data = [
            [
                'apple',
                'banana'
            ],
            [
                'papaya',
                'coconut'
            ]
        ]

        resolve(data)
    })
}

function getValueFromSpradsheet(spreadsheetId, range, auth) {
    this.sheetsService.spreadsheets.values.get({
        spreadsheetId,
        range,
        auth: auth
    }, (err, result) => {
        if (err) {
            // Handle error
            console.log(err);
        } else {
            const numRows = result.values ? result.values.length : 0;
            console.log(`${numRows} rows retrieved.`);
        }
    });
}

function generateHtmlTable(data) {
    return new Promise((resolve, reject) => {
        let output = ""
        data.forEach((row, r_index) => {
            row.forEach((item, column_index) => {

                if (item == "apple") {
                    data[r_index][column_index] = "apple DUA!"
                    output += `${data[r_index][column_index]},`
                } else {
                    output += `${item},`
                }


            })
            output += "<br>"
        });
        resolve(output)

    })
}

function addData(spreadsheetId, range, data_array,auth) {
    return new Promise((resolve, reject) => {
          const data = [
              {
                  range,
                  values: data_array
              }
          ]
          const resource = {
              data,
              valueInputOption: "USER_ENTERED"
          }
          sheetsService.spreadsheets.values.batchUpdate({ //
            spreadsheetId,
            resource,
            auth
          }, (err, result) => {
            if (err) {
              // Handle error
              reject(err);
            } else {
              resolve(`${result.data.totalUpdatedCells} cells updated.`);
            }
          });
    })   
}



fs.readFile('credentials.json', (err, content) => {                             // read the credentials
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Drive API.
    credentials = JSON.parse(content)
});

app.get('/createSpreadsheet', (req, res) => {
    authorize(credentials).then((auth_ok) => {
        createSpreadsheet(auth_ok).then((google_sheet_url) => {
            res.send(`
            <a href="${google_sheet_url.spreadsheetUrl}"> your link is ready! Click me </a>`)
        })
    })
})

app.get('/addRowIntoSpreadSheet/:sheet_id/:range', (req, res) => {
    playWith2D().then((result) => {
        authorize(credentials).then((key)=>{
            addData(req.params['sheet_id'],req.params['range'],result,key).then((result_add)=>{
                res.send(result_add)
            })

        })
        // let output = ""
        // result.forEach((row,r_index) => { //row, index
        //     row.forEach((item,column_index) =>{

        //         if(item == 'apple'){
        //             result[r_index][column_index] = 'apple DUA!'
        //             output += `${result[r_index][column_index]},`
        //         }else{
        //             output += `${item},`
        //         }

        //     })
        //     output += "<br>"
        // });
        // res.send(output)

        // generateHtmlTable(result).then((html) => {
        //     res.send(html)
        // })
    })
})

app.get('/getData', (req, res) => {
    authorize(credentials).then((auth) => {
        getValueFromSpradsheet("1MFIhVejedljrGNWu9zv9SzGEfSYVdS0DuOaCww73yhw", "A1", auth)
        res.send("done")
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

/**
 * @name keyboard
 *
 * @desc types into a text editor
 *
 * @see {@link https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagehoverselector}
 */
const puppeteer = require('puppeteer');
const iPhone = puppeteer.devices['iPhone 6'];

(async () => {
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()
    // await page.emulate(iPhone) 
    await page.goto('https://books.toscrape.com//')
    // await page.focus('.thumbnail') //html class element
    // await page.keyboard.type('Hello World!')

    // let getSomething = await page.$eval('.thumbnail',(input)=>{
    //     return input.value
    // })


    // ---- I DONE 
    // let getSomething = await page.evaluate(()=>{
    //     let products_result = document.getElementsByClassName("thumbnail");
    //     let data = []

    //     for (let i=0;i<products_result.length;i++){
    //         data[i] = products_result[i].alt
    //     }
    //     return data
    // })

    // console.log(getSomething)


    //---- INSTRUCTOR CODE 
    let getSomething = await page.$$eval('section ol > li', (links) => {
        // Make sure the book to be scraped is in stock
        //    return links;
        links = links.filter(link => link.querySelector('.instock.availability > i').textContent !== "In stock")
        // // Extract the links from the data
        links = links.map(el => el.querySelector('h3 > a').title)
        return links;
    })
    console.log(getSomething)


    //await page.screenshot({ path: 'google.png' })
    //await browser.close()
})()

