# File API

A simple API to read and write files from a local disk.

## Environment Variables

`ROOT=/Users/runemadsen` - Set the default root of all path
`PORT=3000` - Set the port of the server

## API Routes

`GET /Documents/myfolder` - Returns JSON list of contents in that folder (`/Users/runemadsen/Documents/myfolder`)
`GET /Documents/myfolder/myfile.txt` - Returns JSON object with file content of that file (`/Users/runemadsen/Documents/myfolder/myfile.txt`)
