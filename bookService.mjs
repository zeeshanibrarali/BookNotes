import axios from "axios";

const getBookDetails = async (title) => {
  try {
    const searchUrl = `http://openlibrary.org/search.json?title=${encodeURIComponent(title)}`;
    const searchResponse = await axios.get(searchUrl);
    const bookData = searchResponse.data.docs[0];

    if (!bookData) {
      return {
        coverUrl: null,
        author: 'Unknown Author',
        isbn: null,
      };
    }

    const isbnList = bookData.isbn ? bookData.isbn : [];
    const coverUrl = isbnList.length > 0 ? `https://covers.openlibrary.org/b/isbn/${isbnList[0]}-M.jpg` : null;
    const author = bookData.author_name ? bookData.author_name[0] : 'Unknown Author';

    return {
      coverUrl,
      author,
      isbn: isbnList.length > 0 ? isbnList[0] : null,
    };

  } catch (error) {
    console.error('Error searching for book:', error.message);
    return {
      coverUrl: null,
      author: 'Unknown Author',
      isbn: null,
    };
  }
};

export { getBookDetails };
