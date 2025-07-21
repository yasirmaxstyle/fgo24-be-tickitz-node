# BACKEND ENVIRONMENT EWALLET

This project implement basic setup for backend of movie ticketing application using Node.js. This project utilizes Express.js as web framework integrated with PostgreSQL as databse. This project mainly use MVC pattern for better separation of concerns, which helps in building more organized and mantainable application.

## API Endpoints Overview

| Endpoints | Method | Description |
| --- | --- | --- |
|/auth/register | POST | register as new user to get user privelege |
|/auth/login | POST | get access to app using token auth |
|/auth/forgot-password | POST | in case of user forgot their password |
|/auth/reset-password | POST | request reset password user before login |
|/auth/logout | POST | logout from the app |

## How to run this project
1. Clone this project
```sh
git clone https://github.com/yasirmaxstyle/fgo24-be-tickitz-node.git .
```
2. Install npm to get node_nodules
```javascript
npm install
```
3. Run the app
```javascript
npm run dev
```

## Technologies and Dependencies
1. Node.js
2. PostgreSQL
3. Docker
3. Express.js

## How to take part in this project
You are free to fork this project, make improvement and submit a pull request to improve this project. If you find this useful or if you have suggestion, you can start discussing through my social media below.
- [Instagram](https://www.instagram.com/yasirmaxstyle/)
- [LinkedIn](https://www.linkedin.com/in/muhamad-yasir-806230117/)

## License
This project is under MIT License