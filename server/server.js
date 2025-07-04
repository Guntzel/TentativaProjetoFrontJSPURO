import { WebSocketServer } from 'ws';
import { characters } from './repo.js';

const server = new WebSocketServer({
  port: 8080,
  host: '0.0.0.0'
});

const player = [];
let nextId = 1; // contador global


server.on('connection', (ws) => {
  ws.id = nextId++; // atribui um id único ao jogador
  console.log(`New client connected (id=${ws.id})`);
  player.push(ws);

  if (player.length == 2) {
    player.forEach((p) => {
      if (p.readyState === 1) { // 1 = OPEN
        p.send(JSON.stringify({ tipo: "info", mensagem: "Dois jogadores conectados! Selecione seu personagem." }));
        p.send(JSON.stringify(characters));
      }
    });
  }else if(player.length > 2) {
    ws.send(JSON.stringify({ tipo: "info", mensagem: "Já existem dois jogadores conectados. Tente novamente mais tarde." }));
    ws.close();
    return;
  }

 

ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.tipo === "personagem_escolhido") {
        ws.personagem = data.personagem; // Salva o personagem escolhido na conexão
        console.log(`Jogador ${ws.id} escolheu: ${ws.personagem}`);
      }
    } catch (e) {
      console.log("Mensagem recebida:", message.toString());
    }
  });

  ws.on('close', () => {
     console.log(`Client disconnected (id=${ws.id})`);
    // Remove o jogador do array player
    const idx = player.indexOf(ws);
    if (idx !== -1) player.splice(idx, 1);
  });
});