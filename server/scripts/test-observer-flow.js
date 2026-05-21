/*
Script de teste simples para simular observador + votante via Socket.IO.
Executar: node server/scripts/test-observer-flow.js
Conecta dois clientes ao servidor em execução e verifica que votos de observadores são ignorados.
*/

const io = require('socket.io-client');

const SERVER = process.env.SOCKET_URL || 'http://localhost:4000';
const ID_SECAO = process.env.TEST_SECAO || 'test-secao-1';

function wait(ms){ return new Promise(r => setTimeout(r, ms)); }

(async ()=>{
  console.log('Connecting voter and observer to', SERVER, 'section', ID_SECAO);

  const voter = io(SERVER, { path:'/socket.io' });
  const observer = io(SERVER, { path:'/socket.io' });

  let votes = {};

  voter.on('connect', () => {
    console.log('[voter] connected id=', voter.id);
    voter.emit('usuarioLogado', { usuario: 'VotanteTest', idSecao: ID_SECAO, tipo: 'votante' });
  });

  observer.on('connect', () => {
    console.log('[observer] connected id=', observer.id);
    observer.emit('usuarioLogado', { usuario: 'ObserverTest', idSecao: ID_SECAO, tipo: 'observador' });
  });

  voter.on('usuariosLogados', (u) => console.log('[voter] usuariosLogados', u));
  observer.on('usuariosLogados', (u) => console.log('[observer] usuariosLogados', u));

  voter.on('atualizarVotos', (v) => { votes = v; console.log('[voter] votos atualizados', v); });
  observer.on('atualizarVotos', (v) => { votes = v; console.log('[observer] votos atualizados', v); });

  // aguarda pelas conexões
  await wait(1000);

  console.log('Observer trying to vote (should be ignored)');
  observer.emit('voto', { usuario: 'ObserverTest', valor: '5', idSecao: ID_SECAO });

  await wait(500);

  console.log('Voter voting (should be accepted)');
  voter.emit('voto', { usuario: 'VotanteTest', valor: '8', idSecao: ID_SECAO });

  await wait(500);

  console.log('Final votes object:', votes);

  // Espera que 'votes' contenha VotanteTest, mas não ObserverTest
  if (votes['VotanteTest'] && !votes['ObserverTest']){
    console.log('TEST OK: voto do observador ignorado, voto do votante registrado');
  } else {
    console.error('TEST FAIL: estado de votos inesperado', votes);
  }

  voter.disconnect();
  observer.disconnect();
  process.exit(0);
})();
