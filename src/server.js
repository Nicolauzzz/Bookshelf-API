import Hapi from '@hapi/hapi';
import { nanoid } from 'nanoid';

const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: 'localhost',
  });

  let books = [];

  // Menambahkan buku (POST /books)
  server.route({
    method: 'POST',
    path: '/books',
    handler: (request, h) => {
      const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

      if (!name) {
        return h.response({
          status: 'fail',
          message: 'Gagal menambahkan buku. Mohon isi nama buku',
        }).code(400);
      }

      if (readPage > pageCount) {
        return h.response({
          status: 'fail',
          message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        }).code(400);
      }

      const id = nanoid();
      const finished = pageCount === readPage;
      const insertedAt = new Date().toISOString();
      const updatedAt = insertedAt;

      const newBook = {
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        insertedAt,
        updatedAt,
      };

      books.push(newBook);

      return h.response({
        status: 'success',
        message: 'Buku berhasil ditambahkan',
        data: {
          bookId: id,
        },
      }).code(201);
    }
  });

  // Mendapatkan seluruh buku (GET /books) dengan query parameter
  server.route({
    method: 'GET',
    path: '/books',
    handler: (request, h) => {
      let filteredBooks = books;

      // Filter berdasarkan query ?name
      if (request.query.name) {
        const nameQuery = request.query.name.toLowerCase();
        filteredBooks = filteredBooks.filter((book) =>
          book.name.toLowerCase().includes(nameQuery)
        );
      }

      // Filter berdasarkan query ?reading
      if (request.query.reading !== undefined) {
        const readingQuery = request.query.reading === '1';
        filteredBooks = filteredBooks.filter((book) => book.reading === readingQuery);
      }

      // Filter berdasarkan query ?finished
      if (request.query.finished !== undefined) {
        const finishedQuery = request.query.finished === '1';
        filteredBooks = filteredBooks.filter((book) => book.finished === finishedQuery);
      }

      return h.response({
        status: 'success',
        data: {
          books: filteredBooks.map(({ id, name, publisher }) => ({ id, name, publisher })),
        },
      }).code(200);
    }
  });

  // Mendapatkan detail buku berdasarkan ID (GET /books/:bookId)
  server.route({
    method: 'GET',
    path: '/books/{bookId}',
    handler: (request, h) => {
      const { bookId } = request.params;
      const book = books.find(b => b.id === bookId);

      if (!book) {
        return h.response({
          status: 'fail',
          message: 'Buku tidak ditemukan',
        }).code(404);
      }

      return h.response({
        status: 'success',
        data: {
          book,
        },
      }).code(200);
    }
  });

  // Mengubah data buku (PUT /books/:bookId)
  server.route({
    method: 'PUT',
    path: '/books/{bookId}',
    handler: (request, h) => {
      const { bookId } = request.params;
      const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

      if (!name) {
        return h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. Mohon isi nama buku',
        }).code(400);
      }

      if (readPage > pageCount) {
        return h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
        }).code(400);
      }

      const bookIndex = books.findIndex(b => b.id === bookId);
      if (bookIndex === -1) {
        return h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. Id tidak ditemukan',
        }).code(404);
      }

      const updatedBook = {
        ...books[bookIndex],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
        finished: pageCount === readPage,
        updatedAt: new Date().toISOString(),
      };

      books[bookIndex] = updatedBook;

      return h.response({
        status: 'success',
        message: 'Buku berhasil diperbarui',
      }).code(200);
    }
  });

  // Menghapus buku (DELETE /books/:bookId)
  server.route({
    method: 'DELETE',
    path: '/books/{bookId}',
    handler: (request, h) => {
      const { bookId } = request.params;
      const bookIndex = books.findIndex(b => b.id === bookId);

      if (bookIndex === -1) {
        return h.response({
          status: 'fail',
          message: 'Buku gagal dihapus. Id tidak ditemukan',
        }).code(404);
      }

      books.splice(bookIndex, 1);

      return h.response({
        status: 'success',
        message: 'Buku berhasil dihapus',
      }).code(200);
    }
  });

  await server.start();
  console.log(`Server is running on ${server.info.uri}`);
};

init();
