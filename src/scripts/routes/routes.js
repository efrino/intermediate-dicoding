import HomePage from '../pages/home/home-page';
import LoginPage from '../pages/login/login-page';
import RegisterPage from '../pages/register/register-page';
import DetailPage from '../pages/detail-story/detail-page';
import StoriesPage from '../pages/stories/stories-page';
import AddStoryPage from '../pages/add-story/add-page';
import NotFoundPage from '../pages/not-found/not-found-page'; // import halaman 404

const routes = {
  '/': new LoginPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/home': new HomePage(),
  '/stories': new StoriesPage(),
  '/add-story': new AddStoryPage(),
  '/stories/:id': new DetailPage(),
  '*': new NotFoundPage(),  // Tambahkan ini sebagai fallback 404
};

export default routes;
