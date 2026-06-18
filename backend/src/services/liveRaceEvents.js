import { EventEmitter } from 'node:events';

const liveRaceEvents = new EventEmitter();
liveRaceEvents.setMaxListeners(100);

// Tạo tên sự kiện SSE theo dạng 'race:{raceId}' để nhận diện cuộc đua cụ thể
const eventName = (raceId) => `race:${raceId}`;

// Phát sóng cập nhật của một cuộc đua tới tất cả client đang lắng nghe qua EventEmitter
export const broadcastRaceUpdate = (raceId) => {
  if (!raceId) return;

  liveRaceEvents.emit(eventName(raceId), {
    raceId,
    updatedAt: new Date().toISOString(),
  });
};

// Thiết lập kết nối Server-Sent Events (SSE) để trân sống cập nhật của cuộc đua đến client
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
