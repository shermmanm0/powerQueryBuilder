select s.lastfirst, s.id, c.course_name, sec.external_expression, c.course_number
from cc coursecollection
inner join students s on coursecollection.studentid = s.id 
inner join sections sec on coursecollection.sectionid = sec.id
inner join courses c on sec.course_number = c.course_number
WHERE
s.enroll_status = 0