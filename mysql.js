var mysql = require('mysql');

var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '2546',
  database : 'capstone'
});

db.connect();

exports.member = function(){
  db.query('select * from member', function(error, members) {
    var data = members
    
  });
};

// main page
exports.list = function(request, response){
  db.query('SELECT * FROM store where permission = 1', function (error, stores) {
  //stores[i].name에 가게 이름이 있음
  response.render('main.html',{data:stores});
  });
};

// restaurant page
exports.list_restaurant = function(request, response){
  db.query('SELECT * FROM store where category ="음식점" and permission = 1' ,function (error, restaurants) {
    response.render('restaurant.html', {data:restaurants});
  });
};

// cafe page
exports.list_cafe = function(request, response){
  db.query('SELECT * FROM store where category ="카페" and permission = 1' ,function (error, cafes) {
    response.render('restaurant.html', {data:cafes});
  });
};

// login page
exports.OK = function(request, response, post) {
  db.query('select * from member where id = ? and password = ?',[post.ID, post.PW] ,function(error, result){
    if (result.length > 0){
      console.log("OK");
      request.session.ID = post.ID
      request.session.login = true;
      request.session.user_type = result[0].user_type;
      response.redirect( `/`);
    } else {
      console.log("Retry");
      response.redirect('/login');
    }
  })
}

// id check
exports.check = function(request, response, post){
  
  db.query('select * from member where id =?', [post.ID], function(error, result){
    if (result.length === 0) {
      console.log('posible');
      // response.writeHead(302, {Location: `/`});  
    } else {
      console.log("exist");

    }
    response.redirect(`/create_user`);  
  });
}

// create page
exports.create = function(request, response, post) {
  db.query('insert into member (id, password, name, email, phone, user_type) values(?,?,?,?,?,?)', [post.ID, post.PW, post.name, post.email, post.phone, post.group], function(error, result){
    if (error){
      response.redirect('/createErr');
    }
    else{
      response.redirect('/login');
    }
  });
}

// restaurant menu
exports.restaurant = function(request, response, name) {
  db.query('select * from store inner join menu on store.store_number = menu.store_number where store.store_name = ?', [name], function(error, restaurant_menu){
    if(error)
    {
      console.log(error);
    }
      db.query('select * from seat where store_number = ? ORDER BY date DESC LIMIT 1', [restaurant_menu[0].store_number], function(error, seat){
        response.render('restaurant_menu.html', {data:restaurant_menu, name:name, seat:seat});
    });
  });
}

// cafe menu
exports.cafe = function(request, response, name) {
  db.query('select * from store inner join menu on store.store_number = menu.store_number where store.store_name = ?', [name], function(error, cafe_menu){
    if(error)
    {
      console.log(error);
    }
      db.query('select * from seat where store_number = ? ORDER BY date DESC LIMIT 1', [cafe_menu[0].store_number], function(error, seat){
        response.render('restaurant_menu.html', {data:cafe_menu, name:name,  seat : seat});
    });
  });
}

// admin
exports.admin = function(request, response) {
  db.query('select * from store where permission = 0', function(error, permission) {
    response.render('admin.html', {data:permission, name:'관리자'});
  });
}

exports.select_store = function(request, response, name) {
  db.query('select * from store where store_name =?', [name], function(error, select) {
    response.render('permission.html',{data:select})
  })
}

exports.permission = function(request, response, post) {
  db.query('UPDATE store SET permission=1 WHERE  store_number = ?  ',[post.number] ,function(error, result) {
    response.redirect('/');
  });
}

// business
exports.business = function(request, response) {
  db.query('select  *, member.id from member left join store on member.id = store.id where member.id = ?', [request.session.ID], function(error, myStore){
    response.render('business.html', {data:myStore});
  })
}
// 일반 사용자
exports.normal_user = function(request, response) {
  db.query('select * from member where id = ?', [request.session.ID], function(error, myIfo){
    response.render('user.html', {data:myIfo});
  })
}

exports.mystore_menu = function(request, response, name) {
  db.query('select store_number, permission from store where store_name = ? and id = ?', [name, request.session.ID], function(error, storeN){
    var storeNumber = storeN[0].store_number;
    var permission = storeN[0].permission;
    // console.log(store_number[0].store_number);
    db.query('select * from menu where store_number =?', [storeNumber], function(error, menuList){
      response.render('mystore.html', {data:menuList, name:name, permission:permission, storeNumber:storeNumber});
    })
  })
}

exports.menu_insert = function(request, response, post) {
  db.query('insert into menu (menu_name, price, store_number) values(?,?,?)', [post.menu_name, post.price, post.storenumber], function(error, result){
  if (error) {
    throw error;
  }
    response.redirect('/user')
    
  })
}
exports.seat_insert = function(request, response, post) {
  db.query('insert into seat (date,all_seat, remain_seat, store_number) values(now(),?,?,?)', [post.all_seat, post.remain_seat, post.storenumber], function(error, result){
  if (error) {
    throw error;
  }
    response.redirect('/user')
    
  })
}

exports.business_insert = function(request, response, post) {
  db.query('insert into store (store_number, store_name, category, store_phone, id) values(?,?,?,?,?)', [post.store_number, post.store_name, post.group, post.store_phone, post.id], function(error, result){
  if (error) {
    throw error;
  }
    response.redirect('/user')
    
  })
}