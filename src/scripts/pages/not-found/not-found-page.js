export default class NotFoundPage {
    render() {
        // Sisipkan CSS ke dalam <style> tag, lalu render markup HTML
        const style = `
      <style>
        .not-found {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 70vh;
          text-align: center;
          padding: 2rem;
          color: #333;
          font-family: 'Poppins', sans-serif;
        }
        .not-found h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: #e74c3c;
        }
        .not-found p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          color: #555;
          max-width: 400px;
        }
        .not-found img {
          max-width: 300px;
          width: 100%;
          margin-bottom: 2rem;
          user-select: none;
          pointer-events: none;
        }
        .not-found .btn {
          padding: 0.75rem 1.5rem;
          background-color: #4caf50;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 600;
          transition: background-color 0.3s ease;
        }
        .not-found .btn:hover {
          background-color: #45a049;
        }
      </style>
    `;

        return `
      ${style}
      <section class="not-found">
        <img src="/images/404.svg" alt="404 Not Found" />
        <h2>404 - Page Not Found</h2>
        <p>Maaf, halaman yang kamu cari tidak ditemukan.</p>
        <a href="#/home" class="btn btn--primary">Kembali ke Home</a>
      </section>
    `;
    }

    async afterRender() {
        // inisialisasi tambahan jika diperlukan
    }
}
