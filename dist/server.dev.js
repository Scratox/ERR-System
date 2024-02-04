"use strict";

var express = require('express');

var bodyParser = require('body-parser');

var db = require('./db');

var app = express();
var PORT = process.env.PORT || 8888;
app.use(express["static"]('public'));
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
})); // Middleware to get departments radio buttons

var getDepartmentsRadio = function getDepartmentsRadio(req, res, next) {
  var sql = 'SELECT DepartmentName FROM department';
  db.query(sql, function (err, results) {
    if (err) {
      console.error('Error fetching departments:', err);
      return res.status(500).send('Internal Server Error');
    }

    var radioButtons = results.map(function (department) {
      return "\n      <input type=\"radio\" name=\"department\" value=\"".concat(department.DepartmentName, "\">\n      <label>").concat(department.DepartmentName, "</label>\n    ");
    });
    res.locals.getDepartmentsRadio = radioButtons.join('');
    next();
  });
}; // Middleware to get modules dropdown


var getModulesDropdown = function getModulesDropdown(req, res, next) {
  var sql = 'SELECT ModuleName FROM modules';
  db.query(sql, function (err, results) {
    if (err) {
      console.error('Error fetching modules:', err);
      return res.status(500).send('Internal Server Error');
    }

    var dropdownOptions = results.map(function (module) {
      return "\n      <option value=\"".concat(module.ModuleName, "\">").concat(module.ModuleName, "</option>\n    ");
    });
    res.locals.getModulesDropdown = "<select name=\"modules\">".concat(dropdownOptions.join(''), "</select>");
    next();
  });
}; // Middleware to get teachers dropdown


var getTeachersDropdown = function getTeachersDropdown(req, res, next) {
  var sql = 'SELECT TeacherName FROM teachers';
  db.query(sql, function (err, results) {
    if (err) {
      console.error('Error fetching teachers:', err);
      return res.status(500).send('Internal Server Error');
    }

    var dropdownOptions = results.map(function (teacher) {
      return "\n      <option value=\"".concat(teacher.TeacherName, "\">").concat(teacher.TeacherName, "</option>\n    ");
    });
    res.locals.getTeachersDropdown = "<select name=\"teachers\">".concat(dropdownOptions.join(''), "</select>");
    next();
  });
}; // Authentication logic


var authenticateUser = function authenticateUser(username, password, callback) {
  var sql = 'SELECT * FROM users WHERE Username = ? AND Password = ?';
  db.query(sql, [username, password], function (err, results) {
    if (err) {
      console.error('Error during authentication:', err);
      return callback(err, null);
    }

    if (results.length === 0) {
      console.log('User not found during authentication for username:', username);
      return callback(null, null);
    }

    var user = results[0];
    console.log('User found during authentication:', user);
    callback(null, user);
  });
}; // Login route


app.post('/login', function (req, res) {
  var _req$body = req.body,
      username = _req$body.username,
      password = _req$body.password;
  authenticateUser(username, password, function (err, authenticatedUser) {
    if (err) {
      res.send('Error during authentication');
    } else if (!authenticatedUser) {
      res.send('Invalid credentials');
    } else {
      // Redirect based on user role
      if (authenticatedUser.role === 'Student') {
        res.redirect('/student');
      } else if (authenticatedUser.role === 'Teacher') {
        res.redirect('/teacher');
      } else {
        res.send('Invalid user role');
      }
    }
  });
}); // Student dashboard

app.get('/student', getDepartmentsRadio, getModulesDropdown, getTeachersDropdown, function (req, res) {
  // Assuming you have middleware functions to provide data for departments, modules, and teachers
  var data = {
    getDepartmentsRadio: res.locals.getDepartmentsRadio,
    getModulesDropdown: res.locals.getModulesDropdown,
    getTeachersDropdown: res.locals.getTeachersDropdown
  };
  res.render('student', data);
}); // Teacher dashboard

app.get('/teacher', function (req, res) {
  db.query('SELECT * FROM problemsubmissions', function (err, result) {
    if (err) {
      console.error('Database query error:', err);
      res.render('teacher', {
        result: null,
        error: 'Error during database query'
      });
    } else {
      res.render('teacher', {
        result: result
      });
    }
  });
}); // Index route

app.get('/', function (req, res) {
  res.render('index');
}); // Login route

app.get('/login', function (req, res) {
  res.render('login');
});
app.get('/submit-issue', function (req, res) {
  res.render('student');
}); // Error handling middleware

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});
app.listen(PORT, function () {
  console.log("Server is running on http://localhost:".concat(PORT));
});
//# sourceMappingURL=server.dev.js.map
