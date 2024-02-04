const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 8888;

app.use(express.static('public'));
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'examination_rectifier',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware to get departments radio buttons
const getDepartmentsRadio = (req, res, next) => {
  const sql = 'SELECT DepartmentName FROM department';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching departments:', err);
      return res.status(500).send('Internal Server Error');
    }

    const radioButtons = results.map((department) => `
      <input type="radio" name="department" value="${department.DepartmentName}">
      <label>${department.DepartmentName}</label>
    `);

    res.locals.getDepartmentsRadio = radioButtons.join('');
    next();
  });
};

// Middleware to get modules dropdown
const getModulesDropdown = (req, res, next) => {
  const sql = 'SELECT ModuleName FROM modules';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching modules:', err);
      return res.status(500).send('Internal Server Error');
    }

    const dropdownOptions = results.map((module) => `
      <option value="${module.ModuleName}">${module.ModuleName}</option>
    `);

    res.locals.getModulesDropdown = `<select name="modules">${dropdownOptions.join('')}</select>`;
    next();
  });
};

// Middleware to get teachers dropdown
const getTeachersDropdown = (req, res, next) => {
  const sql = 'SELECT TeacherName FROM teachers';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching teachers:', err);
      return res.status(500).send('Internal Server Error');
    }

    const dropdownOptions = results.map((teacher) => `
      <option value="${teacher.TeacherName}">${teacher.TeacherName}</option>
    `);

    res.locals.getTeachersDropdown = `<select name="teachers">${dropdownOptions.join('')}</select>`;
    next();
  });
};

// Authentication logic
const authenticateUser = (username, password, callback) => {
  const sql = 'SELECT * FROM users WHERE Username = ? AND Password = ?';
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error('Error during authentication:', err);
      return callback(err, null);
    }

    if (results.length === 0) {
      console.log('User not found during authentication for username:', username);
      return callback(null, null);
    }

    const user = results[0];
    console.log('User found during authentication:', user);
    callback(null, user);
  });
};

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  authenticateUser(username, password, (err, authenticatedUser) => {
    if (err) {
      res.send('Error during authentication');
    } else if (!authenticatedUser) {
      res.send('Invalid credentials');
    } else {
      // Redirect based on user role
      if (authenticatedUser.UserRole === 'Student') {
        res.redirect('/student');
      } else if (authenticatedUser.UserRole === 'Teacher') {
        res.redirect('/teacher');
      } else {
        res.send('Invalid user role');
      }
    }
  });
});

// Student dashboard
app.get('/student', getDepartmentsRadio, getModulesDropdown, getTeachersDropdown, (req, res) => {
  // Assuming you have middleware functions to provide data for departments, modules, and teachers
  const data = {
    getDepartmentsRadio: res.locals.getDepartmentsRadio,
    getModulesDropdown: res.locals.getModulesDropdown,
    getTeachersDropdown: res.locals.getTeachersDropdown,
  };
  res.render('student', data);
});


// Handle POST request to /submit-issue
app.post('/submit-issue', (req, res) => {
  const { description } = req.body;

  // Assuming you have Status value available
  const status = 'Pending'; // You can set the initial status as needed

  // Get the current date and time for SubmissionDate
  const submissionDate = new Date().toISOString();

  // Insert data into problemsubmissions table with only non-null values
  const sql = `
    INSERT INTO problemsubmissions (ProblemDescription, SubmissionDate, Status)
    VALUES (?, ?, ?)
  `;

  const values = [description, submissionDate, status];

  // Filter out null or undefined values
  const nonNullValues = values.filter(value => value !== null && value !== undefined);

  db.query(sql, nonNullValues, (err, result) => {
    if (err) {
      console.error('Error inserting data into problemsubmissions table:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Data inserted successfully into problemsubmissions table');
      res.send('Form submitted successfully');
    }
  });
});

// Teacher dashboard
app.get('/teacher', (req, res) => {
  db.query('SELECT * FROM problemsubmissions', (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      res.render('teacher', { result: null, error: 'Error during database query' });
    } else {
      res.render('teacher', { result });
    }
  });
});

// Index route
app.get('/', (req, res) => {
  res.render('index');
});

// Login route
app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/submit-issue', (req, res) => {
  res.render('student');
});

app.get('/feedback', (req, res) => {
  res.render('feedback');
});
app.get('/submitted-feedback', (req, res) => {
  res.render('submitted-feedback');
});

app.get('/home', (req, res) => {
  res.render('home');
});
//for submitting feedback
app.post('/feedback', (req, res) => {
  const { StudentID, TeacherID, FeedbackText, FeedbackDate, ExamID } = req.body;

  const sql = 'INSERT INTO feedback (StudentID, TeacherID, FeedbackText, FeedbackDate, ExamID) VALUES (?, ?, ?, ?, ?)';
  const values = [StudentID, TeacherID, FeedbackText, FeedbackDate, ExamID];

  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }

    console.log('Feedback submitted successfully.');
    res.redirect('/feedback');
  });
});

//for viewing feedback

// Route to view feedback for a specific student
app.get('/submitted-feedback/:studentID', (req, res) => {
  const studentID = req.params.studentID;

  // Query to retrieve feedback based on StudentID
  const sql = 'SELECT * FROM feedback WHERE StudentID = ?';
  pool.query(sql, [studentID], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }

    const feedbackData = result;

    // Render the view-feedback page with the retrieved feedback data
    res.render('submitted-feedback', { feedbackData });
  });
});



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
