# Project Execution Instructions

> ⚠️ **Warnings:**
> - Before starting, ensure that port **3000** (for JSON server) is not being used by other processes. If it is, you can terminate the process using the following command:
>   ```bash
>   lsof -ti:3000 | xargs kill -9
>   ```
>   Alternatively, change the ports in the commands below.
>
> - You must install all project dependencies first. Run `npm install` in the project root directory. If you skip this step, the following instructions will not work.


Follow these steps to run the project correctly:

## 1. Install Dependencies

Open a terminal in the project root and run:

```bash
npm install
```

This command installs all required dependencies for the project.

## 2. Start the Simulated Server

Open a terminal and run:

```bash
npx json-server --watch src/db.json --port 3000
```

This command starts the JSON server using `src/db.json` as the database on port 3000.

## 3. Start the Vite Development Server

Open a **second terminal** and run:

```bash
npm run dev
```

This command starts the Vite development server for your project.

## 4. Access the Application

Once both servers are running, open your browser and go to the URL provided by Vite (usually [http://localhost:5173](http://localhost:5173)).

---

**Note:**  
Both services must be running simultaneously in separate terminals for the project to function properly.