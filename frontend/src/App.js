import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import { ThemeProvider } from "./context/ThemeContext";
import "./styles/theme.css";

import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Employees from "./pages/admin/Employees";
import CreateEmployee from "./pages/admin/CreateEmployee";
import EditEmployee from "./pages/admin/EditEmployee";
import Tasks from "./pages/admin/Tasks";
import CreateTask from "./pages/admin/CreateTask";
import EmployeeTasks from "./pages/admin/EmployeeTasks";
import ProfileRequests from "./pages/admin/ProfileRequests";
import Projects from "./pages/admin/Projects";
import CreateProject from "./pages/admin/CreateProject";
import ProjectDetails from "./pages/admin/ProjectDetails";

import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import MyTasks from "./pages/employee/MyTasks";
import MyProjects from "./pages/employee/MyProjects";
import TaskDetails from "./pages/employee/TaskDetails";
import Profile from "./pages/employee/Profile";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";


function App() {
    return (
        <ThemeProvider>

            <BrowserRouter>

                <Routes>

                    {/* =================================================
                        PUBLIC ROUTES
                    ================================================= */}

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/reset-password/:token"
                        element={<ResetPassword />}
                    />


                    {/* =================================================
                        ADMIN ROUTES
                    ================================================= */}

                    <Route
                        element={
                            <ProtectedRoute allowedRole="admin">
                                <AppLayout />
                            </ProtectedRoute>
                        }
                    >

                        <Route
                            path="/admin"
                            element={<AdminDashboard />}
                        />

                        <Route
                            path="/admin/employees"
                            element={<Employees />}
                        />

                        <Route
                            path="/admin/employees/create"
                            element={<CreateEmployee />}
                        />

                        <Route
                            path="/admin/employees/:id/edit"
                            element={<EditEmployee />}
                        />

                        <Route
                            path="/admin/tasks"
                            element={<Tasks />}
                        />

                        <Route
                            path="/admin/tasks/create"
                            element={<CreateTask />}
                        />

                        <Route
                            path="/admin/employees/:id/tasks"
                            element={<EmployeeTasks />}
                        />

                        <Route
                            path="/admin/projects"
                            element={<Projects />}
                        />

                        <Route
                            path="/admin/projects/create"
                            element={<CreateProject />}
                        />

                        <Route
                            path="/admin/projects/:id"
                            element={<ProjectDetails />}
                        />

                        <Route
                            path="/admin/profile-requests"
                            element={<ProfileRequests />}
                        />

                    </Route>


                    {/* =================================================
                        EMPLOYEE ROUTES
                    ================================================= */}

                    <Route
                        element={
                            <ProtectedRoute allowedRole="employee">
                                <AppLayout />
                            </ProtectedRoute>
                        }
                    >

                        <Route
                            path="/employee"
                            element={<EmployeeDashboard />}
                        />

                        <Route
                            path="/employee/tasks"
                            element={<MyTasks />}
                        />

                        <Route
                            path="/employee/tasks/:id"
                            element={<TaskDetails />}
                        />

                        <Route
                            path="/employee/projects"
                            element={<MyProjects />}
                        />

                        <Route
                            path="/employee/profile"
                            element={<Profile />}
                        />

                    </Route>


                    {/* =================================================
                        DEFAULT ROUTES
                    ================================================= */}

                    <Route
                        path="/"
                        element={<Navigate to="/login" replace />}
                    />

                    <Route
                        path="*"
                        element={<Navigate to="/login" replace />}
                    />

                </Routes>

            </BrowserRouter>

        </ThemeProvider>
    );
}

export default App;