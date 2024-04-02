const request = require("supertest");
const app = require("../app");
const db = require("../db");

describe("Invoices Routes", () => {
	let invoiceId;

	beforeEach(async () => {
		await db.query("DELETE FROM invoices");
		await db.query("DELETE FROM invoices WHERE comp_code = $1", ["COMP1"]);
		await db.query("DELETE FROM companies");
		await db.query("DELETE FROM companies WHERE code = $1", ["COMP1"]);
		await db.query(
			"INSERT INTO companies (code, name, description) VALUES ($1, $2, $3)",
			["COMP1", "Company 1", "Sample description"]
		);
		const result = await db.query(
			"INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) VALUES ($1, $2, $3, $4, $5) RETURNING id",
			["COMP1", 100, false, new Date(), null]
		);
		invoiceId = result.rows[0].id;
	});

	afterEach(async () => {
		await db.query("DELETE FROM invoices WHERE comp_code = $1", ["COMP1"]);
		await db.query("DELETE FROM companies WHERE code = $1", ["COMP1"]);
	});

	test("GET /invoices", async () => {
		const response = await request(app).get("/invoices");
		expect(response.statusCode).toBe(200);
		expect(response.body.invoices).toHaveLength(1);
		expect(response.body.invoices[0]).toHaveProperty("comp_code", "COMP1");
	});

	test("GET /invoices/:id", async () => {
		const response = await request(app).get(`/invoices/${invoiceId}`);
		expect(response.statusCode).toBe(200);
		expect(response.body.invoice).toHaveProperty("comp_code", "COMP1");
	});

	test("POST /invoices", async () => {
		const response = await request(app).post("/invoices").send({
			comp_code: "COMP1",
			amt: 200,
			paid: false,
			add_date: "2022-01-01",
			paid_date: null,
		});
		expect(response.statusCode).toBe(201);
		expect(response.body.invoice.comp_code).toEqual("COMP1");
	}, 10000);

	test("PUT /invoices/:id", async () => {
		const amt = 150;
		const response = await request(app)
			.put(`/invoices/${invoiceId}`)
			.send({ amt: amt });
		expect(response.statusCode).toBe(200);
		expect(response.body.invoice.amt).toEqual(amt);
	});

	test("DELETE /invoices/:id", async () => {
		const response = await request(app).delete(`/invoices/${invoiceId}`);
		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({ status: "deleted" });
	});
});
