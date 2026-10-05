import pg from "pg";
import "dotenv/config";

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const client = new Client({ connectionString });
await client.connect();
try {
  await client.query("BEGIN");
  const orders = await client.query("UPDATE orders SET status = 'under_review', updated_at = NOW() WHERE status = 'pending' RETURNING id");
  await client.query("UPDATE order_status_history SET status = 'under_review' WHERE status = 'pending'");
  await client.query("COMMIT");
  console.log(`Normalized ${orders.rowCount ?? 0} existing pending orders to under_review.`);
} catch (error) {
  await client.query("ROLLBACK");
  console.error(error);
  process.exitCode = 1;
} finally {
  await client.end();
}
