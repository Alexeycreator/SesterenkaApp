# SesterenkaApp - веб приложение

# Сборка фронтенда
cd frontend/client

npm install

npm run build

# Сборка бэкенда
cd backend/WebApi/WebApi

dotnet publish -c Release -o ./publish
