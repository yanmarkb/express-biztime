const request = require("supertest");
const app = require("../app");
const db = require("../db");

describe("Companies Routes", () => {
	beforeEach(async () => {
		await db.query("DELETE FROM companies");
		await db.query(
			"INSERT INTO companies (code, name, description) VALUES ($1, $2, $3)",
			["COMP1", "Company 1", "Sample description"]
		);
	});

	afterEach(async () => {
		await db.query("DELETE FROM companies WHERE code = $1", ["COMP1"]);
	});

	test("GET /companies", async () => {
		const response = await request(app).get("/companies");
		expect(response.statusCode).toBe(200);
		expect(response.body.companies).toHaveLength(1);
		expect(response.body.companies[0]).toEqual({
			code: "COMP1",
			name: "Company 1",
		});
	});

	test("GET /companies/:code", async () => {
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
			code: "COMP2",
			name: "Company 2",
			description: "Another company",
		});
		expect(response.statusCode).toBe(201);
		expect(response.body.company).toEqual({
			code: "COMP2",
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
		const response = await request(app).delete("/companies/COMP1");
		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({ status: "deleted" });
	});
});
