const http = require('http');
const url = require('url');
const { getRooms, getReservations, saveRooms, saveReservations } = require('./utils/fileUtils');
const { v4: uuidv4 } = require('uuid');

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const path = parsedUrl.pathname;

  if (method === 'GET' && path === '/rooms') {
    const rooms = await getRooms();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(rooms));
  }

  else if (method === 'POST' && path === '/reservations') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      const { roomId, hour, user } = JSON.parse(body);
      const rooms = await getRooms();
      const room = rooms.find(r => r.id === roomId);

      if (!room) {
        res.writeHead(404);
        return res.end('Room not found');
      }

      const reservations = await getReservations();
      const overlapping = reservations.find(r => r.roomId === roomId && r.hour === hour);

      if (overlapping) {
        res.writeHead(409);
        return res.end('Room already reserved at this time');
      }

      const reservation = {
        id: uuidv4(),
        roomId,
        roomName: room.name,
        hour,
        user
      };
      reservations.push(reservation);
      await saveReservations(reservations);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(reservation));
    });
  }

  else if (method === 'DELETE' && path.startsWith('/reservations/')) {
    const id = path.split('/')[2];
    const reservations = await getReservations();
    const updated = reservations.filter(r => r.id !== id);
    if (reservations.length === updated.length) {
      res.writeHead(404);
      return res.end('Reservation not found');
    }
    await saveReservations(updated);
    res.writeHead(200);
    res.end('Reservation cancelled');
  }

  else if (method === 'GET' && path === '/reservations') {
    const reservations = await getReservations();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(reservations));
  }

  else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(3000, () => {
  console.log('Server listening on http://localhost:3000');
});
