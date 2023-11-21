-- Create the Database
CREATE DATABASE IF NOT EXISTS ExamResultsSystem;

-- Switch to the ExamResultsSystem Database
USE ExamResultsSystem;

-- User Entity
CREATE TABLE User (
    UserID INT PRIMARY KEY,
    Username VARCHAR(255) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Role VARCHAR(50) NOT NULL
);

-- Student Entity
CREATE TABLE Student (
    StudentID INT PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    DateOfBirth DATE,
    ContactInformation VARCHAR(255)
);

-- Teacher Entity
CREATE TABLE Teacher (
    TeacherID INT PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    SubjectsTaught VARCHAR(255),
    ContactInformation VARCHAR(255)
);

-- Department Entity
CREATE TABLE Department (
    DepartmentID INT PRIMARY KEY,
    DepartmentName VARCHAR(100) NOT NULL,
    HeadOfDepartment VARCHAR(255)
);

-- Course Entity
CREATE TABLE Course (
    CourseID INT PRIMARY KEY,
    CourseName VARCHAR(100) NOT NULL,
    Description TEXT,
    DepartmentID INT,
    FOREIGN KEY (DepartmentID) REFERENCES Department(DepartmentID)
);

-- Final Exam Entity
CREATE TABLE FinalExam (
    ExamID INT PRIMARY KEY,
    CourseID INT,
    Date DATE,
    Time TIME,
    Duration INT,
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID)
);

-- Coursework Entity
CREATE TABLE Coursework (
    CourseworkID INT PRIMARY KEY,
    CourseID INT,
    StudentID INT,
    Type VARCHAR(50) NOT NULL,
    MarksObtained INT,
    DateSubmitted DATE,
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID),
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID)
);

-- Result Entity
CREATE TABLE Result (
    ResultID INT PRIMARY KEY,
    StudentID INT,
    ExamID INT,
    CourseworkID INT,
    MarksObtained INT,
    Grade VARCHAR(10),
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID),
    FOREIGN KEY (ExamID) REFERENCES FinalExam(ExamID),
    FOREIGN KEY (CourseworkID) REFERENCES Coursework(CourseworkID)
);

-- Problem Entity
CREATE TABLE Problem (
    ProblemID INT PRIMARY KEY,
    StudentID INT,
    ExamID INT,
    CourseworkID INT,
    Description TEXT,
    Status VARCHAR(20),
    DateReported DATE,
    DateResolved DATE,
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID),
    FOREIGN KEY (ExamID) REFERENCES FinalExam(ExamID),
    FOREIGN KEY (CourseworkID) REFERENCES Coursework(CourseworkID)
);

-- Feedback Entity
CREATE TABLE Feedback (
    FeedbackID INT PRIMARY KEY,
    StudentID INT,
    TeacherID INT,
    CourseworkID INT,
    Text TEXT,
    Timestamp TIMESTAMP,
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID),
    FOREIGN KEY (TeacherID) REFERENCES Teacher(TeacherID),
    FOREIGN KEY (CourseworkID) REFERENCES Coursework(CourseworkID)
);
