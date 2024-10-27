import express, { Express, Request, Response } from "express";


export default function expressServer(exPort: number){
	const server: Express = express();
	
	server.get("/", (req: Request, res: Response) => {
		res.send("Express + TypeScript Server");
	});

	server.listen(exPort, () => {
		console.log(`[backend server]: Server is running at http://localhost:${exPort}`);
	});
}
