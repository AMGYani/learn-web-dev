import { TODAY, getSlots } from './database.js';

const DELAY_MS = 600;

export function mockApiPlugin() {
  return {
    name: 'mock-api-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/booking/today') {
          setTimeout(() => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(TODAY));
          }, DELAY_MS);
          return;
        }

        if (req.url.startsWith('/api/slots')) {
          const url = new URL(req.url, 'http://localhost');
          const day = parseInt(url.searchParams.get('day'), 10);
          const month = parseInt(url.searchParams.get('month'), 10);
          const year = parseInt(url.searchParams.get('year'), 10);

          setTimeout(() => {
            res.setHeader('Content-Type', 'application/json');
            if (isNaN(day) || isNaN(month) || isNaN(year)) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Неверные параметры' }));
            } else {
              res.end(JSON.stringify(getSlots(day, month, year)));
            }
          }, DELAY_MS);
          return;
        }

        next();
      });
    },
  };
}