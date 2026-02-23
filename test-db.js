import pg from 'pg';
const { Client } = pg;

async function testConnection(config, label) {
    console.log(`Testing ${label}...`);
    const client = new Client({
        ...config,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();
        console.log(`SUCCESS: Connected to ${label}`);
        const res = await client.query('SELECT current_user, current_database()');
        console.log('Results:', res.rows[0]);
        await client.end();
        return true;
    } catch (err) {
        console.error(`FAILURE: ${label} error:`, err.message);
        return false;
    }
}

const PASSWORD = "antrianqu123";
const HOST = "52.62.122.103";
const PROJECT_REF = "knklvikjjntubslpamjq";

(async () => {
    // Port 5432 (Session) with Prefix
    await testConnection({
        user: `postgres.${PROJECT_REF}`,
        host: HOST,
        database: 'postgres',
        password: PASSWORD,
        port: 5432
    }, "Port 5432 + Prefix");

    // Port 6543 (Transaction) with Prefix
    await testConnection({
        user: `postgres.${PROJECT_REF}`,
        host: HOST,
        database: 'postgres',
        password: PASSWORD,
        port: 6543
    }, "Port 6543 + Prefix");
})();
