import { createBrowserRouter } from "react-router-dom";

import APP from "../App"
import AUTHENtICATION from "../components/user/Authentication"
import ADMIN from "../components/admin/Admin";

const router = createBrowserRouter([
    {
        path: "/",
        element: <APP/>
    },
    {
        path: "/authentication",
        element: <AUTHENtICATION/>
    },
    {
        path: "/admin",
        element: <ADMIN/>
    }
])

export default router;