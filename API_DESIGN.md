# MERN Comeback — API Design

## 1. Overview

MERN Comeback is a MERN-stack task management application with administrator and employee roles. Its current feature set includes authentication, employee administration, projects and project membership, task assignment and status updates, task comments, password recovery, and profile-update requests.

This document is updated from the route files supplied for review. The HTTP paths below include the router prefix where it is confirmed. For task, task-comment, and user routes, check the corresponding `app.use(...)` statements in `server.js` before treating the displayed full paths as final; the uploaded router files define the route suffixes, not their mount prefixes.

## 2. Backend structure

```text
backend/
├── config/
│   └── db.js
├── src/
│   ├── controller/
│   ├── middlewear/
│   ├── models/
│   └── routes/
├── server.js
├── package.json
└── .env                 # local only; do not commit
```

The existing middleware folder is spelled `middlewear`. Keep that spelling in `require(...)` paths unless you intentionally rename the folder and update every import.

## 3. Request conventions

- Local API origin: `http://localhost:4000`
- Frontend API setting: `REACT_APP_API_URL=http://localhost:4000`
- Protected endpoints expect a Bearer token:

```http
Authorization: Bearer <JWT>
Content-Type: application/json
```

- JSON is used for the request and response bodies unless an endpoint specifies otherwise.
- In production, the frontend must use the deployed backend origin rather than `localhost`.

## 4. Authentication routes

Router file: `auth.route.js`. The paths below assume it is mounted at `/auth`.

| Method | Path | Access | Purpose |
|---|---|---|---|
| `POST` | `/auth/bootstrapAdmin` | Public route; protect operationally as a one-time setup | Bootstrap the initial administrator |
| `POST` | `/auth/loginUser` | Public | Log in and receive authentication details |
| `POST` | `/auth/forgotPassword` | Public | Request a password-reset email |
| `POST` | `/auth/resetPassword` | Public | Reset a password using a valid reset token |
| `POST` | `/auth/createUserByAdmin` | Authenticated admin | Create an employee/user after `validateUser` |

### Password reset behavior

The implementation discussed for this project creates a random reset token, stores a hash of the token, gives the token a 15-minute expiry, and marks it used after a successful reset. Successful reset invalidates existing auth records for that user, requiring the user to sign in again. Verify this behavior against the current controller if it has changed since implementation.

**Deployment warning:** `bootstrapAdmin` is registered without authentication in the uploaded route file. Ensure the controller only permits a safe initial bootstrap (for example, only when no administrator exists), or disable/remove the endpoint after setup.

## 5. User and employee routes

Router file: `user.routes.js`. The paths below show the suffixes registered by the router; the full URL depends on its `app.use(...)` mount in `server.js`.

| Method | Route suffix | Middleware shown in the route file | Purpose |
|---|---|---|---|
| `PATCH` | `/changePassword` | `authMiddleware` | Change the signed-in user's password |
| `POST` | `/requestProfileUpdate` | `authMiddleware`, `employeeOnly` | Employee requests a profile change |
| `GET` | `/getAllEmployees` | `authMiddleware`, `adminOnly` | List employees/users |
| `GET` | `/getUserById/:id` | `authMiddleware`, `adminOnly` | Get one user |
| `PUT` | `/updateUser/:id` | `authMiddleware` only in the supplied route | Update a user |
| `PATCH` | `/deactivateUser/:id` | `authMiddleware`, `adminOnly` | Deactivate a user |
| `PATCH` | `/activateUser/:id` | `authMiddleware`, `adminOnly` | Activate a user |
| `GET` | `/profileUpdateRequests` | `authMiddleware`, `adminOnly` | List profile-update requests |
| `PATCH` | `/profileUpdateRequests/:userId/status` | `authMiddleware`, `adminOnly` | Approve/reject/update request status |

### Authorization item to fix or verify

The comment above `PUT /updateUser/:id` says “Update a user”, but this route has only `authMiddleware`, unlike the adjacent admin-only user-management routes. If only admins should update other users, add `adminOnly` to this route and ensure the controller does not permit privilege escalation. If employees can update only their own allowed fields, enforce that ownership and field allowlist in the controller.

## 6. Project routes

