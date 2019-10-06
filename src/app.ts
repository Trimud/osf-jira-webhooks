import express, { Request, Response } from "express";

const app = express();

app.get('/', (req: Request, res: Response) => res.send('App is listening for Webhook events...'));

export default app;
