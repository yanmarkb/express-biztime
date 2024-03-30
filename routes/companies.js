const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /companies
router.get("/", async (req, res, next) => {
	const result = await db.query("SELECT code, name FROM companies");
	return res.json({ companies: result.rows });
});

// GET /companies/[code]
router.get("/:code", async (req, res, next) => {
	const companyResult = await db.query(
		"SELECT code, name, description FROM companies WHERE code = $1",
		[req.params.code]
	);
	if (companyResult.rows.length === 0) {
		return res.sendStatus(404);
	}
	const company = companyResult.rows[0];
	const invoicesResult = await db.query(
		"SELECT id FROM invoices WHERE comp_code = $1",
		[req.params.code]
	);
	company.invoices = invoicesResult.rows.map((row) => row.id);
	return res.json({ company: company });
});

// POST /companies
router.post("/", async (req, res, next) => {
	const { code, name, description } = req.body;
	const result = await db.query(
		"INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description",
		[code, name, description]
	);
	return res.status(201).json({ company: result.rows[0] });
});

// PUT /companies/[code]
router.put("/:code", async (req, res, next) => {
	const { name, description } = req.body;
	const result = await db.query(
		"UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING code, name, description",
		[name, description, req.params.code]
	);
	if (result.rows.length === 0) {
		return res.sendStatus(404);
	}
	return res.json({ company: result.rows[0] });
});

// DELETE /companies/[code]
router.delete("/:code", async (req, res, next) => {
	const result = await db.query("DELETE FROM companies WHERE code = $1", [
		req.params.code,
	]);
	if (result.rowCount === 0) {
		return res.sendStatus(404);
	}
	return res.json({ status: "deleted" });
});

module.exports = router;
