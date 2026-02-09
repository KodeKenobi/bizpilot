#!/usr/bin/env node

const WebSocket = require('ws');

const BACKEND_URL = 'web-production-737b.up.railway.app';
const CAMPAIGN_ID = 2; // Fresh campaign after deploy
const COMPANY_ID = 2; // Company ID from database

console.log('\n🔌 Testing WebSocket Campaign Monitor Connection...');
console.log(`Backend: wss://${BACKEND_URL}`);
console.log(`Campaign: ${CAMPAIGN_ID}, Company: ${COMPANY_ID}\n`);

const wsUrl = `wss://${BACKEND_URL}/ws/campaign/${CAMPAIGN_ID}/monitor/${COMPANY_ID}`;
console.log(`Connecting to: ${wsUrl}\n`);

const ws = new WebSocket(wsUrl);

ws.on('open', () => {
  console.log('✅ WebSocket CONNECTED!');
  console.log('⏳ Waiting for messages from backend...\n');
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    console.log('📨 Message received:');
    console.log(JSON.stringify(message, null, 2));
    console.log('');
  } catch (e) {
    console.log('📨 Raw message:', data.toString());
  }
});

ws.on('error', (error) => {
  console.error('❌ WebSocket ERROR:', error.message);
});

ws.on('close', (code, reason) => {
  console.log(`\n🔒 WebSocket CLOSED`);
  console.log(`Code: ${code}`);
  console.log(`Reason: ${reason || 'No reason provided'}`);
  process.exit(code === 1000 ? 0 : 1);
});

// Timeout after 60 seconds
setTimeout(() => {
  console.log('\n⏰ Timeout reached (60s)');
  ws.close();
}, 60000);

// Keep process alive
process.stdin.resume();
