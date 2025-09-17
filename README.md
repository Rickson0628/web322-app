# web322-app

**Web Programming Tools and Frameworks 322**

---

## 🖥️ Languages
- **JavaScript (Node.js runtime)** → Backend logic and server routes  
- **HTML5** → Structure of views  
- **CSS3** → Styling (with `main.css`)  
- **SQL (PostgreSQL)** → Storing categories and items data  
- **NoSQL (MongoDB Atlas)** → Managing user authentication and login history  

---

## 📦 Frameworks & Libraries
- **Express.js** → Web framework to build server routes  
- **Express-Handlebars (hbs)** → Template engine for dynamic HTML rendering with helpers  
- **Bootstrap 5** → Responsive UI design and styling  
- **Multer** → Middleware for handling file uploads  
- **Cloudinary + Streamifier** → Cloud storage service for uploading and serving images  
- **Sequelize ORM** → Object-relational mapping for PostgreSQL database  
- **Mongoose** → ODM (Object Data Modeling) for MongoDB user authentication  
- **Bcrypt.js** → Password hashing and encryption for secure login  
- **Client-sessions** → User session and cookie management  
- **Strip-js** → Sanitize HTML and prevent XSS  
- **Path (Node.js core)** → Handling file paths  
- **dotenv** (optional but recommended) → Manage environment variables securely  

---

## 🗄️ Databases

### PostgreSQL (Relational Database)
- Stores **Items** and **Categories**  
- Relation: Each **Item** belongs to a **Category**  

### MongoDB Atlas (NoSQL Database)
- Stores **User authentication data**:  
  - Username  
  - Password  
  - Email  
  - Login history  

---

## 📌 Features You Learned & Implemented

### 🔧 Backend Development (Express.js)
- Built routes (`/about`, `/shop`, `/items`, `/categories`, `/register`, `/login`, etc.)  
- Middleware for request parsing and session management  

### 🔑 Authentication System
- User registration with password hashing (**bcrypt**)  
- User login with validation and login history tracking (**MongoDB**)  
- Session handling with **client-sessions**  
- Protecting routes with middleware (`ensureLogin`)  

### 🗂️ Database Operations
- **PostgreSQL + Sequelize** → Add, delete, and query items/categories  
- **MongoDB + Mongoose** → Manage users and authentication  
- Implemented **CRUD operations** across both databases  

### 🖼️ File Upload & Image Management
- Upload images via **Multer**  
- Store and serve images from **Cloudinary**  

### 🎨 Dynamic Templates with Handlebars
- Custom helpers (`navLink`, `equal`, `safeHTML`, `formatDate`)  
- Conditional rendering (`if session.user → show login/register or user dropdown`)  
- Shared layout (`main.hbs`)  

### 💻 Frontend with Bootstrap
- Responsive navigation bar with login/register or user dropdown  
- Tables and forms for managing categories, items, and user data  

### 🔒 Security Best Practices
- Sanitizing input with **strip-js**  
- Password hashing with **bcrypt**  
- Sessions managed securely with **client-sessions**  

---

## 🚀 Hosting / Deployment
- **Vercel** → Deployed frontend + backend app  
- **GitHub** → Version control and project repository  

---

_All the files in this repository were programmed by me._
