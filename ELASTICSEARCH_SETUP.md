# Elasticsearch Setup Guide for Learning Shala

This guide will help you set up Elasticsearch for the Learning Shala project.

## 📋 Prerequisites

- Node.js installed
- Elasticsearch installed (or use Docker)

## 🚀 Installation Options

### Option 1: Using Docker (Recommended for Development)

```bash
# Run Elasticsearch in Docker
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  elasticsearch:8.11.0
```

### Option 2: Install Locally

1. Download Elasticsearch from: https://www.elastic.co/downloads/elasticsearch
2. Extract and run:
   ```bash
   ./bin/elasticsearch
   ```

### Option 3: Use Elastic Cloud (Production)

1. Sign up at: https://cloud.elastic.co/
2. Create a deployment
3. Get your Cloud ID and credentials

## ⚙️ Configuration

1. Add to your `.env` file:

```env
# Elasticsearch Configuration
ELASTICSEARCH_NODE=http://localhost:9200

# For authentication (if needed):
# ELASTICSEARCH_USERNAME=elastic
# ELASTICSEARCH_PASSWORD=your_password

# For Elastic Cloud:
# ELASTICSEARCH_CLOUD_ID=your_cloud_id
```

## 🔧 Initialize the Index

When you first start the application, the index will be created automatically. However, if you want to manually create it or re-index all universities:

### Option 1: Automatic (on server start)

The index will be created automatically when the server starts (if it doesn't exist).

### Option 2: Manual Re-indexing

You can create a script to re-index all universities:

```typescript
// scripts/reindex-universities.ts
import { createUniversityIndex, reindexAllUniversities } from '../src/services/elasticsearch/university.search.service';
import pool from '../src/config/db';

async function reindex() {
  try {
    // Create index
    await createUniversityIndex();
    
    // Fetch all universities from database
    const fetchUniversities = async () => {
      const [universities]: any = await pool.query(
        `SELECT * FROM universities ORDER BY id`
      );
      
      // Fetch banners and sections for each university
      for (const uni of universities) {
        const [banners]: any = await pool.query(
          `SELECT * FROM university_banners WHERE university_id = ?`,
          [uni.id]
        );
        const [sections]: any = await pool.query(
          `SELECT * FROM university_sections WHERE university_id = ?`,
          [uni.id]
        );
        uni.banners = banners;
        uni.sections = sections;
      }
      
      return universities;
    };
    
    // Re-index all
    await reindexAllUniversities(fetchUniversities);
    console.log('✅ Re-indexing completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Re-indexing failed:', error);
    process.exit(1);
  }
}

reindex();
```

Run it:
```bash
npx ts-node scripts/reindex-universities.ts
```

## 🧪 Testing

### 1. Check Elasticsearch is running:

```bash
curl http://localhost:9200
```

You should see:
```json
{
  "name": "...",
  "cluster_name": "...",
  "version": {
    "number": "8.11.0"
  }
}
```

### 2. Check if index exists:

```bash
curl http://localhost:9200/universities
```

### 3. Search universities:

```bash
# Search API endpoint
GET http://localhost:4000/api/cms/universities/search?q=engineering&page=1&limit=10
```

## 📚 API Endpoints

### Search Universities

```
GET /api/cms/universities/search
```

**Query Parameters:**
- `q` (string, optional): Search query
- `page` (number, default: 1): Page number
- `limit` (number, default: 10): Results per page
- `is_active` (boolean, optional): Filter by active status
- `approval_id` (number, optional): Filter by approval ID

**Example:**
```
GET /api/cms/universities/search?q=engineering&page=1&limit=10&is_active=true
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "university_name": "Engineering University",
        "university_slug": "engineering-university",
        ...
      }
    ],
    "page": 1,
    "pages": 5,
    "total": 50,
    "took": 15
  },
  "message": "Universities searched successfully"
}
```

## 🔍 How It Works

1. **Indexing**: When a university is created or updated, it's automatically indexed in Elasticsearch
2. **Search**: The search endpoint uses Elasticsearch to find universities by name, location, or author
3. **Features**:
   - Fuzzy matching (handles typos)
   - Relevance scoring (better matches appear first)
   - Fast full-text search
   - Filtering by status, approval, etc.

## 🐛 Troubleshooting

### Connection Error

If you see "Elasticsearch connection failed":
1. Check if Elasticsearch is running: `curl http://localhost:9200`
2. Verify the `ELASTICSEARCH_NODE` in `.env`
3. Check firewall settings

### Index Not Found

If you see "index_not_found_exception":
1. The index will be created automatically on first use
2. Or manually create it using the re-indexing script

### No Results

If search returns no results:
1. Make sure universities are indexed (check with re-indexing script)
2. Verify the search query is correct
3. Check Elasticsearch logs

## 📖 Learn More

- [Elasticsearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Elasticsearch Node.js Client](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/index.html)

