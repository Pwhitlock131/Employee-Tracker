const inquirer = require('inquirer');
const express = require('express');
const mysql = require('mysql2');
const cTable = require('console.table');
require('dotenv').config();

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
}, console.log(`Connected to the employee_db database.`));

db.connect(err => {
    if (err) throw err;
    console.log("Connected as id" + db.threadId);
    startScreen();
});

const startScreen = () => inquirer.createPromptModule({
    type: "list",
    choices: ["Add department", "Add role", "Add employee", "View departments", "View roles", "View employees", "Update employee role", "Quit"],
    message: "What would you like to do?",
    name: "option"
}).then(result => {
    console.log("You entered: " + result.option);
    switch (result.option) {
        case "Add department": addDepartment(); break;
        case "Add role": addRole(); break;
        case "Add employee": addEmployee(); break;
        case "View departments": viewDepartments(); break;
        case "View roles": viewRoles(); break;
        case "View employees": viewEmployees(); break;
        case "Update employee role": updateEmployee(); break;
        default: quit();
    }
});

const addDepartment = () => inquirer.prompt({
    type: "input",
    message: "What is the name of the department?",
    name: "deptName"
}).then(answer => {
    db.promise().execute("INSERT INTO department (name) VALUES (?)", [answer.deptName])
        .then(([rows, fields]) => {
            console.table(rows);
            startScreen();
        })
        .catch(err => {
            console.error(err);
            startScreen();
        });
});

const addRole = () => inquirer.prompt([
    { type: "input", message: "What is the name of this role?", name: "roleName" },
    { type: "input", message: "What is the salary for this role?", name: "salaryTotal" },
    { type: "input", message: "What is the department id number?", name: "deptID" }
]).then(answer => {
    db.promise().execute("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",
        [answer.roleName, answer.salaryTotal, answer.deptID])
        .then(([rows, fields]) => {
            console.table(rows);
            startScreen();
        })
        .catch(err => {
            console.error(err);
            startScreen();
        });
});

const addEmployee = () => inquirer.prompt([
    { type: "input", message: "What is the first name of this employee?", name: "firstName" },
    { type: "input", message: "What is the last name of this employee?", name: "lastName" },
    { type: "input", message: "What is this employees role ID number?", name: "roleID" },
    { type: "input", message: "What is their manager ID number?", name: "managerID" }
]).then(answer => {
    db.promise().execute("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
        [answer.firstName, answer.lastName, answer.roleID, answer.managerID])
        .then(([rows, fields]) => {
            console.table(rows);
            startScreen();
        })
        .catch(err => {
            console.error(err);
            startScreen();
        });
});

const updateEmployee = () => inquirer.prompt([
    { type: "input", message: "Which employee would you like to update?", name: "updateEmployee" },
    { type: "input", message: "What is your desired update?", name: "updateRole" }
]).then(answer => {
    console.log("Updating employee:", answer.updateEmployee, "to role:", answer.updateRole);

    db.promise().execute('UPDATE employee SET role_id=? WHERE first_name=?', [answer.updateRole, answer.updateEmployee])
        .then(([rows, fields]) => {
            console.table(rows);
            startScreen();
        })
        .catch(err => {
            console.error(err);
            startScreen();
        });
});

const viewDepartments = () => db.promise().execute("SELECT * FROM department")
    .then(([rows, fields]) => {
        console.table(rows);
        startScreen();
    })
    .catch(err => {
        console.error(err);
        startScreen();
    });

const viewRoles = () => db.promise().execute("SELECT * FROM role")
    .then(([rows, fields]) => {
        console.table(rows);
        startScreen();
    })
    .catch(err => {
        console.error(err);
        startScreen();
    });


const viewEmployees = () => db.promise().execute("SELECT * FROM employee")
    .then(([rows, fields]) => {
        console.table(rows);
        startScreen();
    })
    .catch(err => {
        console.error(err);
        startScreen();
    });

const quit = () => {
    db.end();
    process.exit();
};