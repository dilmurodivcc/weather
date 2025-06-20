import "./utils/i18n";
import { BrowserRouter } from 'react-router-dom';
import "./scss/main.scss";
import AppRoutes from './routes';

const App = () => {
  return (

      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
  );
};

export default App;
