#!/bin/sh
set -e

echo "==> Применяю миграции базы данных..."
npx prisma migrate deploy

echo "==> Запускаю сервер..."
exec node dist/src/main
