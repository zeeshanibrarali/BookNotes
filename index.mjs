// imports
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { getBookDetails } from './bookService.mjs';
import _ from "lodash";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// set up
dotenv.config();
const app = express();
const port = 3000;
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// database connectivity
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Book",
  password: "zeeshan",
  port: 5432,
}); db.connect();

// Home Page
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books");
    const booksFromDatabase = result.rows;

    const booksWithDetails = await Promise.all(booksFromDatabase.map(async (book) => {
      try {
        // Check if the book details are already in the database
        const existingBook = await db.query("SELECT * FROM books WHERE id = $1", [book.id]);

        if (existingBook.rows.length > 0) {
          // Book details are already in the database, use them
          const bookDetails = await getBookDetails(book.title);

          // Update existing book details with ISBN and cover URL
          existingBook.rows[0].isbn = bookDetails.isbn;
          existingBook.rows[0].cover_url = bookDetails.coverUrl;
          existingBook.rows[0].author = bookDetails.author;


          // Update the corresponding book in the database
          const updateQuery = `
            UPDATE books
            SET isbn = $1, cover_url = $2 ,author = $3
            WHERE id = $4;
          `;

          await db.query(updateQuery, [existingBook.rows[0].isbn, existingBook.rows[0].cover_url, existingBook.rows[0].author, existingBook.rows[0].id]);

          return existingBook.rows[0];
        } else {
          // Fetch details from the API and update the database
          const bookDetails = await getBookDetails(book.title);

          book.isbn = bookDetails.isbn;
          book.cover_url = bookDetails.coverUrl;

          // Insert the book details into the database
          const insertQuery = `
            INSERT INTO books (id, title, key_principles, quotes, actions_to_take, personal_reflections, rating, submit_date, cover_url, author, isbn)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (id) DO NOTHING;
          `;

          await db.query(insertQuery, [book.id, book.title, book.key_principles, book.quotes, book.actions_to_take, book.personal_reflections, book.rating, book.submit_date, book.cover_url, book.author, book.isbn]);

          return book;
        }
      } catch (error) {
        console.error('Error fetching book details:', error.message);
        return {
          ...book,
          cover_url: null,
          author: 'Unknown Author',
          isbn: null,
        };
      }
    }));

    res.render("home.ejs", { books: booksWithDetails });
  } catch (error) {
    console.error('Error fetching books from the database:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Book Page
app.get("/book/:bookId", async function (req, res) {
  const requestedBookId = req.params.bookId;
  try {
    // Check if the book details are already in the database
    const existingBook = await db.query("SELECT * FROM books WHERE id = $1", [requestedBookId]);

    if (existingBook.rows.length > 0) {
      // Book details are already in the database, use them
      const bookFromDatabase = existingBook.rows[0];
      renderBookTemplate(res, bookFromDatabase);
    } else {
      // Fetch details from the API and update the database
      const matchingBook = await db.query("SELECT * FROM books WHERE id = $1", [requestedBookId]);

      if (matchingBook.rows.length > 0) {
        const bookDetails = await getBookDetails(matchingBook.rows[0].title);
        const updatedBook = {
          ...matchingBook.rows[0],
          ...bookDetails,
        };

        // Update the corresponding book in the database
        const updateQuery = `
          UPDATE books
          SET cover_url = $1, author = $2, isbn = $3
          WHERE id = $4;
        `;

        await db.query(updateQuery, [updatedBook.coverUrl, updatedBook.author, updatedBook.isbn, requestedBookId]);

        renderBookTemplate(res, updatedBook);
      } else {
        res.status(404).send("Book not found");
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while retrieving the book.");
  }
});
function renderBookTemplate(res, book) {
  res.render("book.ejs", { book: book });
}

// features 
app.get("/features", function (req, res) {
  res.render("features");
});

// About and Contact Page
app.get(['/about', '/contact'], (req, res) => {
  const isContactRoute = req.path === '/about';

  res.render('about', { isContactRoute });
});

// Add Page
app.get("/add", function (req, res) {
  res.render("add-edit", { isEditMode: false });
});

// Adding book to database
app.post("/add", async function (req, res) {
  try {
    const {
      title,
      key_principles,
      quotes,
      actions_to_take,
      personal_reflections,
      rating,
      submit_date,
    } = req.body;

    // Insert the book details into the database
    const insertQuery = `
      INSERT INTO books (title, key_principles, quotes, actions_to_take, personal_reflections, rating, submit_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7);
    `;

    await db.query(insertQuery, [
      title,
      key_principles,
      quotes,
      actions_to_take,
      personal_reflections,
      rating,
      submit_date,
    ]);

    res.redirect("/");
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Edit page
app.get("/edit/:bookId", async function (req, res) {
  const requestedBookId = req.params.bookId;
  try {
    // Fetch the existing book details from the database
    const existingBook = await db.query("SELECT * FROM books WHERE id = $1", [requestedBookId]);

    if (existingBook.rows.length > 0) {
      // Book exists, render the edit page with existing details
      res.render("add-edit", { isEditMode: true, book: existingBook.rows[0] });
    } else {
      // Book not found
      res.status(404).send("Book not found");
    }
  } catch (error) {
    console.error('Error fetching book details for edit:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Delete a book
app.post("/delete/:bookId", async function (req, res) {
  const bookIdToDelete = req.params.bookId;
  try {
    // Check if the book exists in the database
    const existingBook = await db.query("SELECT * FROM books WHERE id = $1", [bookIdToDelete]);

    if (existingBook.rows.length > 0) {
      // Book exists, delete it
      const deleteQuery = "DELETE FROM books WHERE id = $1";
      await db.query(deleteQuery, [bookIdToDelete]);

      res.redirect("/");
    } else {
      // Book not found
      res.status(404).send("Book not found");
    }
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Update Book
app.post("/edit/:bookId", async function (req, res) {
  const bookIdToUpdate = req.params.bookId;
  try {
    // Fetch the existing book details from the database
    const existingBook = await db.query("SELECT * FROM books WHERE id = $1", [bookIdToUpdate]);

    if (existingBook.rows.length > 0) {
      // Book exists, update the fields that the user modified
      const updatedBook = {
        ...existingBook.rows[0],
        title: req.body.title || existingBook.rows[0].title,
        key_principles: req.body.key_principles || existingBook.rows[0].key_principles,
        quotes: req.body.quotes || existingBook.rows[0].quotes,
        actions_to_take: req.body.actions_to_take || existingBook.rows[0].actions_to_take,
        personal_reflections: req.body.personal_reflections || existingBook.rows[0].personal_reflections,
        rating: req.body.rating || existingBook.rows[0].rating,
        submit_date: req.body.submit_date || existingBook.rows[0].submit_date,
      };

      // Update the book details in the database based on the modified fields
      const updateQuery = `
        UPDATE books
        SET title = $1, key_principles = $2, quotes = $3, actions_to_take = $4, personal_reflections = $5, rating = $6, submit_date = $7
        WHERE id = $8;
      `;

      await db.query(updateQuery, [
        updatedBook.title,
        updatedBook.key_principles,
        updatedBook.quotes,
        updatedBook.actions_to_take,
        updatedBook.personal_reflections,
        updatedBook.rating,
        updatedBook.submit_date,
        bookIdToUpdate,
      ]);

      res.redirect("/book/" + bookIdToUpdate);
    } else {
      // Book not found
      res.status(404).send("Book not found");
    }
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Search
app.get("/search", async (req, res) => {
  try {
    const query = req.query.query;

    // Perform a search in your database based on the query
    const searchResults = await db.query("SELECT * FROM books WHERE title ILIKE $1 OR author ILIKE $1", [`%${query}%`]);

    res.render("search-results", { results: searchResults.rows });
  } catch (error) {
    console.error('Error performing search:', error.message);
    res.status(500).send('Internal Server Error');
  }
});
// Run server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
