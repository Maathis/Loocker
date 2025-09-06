import './index.css';
import './theme.css';

import { createRoot } from 'react-dom/client';
import {
    createHashRouter,
    RouterProvider,
  } from "react-router";
import { Dashboard } from './pages/Dashboard';
import { ModalProvider } from './components/notification/NotificationModalContext';

const router = createHashRouter([
    {
      path: "/",
      element: <ModalProvider>
        <Dashboard/>
      </ModalProvider>
    },
]);

window.electron.getVersion().then(version => {
    window.appVersion = version;
});


const root = createRoot(document.getElementById("root"));
root.render(<RouterProvider router={router} />);