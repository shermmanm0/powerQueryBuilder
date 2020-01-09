select attend.studentid, s.lastfirst, attend.att_date, attc.att_code, sec.course_number, sec.external_expression
from attendance attend
inner join students s on attend.studentid = s.dcid
inner join attendance_code attc on attend.attendance_codeid = attc.id
inner join cc sched on attend.ccid = sched.id
inner join sections sec on sched.sectionid = sec.id
WHERE
attend.att_mode_code = 'ATT_ModeMeeting'
and
attc.att_code != 'WS'
AND
s.enroll_status = 0
order by attend.att_date