import inquirer from 'inquirer';
import bcrypt from 'bcrypt';
import db from '../app.js';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    password: string;
    email: string;
}

// In-memory session store
interface Session {
    [key: number]: string; // Maps userId to username
}

const sessions: Session = {};

// Function to register a new user
async function registerUser() {
    const answer = await inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: 'Enter your first name:'
        },
        {
            type: 'input',
            name: 'last_name',
            message: 'Please Enter your last name:'
        },
        {
            type: 'input',
            name: 'username',
            message: 'Choose a username:'
        },
        {
            type: 'password',
            name: 'password',
            message: 'Choose a password:'
        },
        {
            type: 'input',
            name: 'email',
            message: 'Enter your email:'
        }
    ]);

    const hashedPassword = await bcrypt.hash(answer.password, 10);

    db.run(
        `INSERT INTO users (first_name, last_name, username, password, email) VALUES (?, ?, ?, ?, ?)`,
        [answer.first_name, answer.last_name, answer.username, hashedPassword, answer.email],
        function (err) {
            if (err) {
                console.error('Error creating user:', err.message);
            } else {
                console.log('User registered successfully!');
            }
        }
    );
}


// Function to login a user
async function loginUser() {
    const answer = await inquirer.prompt([
        {
            type: 'input',
            name: 'username',
            message: 'Enter your username:'
        },
        {
            type: 'password',
            name: 'password',
            message: 'Enter your password:'
        }
    ]);

    db.get(
        `SELECT * FROM users WHERE username = ?`,
        [answer.username],
        async (err, row) => {
            if (err) {
                console.error('Error fetching user:', err.message);
            } else if (row) {
                const user = row as User; // Explicitly cast to User type
                const match = await bcrypt.compare(answer.password, user.password);
                if (match) {
                    sessions[user.id] = user.username;
                    console.log(`Login successful! Welcome, ${user.username}.`);
                } else {
                    console.log('Invalid username or password.');
                }
            } else {
                console.log('Invalid username or password.');
            }
        }
    );
    
}


// Function to logout a user
async function logoutUser() {
    const answer = await inquirer.prompt([
        {
            type: 'input',
            name: 'username',
            message: 'Enter your username to logout:'
        }
    ]);

    const userSessionKey = Object.keys(sessions).find(key => sessions[+key] === answer.username);

    if (userSessionKey) {
        delete sessions[+userSessionKey];
        console.log('You have logged out successfully.');
    } else {
        console.log('No active session found for this username.');
    }
}


// Function to display user options
async function userOptions() {
    let shouldContinue = true;

    do {
        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: ['Register', 'Login', 'Logout', 'Exit']
            }
        ]);

        switch (answer.action) {
            case 'Register':
                await registerUser();
                break;
            case 'Login':
                await loginUser();
                break;
            case 'Logout':
                await logoutUser();
                break;
            case 'Exit':
                console.log('Goodbye!');
                shouldContinue = false; // Stop the loop
                break;
        }
    } while (shouldContinue);
}


// Begin cmd line prompts
userOptions();