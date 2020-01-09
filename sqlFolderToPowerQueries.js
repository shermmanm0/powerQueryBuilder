//import pq from 'powerQuery.js';
const fs = require('fs');
const _ = require('lodash');
const plugin = require('./powerQuery');
const Plugin = plugin.Plugin;
var archiver = require('archiver');
const pluginZip = './plugin.zip';
const sqlFolderPath = './sqlFiles/';
const fromRegExp = new RegExp (/from [a-zA-Z]+/g);
var sqlFilePathsArray = [];
var path = require('path');
var fields = [];
var tables = [];
var columnsArray = [];
var argsArray = [];
var queryInfoArray = [];
const selectRegEx = new RegExp(/(select.+\r\n)|(select.+\n)/g)
const fieldsRegEx = new RegExp(/[a-z_0-9]+\.[a-z_0-9]+/g);
const tablesRegEx = new RegExp(/((from)\s[a-z_0-9]+\s+[a-z_0-9]+)|((inner join)\s[a-z_0-9]+\s+[a-z_0-9]+)/g);
const argsRegEx = new RegExp(/:[a-z_]+/g);
var sqlFileCount = 0;

function fromDir(startPath,filter,callback){

    //console.log('Starting from dir '+startPath+'/');

    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }

    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            fromDir(filename,filter,callback); //recurse
        }
        else if (filter.test(filename)) callback(filename);
    };

};

function readDataFromSQLFile(filename){
    let data = fs.readFileSync(filename,'utf8')
    //let queryColumns = [];
    let queryArgs = [];
    let queryFields = [];
    let queryTables = [];
    let queryArea = data.match(fromRegExp)[0].substring(5);
    let queryName = filename.substring(filename.lastIndexOf(`\\`)+1,filename.lastIndexOf(`\.`))
    let queryColumns = data.match(selectRegEx);
    //console.log(data);
    //console.log(queryColumns)
    //console.log(queryColumns[0])
    queryColumns = queryColumns[0].match(fieldsRegEx);
    queryFields = data.match(fieldsRegEx);
    queryTables = data.match(tablesRegEx);
    queryArgs = data.match(argsRegEx);

    if (queryArgs != null) {
        queryArgs = queryArgs.map(x => {
          return x.substring(1, x.length);
        });
    }
    queryColumns = _.uniq(queryColumns);
    queryFields = _.uniq(queryFields);
    queryTables = _.uniq(queryTables);
    queryArgs = _.uniq(queryArgs);
    let tablesProcessed = queryTables.map(tableString => {
        if (tableString.startsWith('from ')) {
          tableString = tableString.substring(5, tableString.length);
        } else if (tableString.startsWith('inner join ')) {
          tableString = tableString.substring(11, tableString.length);
        }
        let tableStringArray = tableString.split(' ');
    
        let tableObject = {
          "name": tableStringArray[0],
          "abbreviation": tableStringArray[1]
        };
        return tableObject;
    });
    let columnsProcessed = queryColumns.map(columnString => {
        columnStringArray = columnString.split('.');
        columnObject = {
            "table": tablesProcessed.find(
                table => table.abbreviation === columnStringArray[0]
                ).name,
            "field": columnStringArray[1],
            "name": `${columnStringArray[0]}${columnStringArray[1]}`
        };
        return columnObject;
    });
    let fieldsProcessed = queryFields.map(fieldString => {
        fieldStringArray = fieldString.split('.');
        fieldObject = {
          "table": tablesProcessed.find(
            table => table.abbreviation === fieldStringArray[0]
          ).name,
          "field": fieldStringArray[1],
          "name": `${fieldStringArray[0]}${fieldStringArray[1]}`
        };
        return fieldObject;
    });
    
    return {
        "columns":columnsProcessed,
        "fields": fieldsProcessed,
        "args": queryArgs,
        "queryName": queryName,
        "queryArea": queryArea,
        "rawSQL": data
    }
}

var pluggy = new Plugin();
pluggy.printPluginInfo();
var count = 0;
fromDir(sqlFolderPath,/\.sql$/,function(filename, plugin){
    let dataFromCurrentFile = readDataFromSQLFile(filename);
    pluggy.addQuery(dataFromCurrentFile.queryName, dataFromCurrentFile.queryArea, '','need to write description method',dataFromCurrentFile.rawSQL)
    dataFromCurrentFile.columns.forEach(column =>{
        pluggy.addColumnToQuery(count,column.name,column.table,column.field);
    })
    dataFromCurrentFile.fields.forEach(item =>{
        pluggy.addItemToQuery(count,item.name,item.table,item.field);
    })
    count++;
});
pluggy.incrementSubVersionNumber();
pluggy.writePluginXMLToFile();
pluggy.writeQueriesXMLToFile();
try {
    if (fs.existsSync(pluginZip)) {
      fs.unlink(pluginZip, function (err) {
        if (err) throw err;
        // if no error, file has been deleted successfully
        console.log('File deleted!');
        }); 
      }
    else {
      console.log("File does not exist")
    }
    } catch(err) {
    console.error(err)
  }
  // create a file to stream archive data to.
  var output = fs.createWriteStream(pluginZip);
  var archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });
  
  // listen for all archive data to be written
  // 'close' event is fired only when a file descriptor is involved
  output.on('close', function() {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
  });
  
  // This event is fired when the data source is drained no matter what was the data source.
  // It is not part of this library but rather from the NodeJS Stream API.
  // @see: https://nodejs.org/api/stream.html#stream_event_end
  output.on('end', function() {
    console.log('Data has been drained');
  });
  
  // good practice to catch warnings (ie stat failures and other non-blocking errors)
  archive.on('warning', function(err) {
    if (err.code === 'ENOENT') {
      // log warning
    } else {
      // throw error
      throw err;
    }
  });
  
  // good practice to catch this error explicitly
  archive.on('error', function(err) {
    throw err;
  });
  
  // pipe archive data to the file
  archive.pipe(output);
  
  // append files from a sub-directory, putting its contents at the root of archive
  archive.directory('plugin-folder/', false);
  
  // finalize the archive (ie we are done appending files but streams have to finish yet)
  // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
  archive.finalize();
  


