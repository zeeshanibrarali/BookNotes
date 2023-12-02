Instructions
What are Capstone Projects?

Overview
I read a lot of books but after I finish reading them I often don't remember all the most salient parts of the book. So I started taking notes. This capstone project is built on this idea. My friend Derek Sivers has this fantastic website where he has all the non-fiction books he has read, his notes, his ratings and when he read them. The books are sortable by rating, recency and title. It's a such cool idea for a project so I'm including it as a capstone here in this course.

Objectives
Revise how to integrate public APIs into web projects.

Gain more experience using Express/Node.js for server-side programming.

Demonstrate ability to Create Read Update and Delete data in a PostgreSQL Database to persist data.

Example Ideas
Use the Open Library Covers API to fetch book covers.

Create a database to store books you have read.

Have a way to add new data about books, update previous reviews and delete entries.

Display this information from your database in a website like https://sive.rs/book

Be able to sort your book entries by rating and recency.

Requirements
1. Database Persistance
Persist data using a PostgreSQL database.

Use CRUD methods to manipulate data in the database.

2. Project Planning
Think through your project, researching the API documentation, project features, what data you will store, and how it will be used in your web application.

Draw a database diagram on draw.io and plan out any relationships.

Think through the PostgreSQL command you will need to write to create the schema for your database.

3. Project Setup
Set up a new Node.js project using Express.js.

Include pg for working with your localhost PostgreSQL database.

Include EJS for templating.

Create a frontend in HTML CSS JS.

Ensure that the project has a structured directory and file organization.

4. API Integration
Implement at least a GET endpoint to interact with your chosen API.

Use Axios to send HTTP requests to the API and handle responses.

5. Data Presentation
Design the application to present the book covers from the API and the data in your database a in a user-friendly way.

Use appropriate HTML, CSS, and a templating engine like EJS.

Think about how you would allow the user to sort the data from the database.

6. Error Handling
Ensure that error handling is in place for both your application and any API requests. You can console log any errors, but you can also give users any user-relevant errors.

7. Documentation
Include comments throughout your code to explain your logic.

8. Code Sharing
Use what you have learnt about GitHub to commit and push your project to GitHub so that you can share it with other students in the Q&A area, I'd love to see what you've build too! You can tweet at me @yu_angela

Include a Readme.md file that explains how to start your server, what commands are needed to run your code. e.g. npm i  and then nodemon index.js

Recommended Resources
Express.js: Getting Started Guide

Node.js: Documentation

Axios: Documentation

Postgres: Documentation

pg: Documentation

Open Library Covers API:  https://openlibrary.org/dev/docs/api/covers