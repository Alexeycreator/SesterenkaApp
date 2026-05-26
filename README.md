<div align="center">
  
  #  Веб-приложение "Колесо и поршень"
  
  [![.NET](https://img.shields.io/badge/.NET-9.0-512BD4?logo=.net&logoColor=white)](https://learn.microsoft.com/ru-ru/aspnet/core/release-notes/aspnetcore-9.0)
  [![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![SQL Server](https://img.shields.io/badge/SQL%20Server-2019-CC2927?logo=microsoft-sql-server&logoColor=white)](https://www.microsoft.com/ru-ru/sql-server/)
  [![Docker](https://img.shields.io/badge/Docker-✓-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
  
  <p align="center">
    <strong>Интернет-магазин автозапчастей</strong><br>
    Покупка и продажа товаров для автомобилей
  </p>
  
  <p align="center">
    <img src="https://img.shields.io/badge/Status-Active-success" alt="Status">
    <img src="https://img.shields.io/badge/License-MIT-blue" alt="License">
  </p>
  
</div>

---
##  О проекте

**«Колесо и поршень»** — это полнофункциональный интернет-магазин автозапчастей, разработанный на современном стеке технологий.

###  Технологический стек

| Компонент | Технология | Версия |
|-----------|------------|--------|
| **Backend** | ASP.NET Core | 9.0 |
| **Frontend** | React + TypeScript | 18 |
| **Database** | MS SQL Server | 2019 |
| **ORM** | Entity Framework Core | 9.0 |
| **Containerization** | Docker | — |

###  Основные возможности

-  **Каталог товаров** с фильтрацией по категориям, брендам и цене
-  **Авторизация и регистрация** пользователей (роли: пользователь, сотрудник, администратор)
-  **Корзина** с возможностью изменения количества товаров
-  **Оформление заказов** с выбором пункта выдачи
-  **Новости и статьи** автомобильной тематики
-  **Админ-панель** для управления товарами, категориями, брендами и пользователями
-  **Резервное копирование** базы данных

---

# Сборка фронтенда
    cd frontend/client
    npm install
    npm run build

# Сборка бэкенда
    cd backend/WebApi/WebApi
    dotnet publish -c Release -o ./publish

## Способы развертывания

<details>
<summary><b>Подробная инструкция</b></summary>
  
## СПОСОБ 1 (docker-контейнер)
    1.	Перейти в репозиторий GitHub по адресу: https://github.com/Alexeycreator/SesterenkaApp
    2.	Скачать проект
    3.	Открыть cmd
    4.	Перейти к расположению файла docker-compose.yml (он располагается по пути: …\SesterenkaApp
    5.	Пишем команду: docker-compose up -d database && timeout /t 15 && docker exec -it sesterenka_database /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P   "YourStrong!Password123" -Q "RESTORE DATABASE ShesterenkaApp FROM DISK = '/backups/backup_ShesterenkaApp_2026-05-25.bak' WITH REPLACE, MOVE 'ShesterenkaApp' TO '/var/opt/mssql/data/ShesterenkaApp.mdf', MOVE 'ShesterenkaApp_log' TO '/var/opt/mssql/data/ShesterenkaApp_log.ldf'" && docker-compose up -d backend frontend
    6.	После этого (опционально) проверяем существование восстановленной БД, при помощи команды: docker exec -it sesterenka_database /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong!Password123" -Q "SELECT name FROM sys.databases"
    7.	Затем (опционально) переходим в сам контейнер по команде: docker exec -it sesterenka_backend /bin/bash
    8.	Проверяем состояние сервера по команде: curl http://localhost:5027/api/Health/ping
    9.	Вводим команду: exit для выхода из контейнера
    10.	Просмотр приложения
    Замечание: если нужно очистить контейнеры, введите команду: docker-compose down -v 

## СПОСОБ 2 (командный файл)
    1.	Перейти в репозиторий GitHub по адресу: https://github.com/Alexeycreator/SesterenkaApp
    2.	Скачать проект
    3.	Проверить корректность строки подключения в файле appsettings.json, который располагается по пути: …\backend\WebApi\WebApi\appsettings.json (если нет БД с названием ShesterenkaApp, то она создастся)
    4.	Запустить командный файл Start.bat, который располагается в папке SesterenkaApp
    5.	Просмотр приложения

## СПОСОБ 3 (cmd)
    1.	Перейти в репозиторий GitHub по адресу: https://github.com/Alexeycreator/SesterenkaApp
    2.	Скачать проект
    3.	Зайти в папку Backups
    4.	Выбрать самую последнюю резервную копию
    5.	Восстановить БД в (в проекте используется MS SQL Server 2019)
    6.	Проверить корректность строки подключения в файле appsettings.json, который располагается по пути: …\backend\WebApi\WebApi\appsettings.json
    7.	Открыть cmd
    8.	Перейти в папку publish, которая располагается по пути: …\backend\WebApi\WebApi\publish
    9.	Написать команду dotnet WebApi.dll
    10.	Открыть cmd 
    11.	Перейти в папку build, которая располагается по пути: …\frontend\client\build
    12.	Написать команду: npx serve
    13.	Перейти в браузер (например Google Chrome, Microsoft Edge и др.) и написать в строку запроса: http://localhost:3000
    14.	Просмотр приложения

## СПОСОБ 4 (IDE)
    1.	Перейти в репозиторий GitHub по адресу: https://github.com/Alexeycreator/SesterenkaApp
    2.	Скачать проект
    3.	Проверить корректность строки подключения в файле appsettings.json, который располагается по пути: …\backend\WebApi\WebApi\appsettings.json на корректность названия имени SQL сервера (используется SQLEXPRESS)
    4.	Открыть файл WebApi.sln, который располагается по пути: …\backend\WebApi\WebApi.sln в IDE (например, Visual Studio или JetBrains Rider)
    5.	Написать в терминале команду: dotnet tool install --global dotnet-ef
    6.	Написать в терминале команду: dotnet ef database update
    7.	Запустить отладку, чтобы запустить сервер приложения
    8.	Открыть содержимое папки client, которая располагается по пути: …\frontend\client в IDE (например, Visual Studio Code)
    9.	Прописать в терминале команду: npm install
    10.	Прописать в терминале команду: npm start
    11.	Просмотр приложения

