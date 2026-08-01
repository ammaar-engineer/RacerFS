sudo docker compose down
sudo docker volume rm new_backend_minio_data
sudo docker volume rm new_backend_postgres_data
sudo docker compose up -d
npm run start:dev