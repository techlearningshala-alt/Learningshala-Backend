# States and Cities Data

## How to Use

1. **Prepare your JSON file** with the following format:

```json
[
  {
    "name": "Maharashtra",
    "cities": ["Mumbai", "Pune", "Nagpur", "Aurangabad", ...]
  },
  {
    "name": "Karnataka",
    "cities": ["Bengaluru", "Mysuru", "Hubli", ...]
  }
]
```

2. **Run the seed script**:

```bash
# Using default path (src/data/indian-states-cities.json)
node src/scripts/seed-states-cities.js

# Or specify your own JSON file
node src/scripts/seed-states-cities.js path/to/your/file.json
```

## Features

- ✅ Automatically skips duplicate states
- ✅ Automatically skips duplicate cities (per state)
- ✅ Shows progress during insertion
- ✅ Provides summary at the end
- ✅ Safe to run multiple times (idempotent)

## Notes

- The script will create states first, then cities
- Cities are linked to states via `state_id` foreign key
- All entries are set to `is_active = 1` by default
- The script handles errors gracefully and continues processing

