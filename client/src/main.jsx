import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { GoogleOAuthProvider } from "@react-oauth/google"

import './index.css'
import "./App.css"

import ROUTER from "./routers/Router"

const CLINET_ID = "965895084962-9h907c86kp8ee8c1o3aepathn7d88010.apps.googleusercontent.com"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={CLINET_ID}>
      <RouterProvider router={ROUTER} />
    </GoogleOAuthProvider>
  </StrictMode>
)