Confirmed mount from the current project setup: `/auth/projects`. Router file: `project.route.js`.

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/auth/projects/getAllProjects` | Authenticated; visibility filtered by role/membership | List visible projects |
| `GET` | `/auth/projects/:id` | Authenticated; employee membership is checked by controller | Get project details |
| `POST` | `/auth/projects/createProject` | Admin | Create a project |
| `PUT` | `/auth/projects/updateProject/:id` | Admin | Update project details/status |
| `POST` | `/auth/projects/addProjectMember/:id` | Admin | Add a project member |
| `DELETE` | `/auth/projects/removeProjectMember/:id` | Admin | Remove a project member |
| `PATCH` | `/auth/projects/archiveProject/:id/archive` | Admin | Archive a project |

### Project model and rules

The project model includes `name`, `description`, `members`, `createdBy`, and `status` (`active`, `completed`, or `archived`), with timestamps.

Expected business rules from the project implementation:
- Only active employees can be added as project members.
- Employees should see only projects they belong to.
- Archived projects are excluded from the normal project list.
- Removing a member is blocked when that member still has a non-deleted task assigned within that project.
- Task creation must associate the task with a valid, non-archived project and an employee who is a member of that project.

Example create request:

```json
{
  "name": "Website Revamp",
  "description": "Improve the company website",
  "members": ["<employeeObjectId>"]
}
```

## 7. Task routes

Router file: `task.route.js`. The route suffixes are confirmed below. The supplied files do not include `server.js`, so verify the router mount prefix there. In the table, `<TASK_BASE>` means the mount prefix configured for `taskRoutes`.

| Method | Route suffix | Access/middleware | Purpose |
|---|---|---|---|
| `POST` | `/createTaskByAdmin` | `authMiddleware`, `adminOnly`, `validateTask` | Create a task as admin |
| `GET` | `/getAllTasksByAdmin` | `authMiddleware`, `adminOnly` | List all tasks for admin |
| `GET` | `/getAnEmployeeTasks/:id` | `authMiddleware`, `adminOnly` | List tasks for one employee |
| `GET` | `/getAllTasksByStatus/:status` | `authMiddleware`, `adminOnly` | Filter tasks by status |
| `PUT` | `/updateTask/:id` | `authMiddleware`, `adminOnly` | Update task details |
| `DELETE` | `/deleteTask/:id` | `authMiddleware`, `adminOnly` | Delete a task |
| `GET` | `/getTaskById/:id` | `authMiddleware`; controller checks access | Get one task |
| `GET` | `/myTasks` | `authMiddleware`, `employeeOnly` | Get current employee's tasks |
| `PATCH` | `/completeTask/:id` | `authMiddleware`, `employeeOnly` | Advance own task status |

Full URL format: `<TASK_BASE>/route-suffix`. For example, if `server.js` mounts the router at `/auth/tasks`, the create endpoint is `/auth/tasks/createTaskByAdmin`. Confirm the actual mount before updating frontend services or deployment documentation.

### Task workflow

- Admin creates tasks and can view/manage all tasks.
- An employee fetches their own tasks through `/myTasks`.
- The route comment documents employee status progression as `pending → in-progress → completed`; confirm controller behavior for the precise transitions.
- The controller is responsible for checking task ownership on employee actions and access to individual task details.
- The task has a required project reference in the current project design. The selected employee should be a member of the selected project.
- Task list responses should populate project information if the UI needs to show the project name.

Expected UI values:
- Status: `pending`, `in-progress`, `completed`
- Priority: `low`, `medium`, `high`

## 8. Task-comment routes

Router file: `taskComment.route.js`. The mount prefix is not provided in the uploaded files; use `<COMMENT_BASE>` until verified in `server.js`.

| Method | Route suffix | Middleware shown | Purpose |
|---|---|---|---|
| `GET` | `/getTaskComments/:taskId` | `authMiddleware` | Get comments for a task |
| `POST` | `/addTask/:taskId` | `authMiddleware` | Add a comment to a task |

Authentication is applied at the route level, but the uploaded route file does not show role/ownership middleware. The controllers should verify that the current user is allowed to view/comment on the task before returning or creating comments.

## 9. Middleware responsibilities

- `authMiddleware`: validates the Bearer token/session and sets the authenticated user context.
- `adminOnly`: restricts the route to administrators.
- `employeeOnly`: restricts the route to employees.
- `validateUser`: validates user input where applied.
- `validateTask`: validates task input before task creation.

Frontend route guards are not a substitute for server-side authorization.

## 10. Environment variables

Names used or discussed in this project include:

```env
PORT=4000
MONGO_URI=<MongoDB connection string>
JWT_SECRET=<long random secret>
FRONTEND_URL=<deployed frontend origin>
SMTP_FROM=<configured sender address>
```

The frontend uses:

```env
REACT_APP_API_URL=http://localhost:4000
```

Use the actual variable names expected by `server.js`, the database config, and the mail transporter. Do not commit `.env` files or expose backend secrets in React `REACT_APP_*` variables.

## 11. Deployment checklist

- [ ] `.env` and `node_modules` are excluded from Git.
- [ ] MongoDB production access and credentials are configured.
- [ ] Production CORS allows the intended frontend origin.
- [ ] Password-reset links use the deployed frontend URL.
- [ ] React is built with the deployed backend URL.
- [ ] Bootstrap admin is protected as a one-time setup.
- [ ] `PUT /updateUser/:id` authorization is reviewed and corrected if necessary.
- [ ] Admin APIs reject employee tokens.
- [ ] Employees cannot read another employee's tasks or projects.
- [ ] Project membership restrictions are tested.
- [ ] Task comments verify access to the associated task.
- [ ] Login, logout, password reset, and token invalidation are tested.
- [ ] The deployed app is tested end to end.

## 12. Postman collection

The project notes contain this collection link:

[Open the Task Management API collection](https://winter-flare-177957.postman.co/workspace/My-Workspace~eb81a912-e8e9-4eaf-87f2-2b59b3c9f26f/collection/16972029-d5d54be2-143c-4959-b075-97b3b38c05ac?action=share&source=copy-link&creator=16972029)

Before sharing it, remove real credentials, active JWTs, reset tokens, and production secrets.
