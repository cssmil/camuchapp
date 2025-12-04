import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function fixMigration() {
  console.log('🔧 Intentando arreglar el estado de las migraciones...');
  
  // Parsear DATABASE_URL manual o usar pg standard
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    const migrationName = '20251204043247_add_pgvector_and_embeddings';
    
    console.log(`🗑️ Eliminando registro de migración fallida: ${migrationName}`);
    
    const res = await client.query(
      `DELETE FROM "_prisma_migrations" WHERE migration_name = $1`,
      [migrationName]
    );
    
    console.log(`✅ Registro eliminado. Filas afectadas: ${res.rowCount}`);
    console.log('👉 Ahora puedes ejecutar "npx prisma migrate dev --name add_vector_support" nuevamente.');
    
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.end();
  }
}

fixMigration();
