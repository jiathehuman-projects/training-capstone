# Database Seed Data Summary

This document describes the mock data that gets seeded into the database for testing purposes.

## Seeded Users

### Admin (1)
- **Username**: admin1
- **Email**: admin1@dimsum.com
- **Password**: password123
- **Role**: admin
- **Name**: Admin User
- **Phone**: +65-1234-5678

### Managers (2)
1. **Username**: manager1
   - **Email**: manager1@dimsum.com
   - **Password**: password123
   - **Role**: manager
   - **Name**: Alice Wong
   - **Phone**: +65-2345-6789

2. **Username**: manager2
   - **Email**: manager2@dimsum.com
   - **Password**: password123
   - **Role**: manager
   - **Name**: David Chen
   - **Phone**: +65-3456-7890

### Staff (5)
1. **Username**: cook1
   - **Role**: staff (cook)
   - **Name**: Michael Lee
   - **Schedule**: Monday-Friday 6AM-2PM

2. **Username**: cook2
   - **Role**: staff (cook)
   - **Name**: Sarah Tan
   - **Schedule**: Wednesday-Sunday (varied shifts)

3. **Username**: server1
   - **Role**: staff (server)
   - **Name**: Jenny Lim
   - **Schedule**: Monday-Sunday 11AM-8PM

4. **Username**: server2
   - **Role**: staff (server)
   - **Name**: Kevin Ng
   - **Schedule**: Monday-Saturday 6PM-11PM

5. **Username**: cleaner1
   - **Role**: staff (cleaner)
   - **Name**: Maria Santos
   - **Schedule**: Daily 5AM-1PM

### Customers (2)
1. **Username**: customer1
   - **Email**: customer1@gmail.com
   - **Name**: John Smith

2. **Username**: customer2
   - **Email**: customer2@gmail.com
   - **Name**: Emma Johnson

## Seeded Menu Items

### Dim Sum Food Items (10)
1. **Har Gow (Prawn Dumplings)** - $6.80
2. **Siu Mai (Pork & Prawn Dumplings)** - $6.50
3. **Char Siu Bao (BBQ Pork Buns)** - $7.20
4. **Xiao Long Bao (Soup Dumplings)** - $8.50
5. **Cheong Fun (Rice Noodle Rolls)** - $7.80
6. **Wu Gok (Taro Croquettes)** - $6.20
7. **Lor Mai Gai (Glutinous Rice in Lotus Leaf)** - $9.50
8. **Jin Deui (Sesame Balls)** - $5.80
9. **Egg Tarts** - $5.50
10. **Turnip Cake (Lo Bak Go)** - $6.80

### Tea & Drinks (5)
1. **Jasmine Tea** - $4.50
2. **Pu-erh Tea** - $5.20
3. **Oolong Tea** - $4.80
4. **Chrysanthemum Tea** - $4.20
5. **Chinese Herbal Tea** - $5.80

## Running the Seed

### Development
```bash
npm run seed
```

### Production
The seed runs automatically when Docker containers start up if `SEED_DATABASE=true` environment variable is set.

### Manual Seeding
```bash
npm run seed:prod
```

## Notes
- All users have the same password: **password123**
- Menu items have realistic pricing from $4.20 to $9.50
- Staff members have detailed weekly availability schedules
- Menu items include allergen information and inventory levels
- All data is cleared and re-seeded each time the script runs