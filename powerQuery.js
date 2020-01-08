const fs = require('fs');
const _ = require('lodash');

class Plugin {
  constructor(name) {
    this.array = [];
    this.items = [];
    this.name = name;
    this.jsonFilePath = `${this.name}.json`;
    this.queriesXMLFilePath = `queries_root/${this.name}.named_queries.xml`;
    this.versionNumber = 0;
  }
  //adds query
  addQuery(name, area, coreTable, description, flattened = false) {
    let query = new PowerQuery(
      this.getNumberOfQueries(),
      name,
      area,
      coreTable,
      description,
      flattened
    );
    if (this.checkQueryNameForUniqueness(query.getQueryName())) {
      this.array.push(query);
      console.log('Query added with ID ' + query.getId());
      return;
    } else {
      console.log('Query name is already taken. Please rename');
    }
  }
  checkQueryNameForUniqueness(queryName) {
    if (this.queryArrayIsEmpty()) {
      return true;
    } else {
      let flag = true;
      let i = 0;
      while (flag) {
        flag = this.array[i].getQueryName() != queryName;
        i++;
        if (i == this.getNumberOfQueries()) break;
      }
      return flag;
    }
  }
  getNumberOfQueries() {
    return this.array.length;
  }
  queryArrayIsEmpty() {
    return this.array.length === 0;
  }
  printQueries() {
    this.array.forEach(query => query.printItems());
  }
  addItemToQuery(index, name, table, field, access = 'ViewOnly') {
    let temp = new PowerQueryItem(name, table, field, access);
    this.array[index].addPowerQueryItem(temp);
    console.log(this.isItemNewToPlugIn(temp));
    if (this.isItemNewToPlugIn(temp)) {
      this.items.push(temp);
      console.log(temp.column);
    }
  }
  addArgToQuery(
    index,
    name,
    column,
    defaultValue,
    description,
    type = 'primitive',
    required = 'true'
  ) {
    let temp = new PowerQueryArg(
      name,
      column,
      defaultValue,
      description,
      type,
      required
    );
    this.array[index].addPowerQueryArg(temp);
  }
  getQueriesXML() {
    let xmlFileString = `<queries>\n`;
    this.array.forEach(element => {
      xmlFileString = xmlFileString.concat(element.getQueryXML());
    });
    xmlFileString = xmlFileString.concat(`</queries>`);
    return xmlFileString;
  }
  isItemNewToPlugIn(newItem) {
    let flag = true;
    this.items.forEach(item => {
      if (newItem.column === item.column) {
        flag = false;
      }
    });
    return flag;
  }
  getPluginXML() {
    let pluginXML = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    pluginXML = pluginXML.concat(
      `<plugin xmlns="http://plugin.powerschool.pearson.com"\n`
    );
    pluginXML = pluginXML.concat(
      `\t\txmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`
    );
    pluginXML = pluginXML.concat(
      `\t\txsi:schemaLocation="http://plugin.powerschool.pearson.com plugin.xsd"\n`
    );
    pluginXML = pluginXML.concat(`\t\tname="CRRHS Data Puller"\n`);
    pluginXML = pluginXML.concat(`\t\tversion="1.${this.versionNumber}"\n`);
    pluginXML = pluginXML.concat(`\t\tdescription="Pulls all the data">\n`);
    pluginXML = pluginXML.concat(`\t<oauth></oauth>\n`);
    pluginXML = pluginXML.concat(`\t<access_request>\n`);
    this.items.forEach(item => {
      pluginXML = pluginXML.concat(
        `\t\t<field table ="${item.table}" field="${item.field}" access = "${item.access}" />\n`
      );
    });
    pluginXML = pluginXML.concat(`\t</access_request>\n`);
    pluginXML = pluginXML.concat(`\t<publisher name ="Matthew Sherman">\n`);
    pluginXML = pluginXML.concat(
      `\t\t<contact email ="msherman@cristoreyrichmond.org" />\n`
    );
    pluginXML = pluginXML.concat(`\t</publisher>\n`);
    pluginXML = pluginXML.concat(`</plugin>\n`);
    return pluginXML;
  }
  writeJSONToFile() {
    fs.writeFile(this.jsonFilePath, JSON.stringify(this, null, 4), function(
      err
    ) {
      if (err) {
        console.log(err);
      } else {
        console.log(`PS Plugin JSON Data saved`);
      }
    });
  }
  writeQueriesXMLToFile() {
    fs.writeFile(this.queriesXMLFilePath, this.getQueriesXML(), function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log(`PS Queries XML saved`);
      }
    });
  }
  writePluginXMLToFile() {
    fs.writeFile('plugin.xml', this.getPluginXML(), function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log(`PS Query Plugin File XML saved`);
      }
    });
  }
  loadDataFromJSON(pathToJSON) {
    let rawData = fs.readFileSync(pathToJSON);
    let newData = JSON.parse(rawData);
    let currentQueryIndex = 0;
    this.name = newData.name;
    this.jsonFilePath = newData.jsonFilePath;
    this.queriesXMLFilePath = newData.queriesXMLFilePath;

    newData.array.forEach(element => {
      this.addQueryFromJSON(element);
      element.queryItems.forEach(items => {
        this.addItemToQuery(
          currentQueryIndex,
          items.name,
          items.table,
          items.field,
          items.access
        );
      });
      element.queryArgs.forEach(args => {
        this.addArgToQuery(
          currentQueryIndex,
          args.name,
          args.column,
          args.defaultValue,
          args.description,
          args.type,
          args.required
        );
      });
      currentQueryIndex++;
    });
  }
  getQueryNameAtIndex(index) {
    return this.array[index].queryName;
  }
  addQueryFromJSON(object) {
    let query = new PowerQuery(
      object.id,
      object.name,
      object.area,
      object.coreTable,
      object.description,
      object.flattened
    );
    if (this.checkQueryNameForUniqueness(query.getQueryName())) {
      this.array.push(query);
      console.log('Query added with ID ' + query.getId());
      return;
    } else {
      console.log('Query name is already taken. Please rename');
    }
  }
  getPluginName() {
    return this.name;
  }
}
class PowerQuery {
  constructor(id, name, area, coreTable, description, flattened) {
    this.id = id;
    this.name = name;
    this.area = area;
    this.coreTable = coreTable;
    this.description = description;
    this.flattened = flattened;
    this.com = 'com';
    this.org = 'cristoreyrichmond';
    this.product = 'powerschool';
    this.queryName = this.com + this.org + this.product + this.area + this.name;
    this.queryName = `${this.com}.${this.org}.${this.product}.${this.area}.${this.name}`;
    this.queryItems = [];
    this.queryArgs = [];
    this.setSQL('Pretend this SQL Query data');
  }
  addPowerQueryItem(item) {
    this.queryItems.push(item);
  }
  addPowerQueryArg(item) {
    this.queryArgs.push(item);
  }
  printItems() {
    console.log('Power Query Items');
    this.queryItems.forEach(element => console.log(element));
    console.log('Power Query Arguments');
    this.queryArgs.forEach(element => console.log(element));
  }
  setSQL(sqlQuery) {
    this.sqlQuery = '\t\t\t<![CDATA[\n' + sqlQuery + '\n\t\t\t]]>\n';
  }
  getSQL() {
    return this.sqlQuery;
  }
  getQueryName() {
    return this.queryName;
  }
  getQueryXML() {
    let xmlBodyString = `\t<query name = "${this.queryName}" coreTable = "${this.coreTable}" flattened = "${this.flattened}">\n`;
    xmlBodyString = xmlBodyString.concat(this.getDescriptionXML());
    xmlBodyString = xmlBodyString.concat(this.getArgsXML());
    xmlBodyString = xmlBodyString.concat(this.getColumnsXML());
    xmlBodyString = xmlBodyString.concat(`\t</query>\n`);
    return xmlBodyString;
  }
  getDescriptionXML() {
    return `\t\t<description>${this.description}</description>\n`;
  }
  getArgsXML() {
    let xmlString = `\t\t<args>\n`;
    this.queryArgs.forEach(element => {
      xmlString = xmlString.concat(element.getXML());
    });
    xmlString = xmlString.concat(`\t\t</args>\n`);
    return xmlString;
  }
  getColumnsXML() {
    let xmlString = `\t\t<columns>\n`;
    this.queryItems.forEach(element => {
      xmlString = xmlString.concat(element.getXML());
    });
    xmlString = xmlString.concat(`\t\t</columns>\n`);
    return xmlString;
  }
  getSQLXML() {
    return `\t\t<sql>\n${this.sqlQuery}\n\t\t</sql>\n`;
  }
  getId() {
    return this.id;
  }
}
class PowerQueryItem {
  constructor(name, table, field, access) {
    this.name = name;
    this.table = table.toUpperCase();
    this.field = field.toUpperCase();
    this.access = access;
    this.column = this.table + '.' + this.field;
  }
  getXML() {
    return `\t\t\t<column column="${this.column}">${this.name}</column>\n`;
  }
}
class PowerQueryArg {
  constructor(
    name,
    column,
    defaultValue,
    description,
    type = 'primitive',
    required = 'true'
  ) {
    this.name = name;
    this.column = column;
    this.defaultValue = defaultValue;
    this.description = description;
    this.type = type;
    this.required = required;
  }
  getXML() {
    return `\t\t\t<arg name=\"${this.name}\" column=\"${this.column}\" type =\"${this.type}\" required =\"${this.required}\" />\n`;
  }
}

module.exports = {
  Plugin: Plugin,
  PowerQuery: PowerQuery,
  PowerQueryItem: PowerQueryItem,
  PowerQueryArg,
  PowerQueryArg
};
