var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var sql = require('./mysql.js');
var session = require('express-session')
var path = require('path');
var FileStore = require('session-file-store')(session)

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.static('views'));
app.use(express.static('html'));

function login_cookie(request, response) {
    if(request.session.login){
        return true;
    } else {
        return false;
    }
}

app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    secret:'asd',
    resave:false,
    saveUninitialized : false,
  //   store:new FileStore(),
  cookie: {
      httpOnly: false,
      Secure: true
    }
}))  

// 모든 가게 리스트
app.get('/', function(request, response) { 
    //     fs.readFile(__dirname +'/html/main.html', (err, data) => { // 파일 읽는 메소드
    //     if (err) {
    //         return console.error(err); // 에러 발생시 에러 기록하고 종료
    //     }
    //     response.end(data, 'utf-8');
    // }); 
    // sql.list(request, response);
    response.render('main.html');
});

// 로그인
app.get('/login', function(request, response){
    fs.readFile(__dirname + '/views/login.html', (err, data) => { // 파일 읽는 메소드
        if (err) {
            return console.error(err); // 에러 발생시 에러 기록하고 종료
        }
        response.end(data, 'utf-8');
    });
});

// 로그인시 인증절차
app.post('/login_access', function(request, response) { 
    var post = request.body;
    sql.OK(request, response, post);
});

// 회원가입
app.get('/create', function(request, response) {
    fs.readFile('./views/create.html', (err, data) => { // 파일 읽는 메소드
        if (err) {
            return console.error(err); // 에러 발생시 에러 기록하고 종료
        }
        response.end(data, 'utf-8');
    });
});

// 회원가입시 DB에 추가 작업
app.post('/create_user', function(request, response) {
    var post = request.body;
    sql.create(request, response, post);
});

// 회원가입 실패
app.get('/createErr', function(request, response) {
    fs.readFile('./views/createErr.html', (err, data) => { // 파일 읽는 메소드
        if (err) {
            return console.error(err); // 에러 발생시 에러 기록하고 종료
        }
        response.end(data);
    });
});
// 회원가입시 ID 중복확인
app.post('/IdCheck', function(request, response) {
    var post = request.body;
    sql.check(request, response, post);
});

// 음식점 리스트
app.get('/restaurant', function(request, response) {
    sql.list_restaurant(request, response)
});

// 특정 음식점에 대한 메뉴 및 정보
app.get('/restaurant/:name', function(request, response) {
    var name = request.params.name;
    console.log(name)
    sql.restaurant(request, response, name)
});

// 카페 리스트
app.get('/cafe', function(request, response) {
    sql.list_cafe(request, response)
});

// 특정 카페에 대한 메뉴 및 정보
app.get('/cafe/:name', function(request, response) {
    var name = request.params.name;
    sql.cafe(request, response, name)
});

// 마이페이지
app.get('/user', function(request, response) {
    if(login_cookie(request, response)) {
        if(request.session.user_type === 'admin'){
            sql.admin(request, response);
        } else if(request.session.user_type === 'business') {
            sql.business(request, response);
        } else {
            sql.normal_user(request, response);
        }
    } else {
        response.redirect('/login');
    }
    
});

app.get('/permission/:name', function(request, response) {
    var name = request.params.name;
    sql.select_store(request, response, name);
})

app.post('/permission', function(request, response) {
    var post = request.body;
    console.log(post);
    sql.permission(request, response, post);
})

// 사업자 한 가게에 대한 정보 화면(가게 이름, 메뉴 리스트, 좌석, 사업증)
app.get('/business/:name', function(request, response){
    var name = request.params.name;
    sql.mystore_menu(request, response, name)
})


app.get('/business/:name/seat', function(request, response){
    var name = request.params.name;
    sql.myseat(request, response, name);
})

app.post('/menu_process', function(request, response){
    var post = request.body;
    sql.menu_insert(request, response, post);
})

app.post('/seat_process', function(request, response){
    var post = request.body;
    sql.seat_insert(request, response, post);
})

app.post('/business_process', function(request, response){
    var post = request.body;
    sql.business_insert(request, response, post);
})

// 로그아웃 
app.get('/logout', function(request, response){
  request.session.destroy(function(err){
    response.clearCookie('connect.sid')
    response.redirect('/');
  });
});

app.listen(3000, function() {
  console.log('Example app listening on port 3000!')
});
