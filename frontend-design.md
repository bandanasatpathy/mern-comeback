# Frontend Design and Architecture — MERN Comeback

## 1. Project overview

The frontend is the React application for the MERN Comeback Task Management project. It provides administrator and employee experiences, authentication and password recovery, project and task workflows, task details, employee management, and profile-related functionality.

The implementation uses React, React Router, Axios service modules, React Context for authentication and theme state, Bootstrap/Bootstrap Icons, and page-specific CSS.

This document follows the frontend folder structure shown in the supplied VS Code screenshots. It documents the visible files and their apparent organization; it does not assume the contents of files that were not supplied.

## 2. Actual frontend structure

frontend/
├── components/
│   ├── AppLayout.css
│   ├── AppLayout.jsx
│   ├── Loading.css
│   ├── Loading.jsx
│   ├── Navbar.css
│   ├── Navbar.jsx
│   ├── Pagination.jsx
│   ├── ProtectedRoute.jsx
│   ├── PublicNavbar.css
│   ├── PublicNavbar.jsx
│   ├── Sidebar.css
│   ├── Sidebar.jsx
│   └── TaskCard.jsx
├── context/
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── pages/
│   ├── admin/
│   │   ├── AdminDashboard.css
│   │   ├── AdminDashboard.jsx
│   │   ├── CreateEmployee.css
│   │   ├── CreateEmployee.jsx
│   │   ├── CreateProject.css
│   │   ├── CreateProject.jsx
│   │   ├── CreateTask.css
│   │   ├── CreateTask.jsx
│   │   ├── EditEmployee.css
│   │   ├── EditEmployee.jsx
│   │   ├── Employees.css
│   │   ├── Employees.jsx
│   │   ├── EmployeeTasks.jsx
│   │   ├── ProfileRequests.css
│   │   ├── ProfileRequests.jsx
│   │   ├── ProjectDetails.css
│   │   ├── ProjectDetails.jsx
│   │   ├── Projects.css
│   │   ├── Projects.jsx
│   │   ├── Tasks.css
│   │   └── Tasks.jsx
│   ├── employee/
│   │   ├── EmployeeDashboard.css
│   │   ├── EmployeeDashboard.jsx
│   │   ├── MyProjects.css
│   │   ├── MyProjects.jsx
│   │   ├── MyTasks.css
│   │   ├── MyTasks.jsx
│   │   ├── Profile.css
│   │   ├── Profile.jsx
│   │   └── TaskDetails.jsx
│   ├── Login.css
│   ├── Login.jsx
│   ├── ResetPassword.css
│   └── ResetPassword.jsx
├── services/
│   ├── authService.js
│   ├── projectService.js
│   ├── taskService.js
│   └── userService.js
├── styles/
│   └── theme.css
├── utils/
│   └── (folder exists; files not visible in supplied screenshots)
├── App.css
├── App.js
├── index.js
├── .env                 # local environment configuration; do not commit
└── .gitignore

### Notes on the structure

- The screenshots show `components`, `context`, `pages`, `services`, `styles`, and `utils` at the frontend source root, alongside `App.js`, `App.css`, and `index.js`.
- `pages/admin` contains administrator pages, including employee, project, and task management.
- `pages/employee` contains employee dashboard, projects, tasks, and profile pages.
- `TaskDetails.jsx` is directly under `pages`, not inside `admin` or `employee`.
- Login and reset-password files are also directly under `pages`.
- The screenshots show `TaskCard.jsx` and `Pagination.jsx` under `components`.
- `Loading`, navbar, sidebar, and layout styles live with their components.
- The screenshots do not show `taskCommentService.js`, a separate `PublicNavbar` CSS import beyond the visible file, or a separate employee/admin layout. Do not add these to the structure unless they are actually present in the repository.

## 3. Application entry and shared layout

### `index.js`

Application entry point. The project context indicates that the app is wrapped with `AuthContext` and uses a `ThemeProvider`; verify the current `index.js` to confirm the exact provider nesting.

