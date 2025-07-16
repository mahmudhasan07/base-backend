# Boffo Global Server

## Overview
SDGConsult Server is a Node.js and TypeScript-based backend application designed to handle API requests efficiently. This project follows best practices in backend development, ensuring scalability, security, and maintainability.

## Features
- Built with **Node.js** and **TypeScript**
- Uses **Express.js** for handling API requests
- **MongoDB** database integration
- **JWT authentication** for secure access
- **RESTful API** structure
- **ESLint & Prettier** for code quality and formatting
- **Swagger documentation** (Planned)

## Installation
### Prerequisites
Ensure you have the following installed:
- Node.js (>= 16.x)
- npm or yarn
- **npx prisma generate** for optimize prisma models 

### Setup & Run
1. Clone the repository:
   ```sh
   git clone https://github.com/mahmudhasan07/boffo-backend
   cd boffo-backend
   ```

2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and configure the necessary variables:
   ```env
   PORT=5000
   DB_URI=your_DB
   JWT_SECRET=your_secret_key
   ```

4. Run the development server:
   ```sh
   npm run dev
   # or
   yarn dev
   ```

## Scripts
| Command          | Description                          |
|-----------------|----------------------------------|
| `npm prisma generate`   | Start development server         |
| `npm run dev`           | Start development server         |
| `npm run build`         | Build the project for production |
| `npm start`             | Run the built application        |
| `npm run lint`          | Check code formatting            |
| `npm test`              | Run tests                        |

## Folder Structure
```
📂 sdgconsult-server
├── 📂 src
│   ├── 📂 app
│   |    |── 📂 error
│   |    |── 📂 helper
│   |    |── 📂 middleware
│   |    |── 📂 route
│   ├── 📂 config
│   ├── 📂 shared
│   ├── 📂 utils
│   ├── app.ts
│   ├── server.ts
├── 📂 tests
├── .env
├── package.json
├── tsconfig.json
├── README.md
```

## API Documentation
🚧 **Coming Soon**

## Contributing
1. Fork the repository
2. Create a new branch: `git checkout -b feature-branch`
3. Make your changes and commit: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature-branch`
5. Submit a pull request

## License
This project is licensed under the **MIT License**.

