import config from '../configs';
import Home from '../page/Home/index.jsx';
import Discover from '../page/Discover/index.jsx';
import NotFound from '../page/NotFound/index.jsx';
import Login from '../page/Login';
import Register from '../page/Register';
import Upload from '../page/Upload';
import UserRouter from '../components/UserRouter';
import Following from '../page/Following';
import Friends from '../page/Friends';
import Search from '../page/Search';
import Tag from '../page/Tag';
import Music from '../page/Music';
import DirectMessages from '../page/DirectMessages';
import LogoutConfirm from '../components/LogoutConfirm';

const routes = [
  {
    path: config.routes.home,
    component: Home,
    props: { value: 'default' },
  },
  {
    path: config.routes.explore,
    component: Discover,
  },
  {
    path: config.routes.following,
    component: Following,
  },
  {
    path: config.routes.friends,
    component: Friends,
    protected: true,
    requireAuth: true,
  },
  {
    path: config.routes.upload,
    component: Upload,
    protected: true,
  },
  {
    path: config.routes.active,
    component: Home,
    protected: true,
  },
  {
    path: config.routes.live,
    component: Discover,
  },
  {
    path: config.routes.login,
    component: Login,
  },
  {
    path: config.routes.register,
    component: Register,
  },
  {
    path: config.routes.search,
    component: Search,
  },
  {
    path: config.routes.tag,
    component: Tag,
  },
  {
    path: config.routes.message,
    component: DirectMessages,
    protected: true,
  },
  {
    path: config.routes.music,
    component: Music,
  },
  { path: 'logout', component: LogoutConfirm },
  {
    path: '*',
    component: UserRouter,
  },
  {
    path: config.routes.notFound,
    component: NotFound,
  },
];

export default routes;
