

sudo systemctl start docker
sudo docker compose up -d
npm run dev
sudo docker compose down
sudo systemctl stop docker