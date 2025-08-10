
#  Portfolio — Clean Bundle

## Run
### Backend
cd portfolio-backend && npm i && npm run dev  # http://localhost:5174
### Frontend
cd portfolio-frontend && npm i && npm run dev  # http://localhost:5173

- Frontend uses Vite dev proxy: requests to /api go to http://localhost:5174
- Override host with .env: VITE_API_URL=http://your-host:port
