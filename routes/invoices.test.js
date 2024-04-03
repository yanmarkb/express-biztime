const request = require("supertest");
const app = require("../app");
const db = require("../db");

describe("Invoices Routes", () => {
	let invoiceId;

	beforeEach(async () => {
		await db.query("DELETE FROM invoices");
		await db.query("DELETE FROM companies");
		await db.query(
			"INSERT INTO companies (code, name, description) VALUES ($1, $2, $3)",
			["COMP1", "Company 1", "Sample description"]
		);
		await db.query(
			"INSERT INTO companies (code, name, description) VALUES ($1, $2, $3)",
			["apple", "Apple Computer", "Innovative technology company"]
		);
		const result = await db.query(
			"INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id",
			["COMP1", 100]
		);
		invoiceId = result.rows[0].id;
	});

	afterEach(async () => {
		await db.query("DELETE FROM invoices");
		await db.query("DELETE FROM companies");
	});

	test("GET /invoices", async () => {
		const response = await request(app).get("/invoices");
		expect(response.statusCode).toBe(200);
		expect(response.body.invoices).toHaveLength(1);
		expect(response.body.invoices[0]).toHaveProperty("id", invoiceId);
	});

	test("GET /invoices/:id", async () => {
		const response = await request(app).get(`/invoices/${invoiceId}`);
		expect(response.statusCode).toBe(200);
		expect(response.body.invoice).toHaveProperty("id", invoiceId);
	});

	test("POST /invoices", async () => {
		const response = await request(app).post("/invoices").send({
			comp_code: "apple",
			amt: 200,
		});
		expect(response.statusCode).toBe(201);
		expect(response.body.invoice).toHaveProperty("comp_code", "apple");
		expect(response.body.invoice).toHaveProperty("amt", 200);

		// Clean up after test
		const id = response.body.invoice.id;
		await db.query("DELETE FROM invoices WHERE id = $1", [id]);
	});

	test("PUT /invoices/:id", async () => {
		const response = await request(app)
			.put(`/invoices/${invoiceId}`)
			.send({ amt: 150, paid: true });
		expect(response.statusCode).toBe(200);
		expect(response.body.invoice).toHaveProperty("amt", 150);
		expect(response.body.invoice).toHaveProperty("paid", true);
	});

	test("DELETE /invoices/:id", async () => {
		const response = await request(app).delete(`/invoices/${invoiceId}`);
		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({ status: "deleted" });
	});
});
