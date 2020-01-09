var https = require('follow-redirects').https;
var fs = require('fs');
const _ = require('lodash')

var options = {
  'method': 'POST',
  'hostname': 'cristoreyrichmond.powerschool.com',
  'path': '/ws/schema/query/com.cristoreyrichmond.powerschool.attendance.getAllAttendanceData?pagesize=0',
  'headers': {
    'Authorization': 'Bearer c21b4ecc-0d33-4bd1-9a1f-4ab91c11e43a',
    'Content-Type': 'application/json'
  },
  'maxRedirects': 20
};

function parseAttendanceData(data){
  let attendanceDataByStudent = []
  data.forEach(entry =>{
    if (_.findIndex(attendanceDataByStudent,{"name":entry.slastfirst}) ===-1 ){
      attendanceDataByStudent.push({"name":entry.slastfirst,"courses": [{"period":entry.secexternal_expression,"courseName":entry.ccourse_name,"absences":[],"tardies":[]}]});
    }
    else{
      attendanceDataByStudent[_.findIndex(attendanceDataByStudent,{"name":entry.slastfirst})].courses.push({"period":entry.secexternal_expression,"courseName":entry.ccourse_name,"absences":[],"tardies":[]});
    }
  })
  attendanceDataByStudent = _.orderBy(attendanceDataByStudent,['name'])
  attendanceDataByStudent.forEach(student =>{
    student.courses = _.sortBy(student.courses, ['period'])
  })
  fs.writeFileSync('studentAttendanceData.json',JSON.stringify(attendanceDataByStudent))
}
var req = https.request(options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function (chunk) {
    var attenanceDataObject = JSON.parse(fs.readFileSync('./studentAttendanceData.json','UTF8'))
    var body = Buffer.concat(chunks);
    var jsonData = JSON.parse(body).record
    console.log(_.findIndex(attenanceDataObject,{'name': jsonData[0].slastfirst}))
    jsonData.forEach(entry =>{
      
    })

  });

  res.on("error", function (error) {
    console.error(error);
  });
});

req.end();