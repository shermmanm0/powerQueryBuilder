//import pq from 'powerQuery.js';
const fs = require ('fs');
const lineReader = require ('line-reader')
var tableNames = [];
var fieldNames = [];



function endOfQuery(line){
    return line.startsWith('where') || line.startsWith('order') || (line == null)
}

function lineIsFrom(line){
    return line.toLowerCase().startsWith('from')
    
}
function lineIsAJoin(line){
    return line.toLowerCase().startsWith('join') ||
    line.toLowerCase().startsWith('inner join') ||
    line.toLowerCase().startsWith('left join') ||
    line.toLowerCase().startsWith('right join')
}



lineReader.eachLine('testsql.sql', function(line, last) {
line = line.toLowerCase();
    //console.log(line);
    if (endOfQuery(line)) {
        fieldNames.forEach(field =>{
            tableNames.forEach(table =>{
                if (field.tableAbbreviation == table.tableAbbreviation){
                    field.tableName = table.tableName;
                }
            })
        })
        console.log(fieldNames);
      return false; // stop reading
    }
    else if (lineIsFrom(line)){
        let temp = line.replace('from','')
        temp = temp.trim();
        let tempObject = {
            'tableName': temp.split(' ')[0],
            'tableAbbreviation': temp.split(' ')[1]
        }
        tableNames.push(tempObject);
    }
    else if (lineIsAJoin(line)){
        let string = line.trim();
        let ssStart = string.indexOf("join")+5;
        let substr = string.substring(ssStart);
        let substrArr = substr.split(' on ',)
        let substrArr2 = substrArr[1].split(' = ')
        let tempObject1 = {
            'tableName': substrArr[0].split(' ')[0],
            'tableAbbreviation': substrArr[0].split(' ')[1]
        }
        let tempObject2 = {            
            'tableAbbreviation': substrArr2[0].split('.')[0],
            'fieldName': substrArr2[0].split('.')[1],
            'tableName': ""
        }
        let tempObject3 = {            
            'tableAbbreviation': substrArr2[1].split('.')[0],
            'fieldName': substrArr2[1].split('.')[1],
            'tableName': ""
        }
        tableNames.push(tempObject1);
        fieldNames.push(tempObject2);
        fieldNames.push(tempObject3);

    }
    else if (line.endsWith(',\n')){
        let temp = line.trim()
        temp = temp.substr(0,temp.length-1);
        let tempObject ={
            'tableAbbreviation': temp.split('.')[0],
            'fieldName': temp.split('.')[1],
            'tableName': ""
        }
        fieldNames.push(tempObject);
        
    }
    else{
        let temp = line.trim()
        temp = temp.substr(0,temp.length);
        let tempObject ={
            'tableAbbreviation': temp.split('.')[0],
            'fieldName': temp.split('.')[1],
            'tableName': ""
        }
        fieldNames.push(tempObject);
               
    }

  });
