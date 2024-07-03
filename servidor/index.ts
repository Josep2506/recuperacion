import express from 'express';
import { Request, Response } from 'express';
import { createServer } from 'http';
import { AddressInfo } from 'net';

const app = express();
const PORT = 3000;  

const clients: Response[] = [];

app.use(express.json());
app.use(express.static(__dirname));


app.get('/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    clients.push(res);

    req.on('close', () => {
        clients.splice(clients.indexOf(res), 1);
    });
});

app.post('/send', (req: Request, res: Response) => {
    const { message, recipient } = req.body;
    const data = `data: ${JSON.stringify({ message, recipient })}\n\n`;
    clients.forEach(client => client.write(data));
    res.status(200).send('Mensaje enviado');
});

const server = createServer(app);
server.listen(PORT, () => {
    const address = server.address() as AddressInfo;
    console.log(`Servidor corriendo en el puerto ${address.port}`);
});
