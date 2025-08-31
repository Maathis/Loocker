import './theme.css';
import './index.css';

import { createRoot } from 'react-dom/client';
import {
    createBrowserRouter,
    RouterProvider,
  } from "react-router";
import { Dashboard } from './pages/Dashboard';

const router = createBrowserRouter([
    {
      path: "/",
      element: <Dashboard></Dashboard>,
    },
]);

window.electron.getVersion().then(version => {
    window.appVersion = version;
});


const root = createRoot(document.getElementById("root"));
root.render(<RouterProvider router={router} />);