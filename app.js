var request = require('request');
var cheerio = require('cheerio');
var bodyParser = require('body-parser');
var express = require('express');
var Subject = require('./subject');

var app = express();
var port = Number(process.env.PORT || 3000);
app.use(bodyParser.json());

// main region
app.get ('/', function (req, res) {
	res.writeHead(403, {'Content-Type': 'text/html'});
	res.end(require('fs').readFileSync(__dirname + "/help.html", 'utf8'));
});
app.post('/api/time-table', function (req, res) {
	var name = req.body.name;
	var pass = req.body.pass;
	console.log(JSON.stringify(req.body));
	getFormBuildId(name, pass, res, loginDaa);
});
app.listen(port);
// end main region




// function region
function getFormBuildId (name, pass, res, callback) {
	console.log('getFormBuildId');
	request('https://daa.uit.edu.vn/', function(err, response, body) {
		if (!err) {
			console.log(response.statusCode);
			var $ = cheerio.load(body);
			var formBuildId = $('#block-user-login').find('input[name="form_build_id"]').attr('value');
			if (callback != null)
				callback(name, pass, formBuildId, res, getSchedule);
		}
	});
}

function loginDaa (name, pass, formBuildId, res, callback) {
	console.log('login');
	var myReq = {
		url: 'https://daa.uit.edu.vn/user/login%26homepage?destination=node',
		form: {
			name: name,
			pass: pass,
			form_build_id: formBuildId,
			form_id: 'user_login_block'
		}
	};

	request.post(myReq, function (err, response, body) {
		if (!err) {
			var $ = cheerio.load(body);
			

			if ($('div#block-user-login').length) {
				console.log('Login fail');
				res.writeHead(403, {'Content-Type': 'text/plain'});
				res.end('Login fail');
			} else {
				console.log('Login success');
				var ck = response.headers['set-cookie'];
				var cookie = ck[1].substring(0, ck[1].length - 50);
				if (callback != null)
					callback(cookie, res);
			}
		}
	});	
}

function getSchedule (cookie, res) {
	console.log('getSchedule');
	var myReq = {
	    headers: {
	      'Cookie': cookie
	    },
	    uri: 'https://daa.uit.edu.vn/sinhvien/thoikhoabieu/',
	    method: 'GET'
	  };

	request(myReq, function (err, response, body) {
	   		if (!err) {
				console.log(response.statusCode);
				var $ = cheerio.load(body);
				console.log($('div#block-system-main').find('div.title_thongtindangky > p').text());

				var schedule = {
					monday: [],
					tuesday: [],
					wednesday: [],
					thursday: [],
					friday: [],
					saturday: []
				}
				var table = $('tbody').children();

				// tiet 1
				crawlSchedule ($, table, schedule, 0);
				// tiet 4
				crawlSchedule ($, table, schedule, 3);
				// tiet 6
				crawlSchedule ($, table, schedule, 5);
				// tiet 9
				crawlSchedule ($, table, schedule, 8);
									

				res.writeHead(200, { 'Content-Type': 'text/json' });
				res.end(JSON.stringify(schedule));
			} else 
				console.log(err);
	  });
}

function deHTML (html) {
	var $dehtml = cheerio.load(html);
	return $dehtml.text();
}

function pushSubjectToSchedule (schedule, pos, subject) {
	switch (pos) {
		case 1:
			schedule.monday.push(subject);
			break;
		case 2:
			schedule.tuesday.push(subject);
			break;
		case 3:
			schedule.wednesday.push(subject);
			break;
		case 4:
			schedule.thursday.push(subject);
			break;
		case 5:
			schedule.friday.push(subject);
			break;
		case 6:
			schedule.saturday.push(subject);
			break;
	}
}

function crawlSchedule ($, table, schedule, lesson) {
	for (var i=1; i<=6; i++) {
		var content = $(table).eq(lesson).children().eq(i);
		if (content.children().length) {
			var sub = new Subject();

			for (var j=0; j<6; j++) {
				var html = $(content).html().split('<br>')[j];
				sub.setData(j, deHTML(html));	
			}
			sub.setData(6, lesson+1);
			sub.setData(7, parseInt($(content).attr('rowspan')));
			pushSubjectToSchedule(schedule, i, sub);
		}
	}		
}
// end function region