//import pq from 'powerQuery.js';
const fs = require ('fs');
const lineReader = require ('line-reader')
const readline = require('readline');

var dataAsArray = []
var tableNames = [];
var fieldNames = [];

class DataFromSQLFile{
  constructor(sqlFileName){
    this.readSQLFile(sqlFileName)
    this.tables = [];
    this.fields = [];
    //this.processSQLFile();
    }

  readSQLFile(path){
    let tempBuffer = fs.readFileSync(path,'utf8').split("\n");
    tempBuffer.forEach(line => {
      this.readSQLLine(line);
    })
    //console.log(tempBuffer);
 
  }
  readSQLLine(line){
    let temp = new LineFromSQLFile(line)
    temp.printLineData();

  }
  processSQLFile(){
    this.lineArray.forEach(line =>{
      this.readSQLLine(line);
    })

  }

}
class LineFromSQLFile{
  constructor(input){
    this.lineData = "";
    this.formatLineData(input);
  }
  formatLineData(input){
    this.setLineData(input.toLowerCase().trim());
    this.removeCommaFromEndOfLine();

  }
  processLine(){
    if (this.isSelect() || this.isAnOrderBy()){
      this.ignoreLine();
    }
    else if (this.isAFrom()){
      this.processFrom();
    }
    else if (this.isAJoin()){

    }
    else if (this.isAWhere()){

    }
    else if (this.isAnAnd()){

    }

    console.log(this.sqlObjectData)
  }

  ignoreLine(){

  }
  isSpecialLine(){
    return this.isSelect()||this.isEndOfQuery()||this.isAFrom()||this.isAJoin()||this.isAWhere()||this.isAnOrderBy()||this.isAnAnd();
    
  }
  isAFrom(){
    return this.lineData.startsWith('from') 
  }
  processFrom(){
    this.removeFromStartOfLine('from ');
    this.sqlObjectData = {
        'tableName': temp.split(' ')[0],
        'tableAbbreviation': temp.split(' ')[1]
      }
    

  }

  isAJoin(){
    return this.lineData.startsWith('join') ||
    this.lineData.startsWith('inner join') ||
    this.lineData.startsWith('left join') ||
    this.lineData.startsWith('right join')
  }
  processJoin(){

  }
  isAWhere(){
    return this.lineData.startsWith("where");
  }

  processWhere(){

  }
  isAnOrderBy(){
    return this.lineData.startsWith("order by");
  }
  isAnAnd(){
    return this.lineData.startsWith("and");
  }

  removeCommaFromEndOfLine(){
    if (this.lineData.endsWith(',')){
      this.setLineData(this.lineData.slice(0,this.getLineLength()-1))
    }


  }
  setLineData(input){
    this.lineData = input;
  }
  printLineData(){
    console.log(this.lineData);
    console.log(this.isSpecialLine());
  }
  getLineLength(){
    return this.lineData.length;
  }
  removeFromStartOfLine(toRemove){
    this.setLineData(this.lineData.substring(toRemove.length+1,this.getLineLength()))
  }

}

var test = new DataFromSQLFile('testsql.sql');

