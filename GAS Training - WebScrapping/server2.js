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
const puppeteer = require('puppeteer');

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
            auth: auth,
            fields: 'spreadsheetId' //(only specifies that we need the spreadsheet ID here)
        }, (err, spreadsheet) => {
            if (err) {
                // Handle error.
                console.log(err);
            } else {
                // console.log(`Spreadsheet ID: ${spreadsheet.data.spreadsheetUrl}`);
                // spreadsheet.data.spreadsheetId returns the spreadsheet ID
                // spreadsheet.data.spreadsheetUrl returns the spreadsheet URL
                resolve({
                    "spreadsheetUrl": spreadsheet.data.spreadsheetId
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

function addData(spreadsheetId, range, data_array, auth) {
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
                    "spreadsheetUrl": spreadsheet.data.spreadsheetId
                })  // return the spreadsheet URL in a JSON format
            }
        });
    })
}

function addData(spreadsheetId, range, data_array, auth) {
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
        authorize(credentials).then((key) => {
            addData(req.params['sheet_id'], req.params['range'], result, key).then((result_add) => {
                res.send(`<a href="${google_sheet_url.spreadsheetUrl}"> your link is ready! Click me </a>`)
                //res.send(result_add)
            })

        })
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

app.get("/scrapeWebsiteData2", (req, res) => {
    puppeteer.launch({
        headless: false
    }).then((browser) => {
        browser.newPage().then((page) => {
            page.goto('http://lazada.com.my/', {
                waitUntil: 'networkidle2'
            }).then(() => {

                let process = Promise.resolve()

                // process = process.then(() => {
                //     return page.type("[type='search']", "nvidia")
                // })

                process = process.then(() => {
                    console.log("click on the search")
                    return Promise.all([
                        page.evaluate(() => {
                            $("[type='search']").val("nvidia apple")
                            $("button[class*='search-box__button']").click()
                        }),
                        page.waitForNavigation({
                            waitUntil: 'networkidle2'
                        })
                    ])
                })
                process = process.then(() => {
                    console.log("load complete")
                    return page.$$eval('div[data-tracking="product-card"]', (links) => {
                        // Make sure the book to be scraped is in stock
                        //    return links;
                        links = links.map(el => {
                            let array = []
                            array.push(el.querySelector('img').alt)
                            array.push(el.querySelector('img').src)
                            array.push(el.querySelector('span').innerText)
                            // let xel = {}
                            // xel['text'] = el.querySelector('img').alt
                            // xel['img_src'] = el.querySelector('img').src
                            // xel['price'] = el.querySelector('span').innerText
                            // return xel
                            return array
                        })
                        console.log(links)
                        return links;
                    })


                })

                process = process.then((value) => {
                    browser.close()
                    console.log("done", value)
                    authorize(credentials).then((auth_ok) => {
                        createSpreadsheet(auth_ok).then((google_sheet_id) => {
                            console.log(google_sheet_id.spreadsheetUrl)
                            addData(google_sheet_id.spreadsheetUrl, "A1:C50", value, auth_ok).then((result_add) => {
                                
                            })
                            res.send(`<a href= https://docs.google.com/spreadsheets/d/${google_sheet_id.spreadsheetUrl}> your link is ready! Click me </a>`)
                        })
                    })
                })


            })

        })
    })
})

app.get('/addRowIntoSpreadSheet/:sheet_id/:range', (req, res) => {
    playWith2D().then((result) => {
        authorize(credentials).then((key) => {
            addData(req.params['sheet_id'], req.params['range'], result, key).then((result_add) => {
                res.send(`<a href="${google_sheet_url.spreadsheetUrl}"> your link is ready! Click me </a>`)
                //res.send(result_add)
            })

        })
    })
})