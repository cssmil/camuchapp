"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const dotenv_1 = __importDefault(require("dotenv"));
const router_1 = require("../mcp/router");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3002;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Inicializar Router del MCP
const mcpRouter = new router_1.MCPRouter();
// HTTP Endpoint
app.post('/mcp/query', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'El campo "message" es requerido.' });
        }
        const result = yield mcpRouter.route(message);
        return res.json(result);
    }
    catch (error) {
        console.error('Error en /mcp/query:', error);
        return res.status(500).json({ error: 'Error interno del servidor MCP.' });
    }
}));
// Crear servidor HTTP para soportar Express + WebSockets
const server = http_1.default.createServer(app);
// Configurar WebSocket Server
const wss = new ws_1.WebSocketServer({ server });
wss.on('connection', (ws) => {
    console.log('Cliente WebSocket conectado');
    ws.on('message', (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const message = data.toString();
            // Procesar mensaje como query
            const result = yield mcpRouter.route(message);
            // Enviar respuesta
            ws.send(JSON.stringify(result));
        }
        catch (error) {
            ws.send(JSON.stringify({ error: 'Error procesando solicitud via WS' }));
        }
    }));
});
// Iniciar servidor
server.listen(port, () => {
    console.log(`MCP Server corriendo en http://localhost:${port}`);
    console.log(`WebSocket Server listo en ws://localhost:${port}`);
});
