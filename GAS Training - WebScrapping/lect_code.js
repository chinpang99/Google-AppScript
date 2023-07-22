const express = require('express')
const fs = require('fs');
// const readline = require('readline');
const {
    google
} = require('googleapis');
const {
    resolve
} = require('path');


// If modifying these scopes, delete token.json.
const SCOPES = [

    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/spreadsheets'
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

let credentials = null

const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('Hello Dunia 2')
})

app.get('/getSpreadsheet', (req, res) => {
    // res.send('spreadsheet without any id')
    getSpreadsheet('no id', 'no range').then((result) => {
        res.send(result)
    })
})

app.get('/getSpreadsheet/:kenny_id/:range', (req, res) => {
    // res.send(`value receive<br><b>${req.params['kenny_id']}</b> <br/> ${req.params['range']}`)
    getSpreadsheet(req.params.kenny_id, req.params.range).then((kenny_result) => {
        res.send(kenny_result)
    })
})

app.get('/createSpreadsheet', (req, res) => {
    authorize(credentials).then((auth_ok) => {
        createSpreadsheet(auth_ok).then((google_sheet_url) => {
            res.send(`
            <a href="${google_sheet_url.spreadsheetUrl}">Your link is ready! Click me</a>
            `)
        })
        // res.send("ok")
    })
})

app.get('/addRowIntoSpreadsheet', (req, res) => {
    playWith2D().then((result) => {
        // let output = ""
        // result.forEach((row, r_index) => {
        //     row.forEach((item, column_index) => {

        //         if (item == 'apple') {
        //             result[r_index][column_index] = 'apple DUA!'
        //             output += `${result[r_index][column_index]},`
        //         } else {
        //             output += `${item},`                    
        //         }
        //     })
        //     output += "<br>"
        // });
        // console.log(result)
        // res.send(output)
        generateHtmlTable(result).then((html) => {
            res.send(html)
        })
    })
})


app.get('/addRowIntoSpreadsheet_v2', (req, res) => {
    playWith2D().then((result) => {

        authorize(credentials).then((key) => {
            addData("15Dm4zK7gc6QtQhuEIzkWRSaJdcSVJZxpvliBxPxPDTc", "Sheet2!A1:B2", result, key).then((result_add) => {
                res.send(result_add)
            })
        })
        // let output = ""
        // generateHtmlTable(result).then((html) => {
        // console.log(result)
        // res.send(html)
        // })

    })

})

const puppeteer = require('puppeteer');

app.get("/scrapeWebsiteData", (req, res) => {
    puppeteer.launch({
        headless: false
    }).then((browser) => {
        browser.newPage().then((page) => {
            page.goto('http://books.toscrape.com/', {
                waitUntil: 'networkidle2'
            }).then(() => {
                page.$$eval('section ol > li', (links) => {
                    // Make sure the book to be scraped is in stock
                    //    return links;
                    links = links.filter(link => link.querySelector('.instock.availability > i').textContent !== "In stock")
                    // // Extract the links from the data
                    links = links.map(el => el.querySelector('h3 > a').title)
                    
                    let items = []
                    
                    links.forEach((i) => {
                        items.push([i])
                    })

                    return items;
                }).then((result) => {
                    browser.close()
                    authorize(credentials).then((key) => {
                        addData("15Dm4zK7gc6QtQhuEIzkWRSaJdcSVJZxpvliBxPxPDTc", "Sheet7!A1:A" + result.length, result, key).then((result_add) => {
                            // res.send(result_add)
                            res.send(`<a href="https://docs.google.com/spreadsheets/d/15Dm4zK7gc6QtQhuEIzkWRSaJdcSVJZxpvliBxPxPDTc/edit#gid=1137516148" target="_blank">lazy to create new file</a><br>${result_add}`)
                        })
                    })
                    // res.json(result)
                })
            })

        })
    })
    // res.send("ok")
})

