import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router';
import App from './App.jsx'
import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';
import { UserProvider } from './context/UserContext.jsx'

createRoot(document.getElementById('root')).render(
  <UserProvider>
    <MantineProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    </MantineProvider>
  </UserProvider>
)
