# Satturn File Editor

An interface to author orioles including a markdown editor and an annotating tool.
Eventually will be used other content types


# Installation

You will need node and npm.

Install dependencies:

`npm install`

# Usage

`npm start`

# Development

`npm run develop`

This app uses a very simple file read/write api written in go. 
There's probably no need to make changes to it but the standard building scripts needs go to be able to build it.

- install go
- place this folder in the GOPATH folder structure convention ($GOPATH/src/github.com/oreillymedia/satturn)
- go to the api subfolder and install the dependencies with `go get`
- To build `npm run api:build` for your machine or `npm run api:build:linux` for targeting linux servers.

# Building and versioning

We're using npm's scripts and versioning tools and semantic versioning (see npm guidelines)[https://docs.npmjs.com/getting-started/semantic-versioning]

This script builds everything and pushes a tag to github.

`npm version {major,minor,patch}`

This can be used to clone just the desired version of the package:

`git clone --branch v0.2.3 --depth 1 https://github.com/oreillymedia/satturn.git /your/destination/path/`


