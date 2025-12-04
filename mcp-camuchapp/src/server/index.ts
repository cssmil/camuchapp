import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { MCPRouter } from '../mcp/router';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Inicializar Router del MCP
const mcpRouter = new MCPRouter();

// HTTP Endpoint
app.post('/mcp/query', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'El campo "message" es requerido.' });
    }

    const result = await mcpRouter.route(message);
    return res.json(result);
  } catch (error) {
    console.error('Error en /mcp/query:', error);
    return res.status(500).json({ error: 'Error interno del servidor MCP.' });
  }
});

// Crear servidor HTTP para soportar Express + WebSockets
const server = http.createServer(app);

// Configurar WebSocket Server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Cliente WebSocket conectado');

  ws.on('message', async (data) => {
    try {
      const message = data.toString();
      // Procesar mensaje como query
      const result = await mcpRouter.route(message);
      // Enviar respuesta
      ws.send(JSON.stringify(result));
    } catch (error) {
      ws.send(JSON.stringify({ error: 'Error procesando solicitud via WS' }));
    }
  });
});

// Iniciar servidor
server.listen(port, () => {
  console.log(`MCP Server corriendo en http://localhost:${port}`);
  console.log(`WebSocket Server listo en ws://localhost:${port}`);
});
