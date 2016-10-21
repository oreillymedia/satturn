const fs        = require('fs'),
      path      = require('path');
      dirToJson = require('dir-to-json')

const ignore = [".git","node_modules"]
const directory = process.argv[2] || './test-data/files/'
const destination = process.argv[3] || './test-data/index'

dirToJson( directory, {sortType: true}, function( err, dirTree ){
    if( err ){
        throw err;
    }else{
        var filtered = []
        dirTree.children.map((c)=> {if (ignore.indexOf(c.name) == -1) {filtered.push(c)}} )
        dirTree.children = filtered
        fs.writeFileSync( destination, JSON.stringify(dirTree));
    }
});
 