### `App.js` and `App.css`

`App.js` is the main route configuration file. `App.css` contains application-level styling. The exact route declarations are not visible in the screenshots, so use `App.js` as the source of truth when documenting URL paths or route nesting.

### `components/AppLayout.jsx` and `AppLayout.css`

The shared authenticated layout provides the common application shell:
- `Navbar` across the top.
- `Sidebar` for navigation.
- Page content rendered through React Router's `Outlet`.

The same shared layout is intended to serve both admin and employee pages, with navigation varying according to the signed-in user's role. Keep using the shared layout rather than introducing duplicate admin/employee navbar or layout components.

### Navigation components

- `Navbar.jsx` / `Navbar.css`: authenticated application navigation, user information, logout, and theme control as implemented.
- `Sidebar.jsx` / `Sidebar.css`: role-aware navigation links.
- `PublicNavbar.jsx` / `PublicNavbar.css`: public-page navigation, including the product identity, About link, and theme toggle.

The precise buttons and links should be checked against the current component code if the UI changes.

## 4. Context and protected navigation

### `context/AuthContext.jsx`

The established auth-context design provides the current token and user information, authentication state, and login/logout actions. Current behavior discussed for the project:
- Admin login redirects to `/admin`.
- Employee login redirects to `/employee`.
- Protected API calls pass the token in the `Authorization: Bearer <token>` header.

Verify the implementation in the current file before relying on any storage or session-persistence details.

### `context/ThemeContext.jsx` and `styles/theme.css`

The theme context controls the selected light/dark theme and sets the document's `data-theme` attribute. `theme.css` contains shared CSS variables for page surfaces, text, borders, accent colors, alert states, overlays, and shadows.

Page CSS should use those shared variables for dark-theme styling where appropriate.

### `components/ProtectedRoute.jsx`

Responsible for guarding routes based on authentication and, where configured, user role. Frontend route guards improve navigation behavior but do not replace backend authorization.

## 5. Page inventory

### Administrator pages — `pages/admin/`

| File | Purpose suggested by its name |
|---|---|
| `AdminDashboard.jsx` | Administrator overview |
| `CreateEmployee.jsx` | Create an employee |
| `EditEmployee.jsx` | Edit employee details |
| `Employees.jsx` | List/manage employees |
| `EmployeeTasks.jsx` | View tasks for a selected employee |
| `ProfileRequests.jsx` | Review employee profile-update requests |
| `CreateProject.jsx` | Create a project |
| `Projects.jsx` | List projects |
| `ProjectDetails.jsx` | View/manage a project's details and members |
| `CreateTask.jsx` | Create and assign a task |
| `Tasks.jsx` | Administrator task list and management |

These descriptions are based on filenames and the previously established project workflow; inspect the components for exact behavior.

### Employee pages — `pages/employee/`

| File | Purpose suggested by its name |
|---|---|
| `EmployeeDashboard.jsx` | Employee overview |
| `MyProjects.jsx` | Projects visible to the signed-in employee |
| `MyTasks.jsx` | Tasks assigned to the signed-in employee |
| `Profile.jsx` | Employee profile and related profile workflow |

### Shared/public pages — `pages/`

- `Login.jsx` / `Login.css`: login page.
- `ResetPassword.jsx` / `ResetPassword.css`: reset password from a reset link.
- `TaskDetails.jsx`: shared task details page/component according to its placement; confirm how it is routed or imported in `App.js`.

## 6. Service modules and API integration

The service folder contains:

- `authService.js` — authentication-related requests.
- `projectService.js` — project list/details/create/update/member/archive requests.
- `taskService.js` — task creation, listing, status and task detail operations.
- `userService.js` — employee/user/profile-related requests.

Keep HTTP calls in these service modules rather than repeating Axios endpoint logic across page components. The frontend currently uses manual Bearer token headers as the established implementation.

