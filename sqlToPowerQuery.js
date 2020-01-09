//import pq from 'powerQuery.js';
const fs = require('fs');
const _ = require('lodash');
const plugin = require('./powerQuery');
const Plugin = plugin.Plugin;
var archiver = require('archiver');
const pluginZip = './plugin.zip'

function getQueriesFromSQL(fileName) {
  const rawData = fs.readFileSync(fileName, 'utf8');
  let fields = [];
  let tables = [];
  let args = [];
  let columns = [];
  const selectRegEx = new RegExp(/select.+\r\n/g)
  const fieldsRegEx = new RegExp(/[a-z_0-9]+\.[a-z_0-9]+/g);
  const tablesRegEx = new RegExp(
    /((from)\s[a-z_0-9]+\s+[a-z_0-9]+)|((inner join)\s[a-z_0-9]+\s+[a-z_0-9]+)/g
  );
  const argsRegEx = new RegExp(/:[a-z_]+/g);
  columns = rawData.match(selectRegEx);
  columns = columns[0].match(fieldsRegEx);
  fields = rawData.match(fieldsRegEx);
  tables = rawData.match(tablesRegEx);
  args = rawData.match(argsRegEx);
  if (args != null) {
    args = args.map(x => {
      return x.substring(1, x.length);
    });
  }
  columns = _.uniq(columns);
  fields = _.uniq(fields);
  tables = _.uniq(tables);
  args = _.uniq(args);
  let tablesProcessed = tables.map(tableString => {
    if (tableString.startsWith('from ')) {
      tableString = tableString.substring(5, tableString.length);
    } else if (tableString.startsWith('inner join ')) {
      tableString = tableString.substring(11, tableString.length);
    }
    let tableStringArray = tableString.split(' ');

    let tableObject = {
      name: tableStringArray[0],
      abbreviation: tableStringArray[1]
    };
    return tableObject;
  });
  let columnsProcessed = columns.map(columnString => {
    columnStringArray = columnString.split('.');
    columnObject = {
      table: tablesProcessed.find(
        table => table.abbreviation === columnStringArray[0]
      ).name,
      name: columnStringArray[1]
    };
    return columnObject;
  });
  let fieldsProcessed = fields.map(fieldString => {
    fieldStringArray = fieldString.split('.');
    fieldObject = {
      table: tablesProcessed.find(
        table => table.abbreviation === fieldStringArray[0]
      ).name,
      name: fieldStringArray[1]
    };
    return fieldObject;
  });

  return {
    'columns':columnsProcessed,
    'fields': fieldsProcessed,
    'args': args.sort(),
    'rawSQL': rawData
  };
}

var data = getQueriesFromSQL('testsql.txt');
console.log(data.fields);
var newPlugin = new Plugin('getAllGrades');
newPlugin.addQuery(
  'data_puller',
  'assignment_grades',
  'assignments',
  'pulls all student grades'
);
data.columns.forEach(item => {
  newPlugin.addColumnToQuery(
    0,
    `${item.table}.${item.table}_${item.name}`,
    item.table,
    item.name)
})
data.fields.forEach(item => {
  newPlugin.addItemToQuery(
    0,
    `${item.table}.${item.name}`,
    item.table,
    item.name
  );
});
newPlugin.setQuerySQL(0,data.rawSQL);
newPlugin.writeQueriesXMLToFile();
newPlugin.writePluginXMLToFile();

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

