import { Client } from '@elastic/elasticsearch';

// Elasticsearch connection configuration
const esClient = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  // Add authentication if needed:
  // auth: {
  //   username: process.env.ELASTICSEARCH_USERNAME || '',
  //   password: process.env.ELASTICSEARCH_PASSWORD || '',
  // },
  // For cloud Elasticsearch:
  // cloud: {
  //   id: process.env.ELASTICSEARCH_CLOUD_ID || '',
  // },
});

// Test connection
esClient.ping()
  .then(() => console.log('✅ Elasticsearch connected successfully'))
  .catch((err) => {
    console.error('❌ Elasticsearch connection failed:', err.message);
    console.log('💡 Make sure Elasticsearch is running on', process.env.ELASTICSEARCH_NODE || 'http://localhost:9200');
  });

export default esClient;