```js
const API_URL = process.env.REACT_APP_API_URL;

// Example for a protected Axios request:
const response = await axios.get(`${API_URL}/some-endpoint`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

This is a pattern example, not an additional file to create.

### Route prefixes

The backend route files supplied separately define route suffixes, but the final API URL also depends on the `app.use(...)` prefixes in `backend/server.js`. Ensure the service modules use the same prefixes as `server.js`; do not infer a mount prefix from a route filename.

## 7. Main workflows represented by the frontend

### Authentication and password recovery

- Login via `authService.js`.
- Forgot-password request and reset-password form.
- Public pages use `PublicNavbar`.
- Display loading, success, and error states.

### Projects

- Admin project list, creation, details, member management, and archive flow.
- Employee project list through `MyProjects.jsx`.
- Employee visibility should align with backend project membership rules.

### Tasks

- Admin creates tasks with project, assignee, title, description, priority, and due date as required by the current backend model/validation.
- Admin task list can show task and project information.
- Employee sees their own tasks through `MyTasks.jsx`.
- Task details and comments are surfaced through the task detail UI; verify the actual import/flow between `TaskDetails.jsx` and the modal implementation.
- Status changes must follow the backend's allowed workflow.
- Search, pagination, loading, empty, success, and error states should be consistent with the existing components.

### Employees and profile workflow

- Admin employee list/create/edit/activate/deactivate flows.
- Admin view of employee tasks.
- Employee profile-update request flow and admin review through `ProfileRequests.jsx`.
- Password change and profile behavior should match the routes mounted by the backend.

## 8. Styling conventions

- Keep each page's CSS beside the page when that is the current convention.
- Keep shared component CSS in `components/`.
- Keep global theme variables in `styles/theme.css`.
- Keep `App.css` for application-wide styling rather than page-specific rules.
- Avoid copying entire light and dark stylesheets. Use a base style and small `[data-theme="dark"]` overrides.
- When removing repeated CSS, preserve the existing light-mode appearance, spacing, component sizing, and responsive layout unless a redesign is requested.
- Some later CSS rules intentionally override earlier values. Consolidate only after checking the final effective styling.
- Tables should remain readable at smaller widths; use horizontal scrolling where needed.
- Forms and modals should include visible focus states, disabled states, and submission feedback.

## 9. Loading and feedback

- Use `components/Loading.jsx` / `Loading.css` for page-level or data-fetch loading.
- For form submissions, use inline progress labels such as “Creating…” or “Updating…” and disable duplicate submissions while a request is in progress.
- Display useful backend response messages for errors and successful operations where appropriate.
- Provide empty states when there are no tasks, projects, employees, or comments.
- Handle invalid/expired tokens consistently.

## 10. Environment configuration

The frontend `.env` uses the React API URL variable:

```env
REACT_APP_API_URL=http://localhost:4000
```

For deployment, set it to the deployed backend origin and rebuild the frontend. Do not place backend-only secrets such as `JWT_SECRET`, SMTP passwords, or MongoDB credentials in React environment variables.

## 11. Deployment checklist

- [ ] `App.js` routes are tested for public, admin, and employee pages.
- [ ] `ProtectedRoute` enforces the intended role checks.
- [ ] Admin and employee login redirects work.
- [ ] Project creation, membership, details, and archive flows work.
- [ ] Task creation includes the required project ID.
- [ ] Task lists show the project name where intended.
- [ ] Employee pages show only authorized projects/tasks.
- [ ] Task details and comment operations work for authorized users.
- [ ] Employee management and profile-update request workflows work.
- [ ] Loading, empty, error, and success states are checked.
- [ ] Light/dark themes are tested across the main pages.
- [ ] Responsive layouts are checked.
- [ ] The production frontend uses the deployed API URL.
- [ ] No credentials, active tokens, or private secrets are committed.

## 12. Scope and accuracy

This document's file tree is based on the supplied screenshots. The screenshots do not expose file contents, exact React route paths, every utility file, or the contents of `App.js`; those details should be confirmed from the source before adding them to formal documentation.
