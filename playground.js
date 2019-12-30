var string = "inner join cycle_day cyc on cyc.id = cal.cycle_day_id\n"
string = string.trim();
var ssStart = string.indexOf("join")+5;
var ssEnd = string.indexOf("on");
var substr = string.substring(ssStart);
var substrArr = substr.split(' on ',)
var substrArr2 = substrArr[1].split(' = ')
substrArr[1]=substrArr2[0];
substrArr.push(substrArr2[1]);
console.log(substrArr);