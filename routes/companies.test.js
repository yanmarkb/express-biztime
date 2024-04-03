const request = require("supertest");
const app = require("../app");
const db = require("../db");

describe("Companies Routes", () => {
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
		await db.query("INSERT INTO invoices (comp_code, amt) VALUES ($1, $2)", [
			"COMP1",
			100,
		]);
		const result = await db.query(
			"INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) VALUES ($1, $2, $3, $4, $5) RETURNING id",
			["apple", 100, false, new Date(), null]
		);
		invoiceId = result.rows[0].id;
	});

	afterEach(async () => {
		await db.query("DELETE FROM invoices");
		await db.query("DELETE FROM companies");
	});

	test("GET /companies", async () => {
		const response = await request(app).get("/companies");
		expect(response.statusCode).toBe(200);
		expect(response.body.companies).toHaveLength(2);
		expect(response.body.companies).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					code: "COMP1",
					name: "Company 1",
				}),
				expect.objectContaining({
					code: "apple",
					name: "Apple Computer",
				}),
			])
		);
	});

	test("GET /companies/:code", async () => {
		// Clear the invoices for the company
		await db.query("DELETE FROM invoices WHERE comp_code = $1", ["COMP1"]);

		const response = await request(app).get("/companies/COMP1");
		expect(response.statusCode).toBe(200);
		expect(response.body.company).toEqual({
			code: "COMP1",
			name: "Company 1",
			description: "Sample description",
			invoices: [],
		});
	});

	test("POST /companies", async () => {
		const response = await request(app).post("/companies").send({
			code: "company-2",
			name: "Company 2",
			description: "Another company",
		});
		expect(response.statusCode).toBe(201);
		expect(response.body.company).toEqual({
			code: "company-2",
			name: "Company 2",
			description: "Another company",
		});

		// Clean up after test
		await db.query("DELETE FROM companies WHERE code = $1", ["COMP2"]);
	});

	test("PUT /companies/:code", async () => {
		const name = "New Company Name";
		const description = "New Description";

		const response = await request(app)
			.put("/companies/COMP1")
			.send({ name: name, description: description });

		expect(response.statusCode).toBe(200);
		expect(response.body.company.name).toBe(name);
		expect(response.body.company.description).toBe(description);
	});

	test("DELETE /companies/:code", async () => {
		await db.query("DELETE FROM invoices WHERE comp_code = $1", ["COMP1"]);
		const response = await request(app).delete("/companies/COMP1");
		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({ status: "deleted" });
	});
});
