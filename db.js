const { Client } = require("pg");

let DB_URI;

if (process.env.NODE_ENV === "test") {
	DB_URI = "postgresql://localhost:5434/biztime-test";
} else {
	DB_URI = "postgresql://localhost:5434/biztime";
}

const client = new Client({
	connectionString: DB_URI,
});

client.connect();

module.exports = client; /** Database setup for BizTime. */
