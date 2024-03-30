const { Client } = require("pg");

const client = new Client({
	connectionString: "postgresql://localhost:5434/biztime",
});

client.connect();

module.exports = client; /** Database setup for BizTime. */
