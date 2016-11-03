# File API

A simple API to read and write files from a local disk.

## Environment Variables

`ROOT=/Users/runemadsen` - Set the default root of all path
`PORT=3000` - Set the port of the server

## Routes

`GET /` - Static file server serving everything in `satturn`
`GET /api/Documents/myfolder` - Returns JSON list of contents in that folder (`/Users/runemadsen/Documents/myfolder`)
`GET /api/Documents/myfolder/myfile.txt` - Returns JSON object with file content of that file (`/Users/runemadsen/Documents/myfolder/myfile.txt`)
