import { Client } from '@elastic/elasticsearch';

// Elasticsearch connection configuration
const esClient = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || '',
    password: process.env.ELASTICSEARCH_PASSWORD || '',
  },
  // If you are using self-signed certs or docker internal connections:
  tls: {
    rejectUnauthorized: false,
  },
});

// Test connection
esClient.ping()
  .then(() => console.log('✅ Elasticsearch connected successfully'))
  .catch((err) => {
    console.error('❌ Elasticsearch connection failed:', err.message);
    console.log('💡 Make sure Elasticsearch is running on', process.env.ELASTICSEARCH_NODE || 'http://localhost:9200');
  });

export default esClient;
