import express from 'express';
import React from "react";
import axios from 'axios';
import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import path from 'path';
import fs from 'fs';
import App from "../src/App";

const app = express();
app.use(express.json());

// Serve static files from the "build" directory
const buildPath = path.join(__dirname, '..', 'build');
app.use(express.static(buildPath));

const todo_ip = process.env.TODO_API_IP;

app.post("/add", async (req, res) => {
    try {
      const response = await axios.post(`http://${todo_ip}:5001/api/add`, {
        what_to_do: req.body.what_to_do,
        due_date: req.body.due_date,
      });
      res.redirect('/');
    } catch (error) {
      console.error("error when adding ", error);
      res.sendStatus(500);
    }
});

app.put("/mark/:task", async (req, res) => {
    const { task } = req.params;
    const decodedTask = decodeURIComponent(task);

    try {
      const response = await axios.put(`http://${todo_ip}:5001/api/mark`, {
        item: decodedTask,
      });
      res.sendStatus(204);
    } catch (error) {
      console.error("Error when marking: ", error);
      res.sendStatus(500);
    }
});

app.put("/delete/:task", async (req, res) => {
    const { task } = req.params;
    const decodedTask = decodeURIComponent(task);
    try {
      const response = await axios.delete(`http://${todo_ip}:5001/api/delete`, {
        data: {
          item: decodedTask,
        }
      });
      res.sendStatus(204);
    } catch (error) {
      console.error('Error deleting resource: ', decodedTask);
      res.status(500).send('Error deleting task');
    }
});

app.get("/items", async (req, res) => {
  try {
    const response = await axios.get(`http://${todo_ip}:5001/api/items`);
    res.status(200).json({
      items: response.data,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

// Note: I got some help from this Medium article to understand
// server-side rendering with React
// https://medium.com/simform-engineering/how-to-implement-ssr-server-side-rendering-in-react-18-e49bc43e9531
app.get('*', (req, res) => {
    const indexHtmlPath = path.join(buildPath, 'index.html');
    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  
    const { pipe, abort: _abort } = ReactDOMServer.renderToPipeableStream(
      <>
          <StaticRouter location={req.url}>
              <App />
          </StaticRouter>
      </>,
      {
        onShellReady() {
          res.statusCode = 200;
          res.setHeader("Content-type", "text/html");
          res.send(indexHtml);
        },
        onShellError() {
          res.statusCode = 500;
          res.send("<!doctype html><p>Loading...</p>");
        },
      }
    );
    pipe(res);
  });

app.listen(5000, () => {
  console.log("App is running on http://localhost:5000");
});
