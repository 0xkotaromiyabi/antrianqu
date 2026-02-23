import pg from 'pg';
const { Client } = pg;

async function testWrite() {
    console.log("Testing Write Access on Port 6543...");
    const client = new Client({
        connectionString: "postgresql://postgres.knklvikjjntubslpamjq:antrianqu123@52.62.122.103:6543/postgres?pgbouncer=true&sslmode=require",
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();
        console.log("Connected. Creating test table...");
        await client.query('CREATE TABLE IF NOT EXISTS _prisma_test (id INT PRIMARY KEY)');
        console.log("SUCCESS: Table created.");
        await client.query('DROP TABLE _prisma_test');
        console.log("SUCCESS: Table dropped.");
        await client.end();
    } catch (err) {
        console.error("FAILURE:", err.message);
    }
}

testWrite();
