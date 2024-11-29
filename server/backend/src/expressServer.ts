import express, { Express, Request, Response, NextFunction } from "express";

import { getAllTcpClients } from "./tcpSocketServer";
import { getTime } from "../utils/timer";


export default function expressServer(exPort: number){
	const server: Express = express();

	server.get("/tcpClients", (req: Request, res: Response) => {
		res.send(getAllTcpClients());
	});

	server.get("/timer", (req: Request, res: Response) => {
		res.send(getTime());
	});

	server.listen(exPort, () => {
		console.log(`[backend server]: Server is running at http://localhost:${exPort}`);
	});
}