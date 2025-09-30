#!/bin/sh

echo "🔄 Starting application setup..."

echo "📊 Waiting for database to be ready..."
until npx typeorm-ts-node-commonjs query "SELECT 1" -d src/data-source.ts > /dev/null 2>&1
do
  echo "⏳ Database is not ready yet. Waiting..."
  sleep 2
done

echo "✅ Database is ready!"

echo "🔄 Running database migrations..."
npm run migration:run

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully!"
else
    echo "❌ Migration failed!"
    exit 1
fi

echo "🚀 Starting application..."
exec "$@"