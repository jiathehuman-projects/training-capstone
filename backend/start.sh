#!/bin/sh

echo "Starting application setup..."

echo "Waiting for database to be ready..."
until npx typeorm-ts-node-commonjs query "SELECT 1" -d src/data-source.ts > /dev/null 2>&1
do
  echo "Database is not ready yet. Waiting..."
  sleep 2
done

echo "Database is ready!"

echo "Running database migrations..."
npm run migration:run

if [ $? -eq 0 ]; then
    echo "Migrations completed successfully!"
else
    echo "Migration failed!"
    exit 1
fi

# Seed database if SEED_DATABASE is set to true
if [ "$SEED_DATABASE" = "true" ]; then
    echo "Seeding database..."
    npm run seed:prod
    if [ $? -eq 0 ]; then
        echo "Database seeding completed successfully!"
    else
        echo "Database seeding failed, but continuing..."
    fi
fi

echo "Starting application..."
exec "$@"