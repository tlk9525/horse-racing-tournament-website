import { EventEmitter } from 'node:events';

const liveRaceEvents = new EventEmitter();
liveRaceEvents.setMaxListeners(100);

const eventName = (raceId) => `race:${raceId}`;

export const broadcastRaceUpdate = (raceId) => {
  if (!raceId) return;

  liveRaceEvents.emit(eventName(raceId), {
    raceId,
    updatedAt: new Date().toISOString(),
  });
};

export const streamRaceUpdates = (req, res, raceId) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  const sendEvent = (payload) => {
    res.write(`event: race-update\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 25000);

  sendEvent({
    raceId,
    updatedAt: new Date().toISOString(),
    initial: true,
  });

  const listener = (payload) => sendEvent(payload);
  liveRaceEvents.on(eventName(raceId), listener);

  req.on('close', () => {
    clearInterval(heartbeat);
    liveRaceEvents.off(eventName(raceId), listener);
    res.end();
  });
};
