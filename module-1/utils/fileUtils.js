const fs = require('fs').promises;

const getRooms = async () => {
  const data = await fs.readFile('./rooms.json', 'utf-8');
  return JSON.parse(data);
};

const getReservations = async () => {
  const data = await fs.readFile('./reservations.json', 'utf-8');
  return JSON.parse(data);
};

const saveRooms = async (rooms) => {
  await fs.writeFile('./rooms.json', JSON.stringify(rooms, null, 2));
};

const saveReservations = async (reservations) => {
  await fs.writeFile('./reservations.json', JSON.stringify(reservations, null, 2));
};

module.exports = {
  getRooms,
  getReservations,
  saveRooms,
  saveReservations
};
