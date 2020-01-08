//import pq from 'powerQuery.js';
const fs = require('fs');
const _ = require('lodash');
const plugin = require('./powerQuery');
const Plugin = plugin.Plugin;

function getQueriesFromSQL(fileName) {
  const rawData = fs.readFileSync(fileName, 'utf8').toLowerCase();
  let fields = [];
  let tables = [];
  let args = [];
  const fieldsRegEx = new RegExp(/[a-z_0-9]+\.[a-z_0-9]+/g);
  const tablesRegEx = new RegExp(
    /((from)\s[a-z_0-9]+\s+[a-z_0-9]+)|((inner join)\s[a-z_0-9]+\s+[a-z_0-9]+)/g
  );
  const argsRegEx = new RegExp(/:[a-z_]+/g);
  fields = rawData.match(fieldsRegEx);
  tables = rawData.match(tablesRegEx);
  args = rawData.match(argsRegEx);
  if (args != null) {
    args = args.map(x => {
      return x.substring(1, x.length);
    });
  }
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
    fields: _.sortBy(fieldsProcessed, ['table', 'name']),
    args: args.sort()
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

data.fields.forEach(item => {
  newPlugin.addItemToQuery(
    0,
    `${item.table}.${item.name}`,
    item.table,
    item.name
  );
});

newPlugin.writeQueriesXMLToFile();
newPlugin.writePluginXMLToFile();