app.get('/addRowIntoSpreadsheet/:sheet_id/:range', (req, res) => {
    playWith2D().then((result) => {

        authorize(credentials).then((key) => {
            addData(req.params['sheet_id'], req.params['range'], result, key).then((result_add) => {
                res.send(result_add)
            })
        })
        // let output = ""
        // generateHtmlTable(result).then((html) => {
        // console.log(result)
        // res.send(html)
        // })

    })

})

app.get('/getData', (req, res) => {
    authorize(credentials).then((auth) => {
        getValueFromSpreadsheet("15Dm4zK7gc6QtQhuEIzkWRSaJdcSVJZxpvliBxPxPDTc", "A1:E", auth).then((result) => {
            generateHtmlTable(result).then((html) => {
                res.send(html)
            })
        })
        // res.send("done")
    })
})



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

function getValueFromSpreadsheet(spreadsheetId, range, auth) {
    return new Promise((resolve, reject) => {
        sheetsService.spreadsheets.values.get({
            spreadsheetId,
            range,
            auth: auth
        }, (err, result) => {
            if (err) {
                // Handle error
                console.log(err);
            } else {
                const numRows = result.data.values ? result.data.values.length : 0;
                resolve(result.data.values)
                console.log(`${numRows} rows retrieved.`);
            }
        });
    })


}

function addData(spreadsheetId, range, data_array, auth) {
    return new Promise((resolve, reject) => {
        const data = [{
            range,
            values: data_array
        }]
        const resource = {
            data,
            valueInputOption: "USER_ENTERED"
        }
        sheetsService.spreadsheets.values.batchUpdate({
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

let sheetsService = google.sheets('v4')

function createSpreadsheet(auth) {
    return new Promise((resolve, reject) => {
        const resource = {
            properties: {
                title: "hello world",
            }
        };
        sheetsService.spreadsheets.create({
            resource,
            auth: auth
        }, (err, spreadsheet) => {
            if (err) {
                // Handle error.
                console.log(err);
            } else {
                //   console.log(`Spreadsheet ID: ${spreadsheet.data.spreadsheetUrl}`);
                resolve({
                    "spreadsheetUrl": spreadsheet.data.spreadsheetUrl
                })
            }
        });
    })

}

function getSpreadsheet(id, range) {
    return new Promise((resolve, reject) => {

        authorize(credentials).then((kenny_oAuth) => {
            listMajors(kenny_oAuth).then((kenny_result_text) => {
                resolve(kenny_result_text)
            })
        })

        // resolve(`!!!value receive<br><b>${id}</b> <br> ${range}`)
    })

}

fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Drive API.
    credentials = JSON.parse(content)

});

function listMajors(auth) {

    return new Promise((resolve, reject) => {
        let returnText = ""

        const sheets = google.sheets({
            version: 'v4',
            auth
        });
        sheets.spreadsheets.values.get({
            spreadsheetId: '15Dm4zK7gc6QtQhuEIzkWRSaJdcSVJZxpvliBxPxPDTc',
            range: 'Sheet1!A1:E5',
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const rows = res.data.values;
            if (rows.length) {
                returnText += 'Name, Major:';
                // Print columns A and E, which correspond to indices 0 and 4.
                rows.map((row) => {
                    returnText += `${row[0]}, ${row[4]}`;
                });
                console.log("returnText2 ", returnText)
                resolve(returnText)
            } else {
                //console.log('No data found.');
            }
        });

        console.log("returnText1 ", returnText)

    })

}

function authorize(credentials) {
    return new Promise((resolve, reject) => {
        const {
            client_secret,
            client_id,
            redirect_uris
        } = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) {
                reject(err)
            }
            //   if (err) return getAccessToken(oAuth2Client, callback);
            oAuth2Client.setCredentials(JSON.parse(token));
            //   callback(oAuth2Client, req, res);
            resolve(oAuth2Client)
        });
    })


}

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})