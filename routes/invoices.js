const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /invoices
router.get("/", async (req, res, next) => {
	const result = await db.query("SELECT id, comp_code, amt FROM invoices");
	return res.json({ invoices: result.rows });
});

// GET /invoices/[id]
router.get("/:id", async (req, res, next) => {
	const result = await db.query(
		"SELECT id, amt, paid, add_date, paid_date, comp_code FROM invoices WHERE id = $1",
		[req.params.id]
	);
	if (result.rows.length === 0) {
		return res.sendStatus(404);
	}
	const invoice = result.rows[0];
	const companyResult = await db.query(
		"SELECT code, name, description FROM companies WHERE code = $1",
		[invoice.comp_code]
	);
	invoice.company = companyResult.rows[0];
	return res.json({ invoice: invoice });
});

// POST /invoices
router.post("/", async (req, res, next) => {
	const { comp_code, amt } = req.body;
	const result = await db.query(
		"INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date",
		[comp_code, amt]
	);
	return res.status(201).json({ invoice: result.rows[0] });
});

// PUT /invoices/:id
router.put("/:id", async (req, res, next) => {
	const { amt, paid } = req.body;
	let paid_date = null;

	const currentInvoice = await db.query(
		"SELECT paid, paid_date FROM invoices WHERE id = $1",
		[req.params.id]
	);

	if (currentInvoice.rows.length === 0) {
		return res.sendStatus(404);
	}

	if (paid === true && currentInvoice.rows[0].paid === false) {
		paid_date = new Date();
	} else if (paid === false) {
		paid_date = null;
	} else {
		paid_date = currentInvoice.rows[0].paid_date;
	}

	const result = await db.query(
		"UPDATE invoices SET amt = $1, paid = $2, paid_date = $3 WHERE id = $4 RETURNING id, comp_code, amt, paid, add_date, paid_date",
		[amt, paid, paid_date, req.params.id]
	);

	return res.json({ invoice: result.rows[0] });
});

// DELETE /invoices/[id]
router.delete("/:id", async (req, res, next) => {
	const result = await db.query("DELETE FROM invoices WHERE id = $1", [
		req.params.id,
	]);
	if (result.rowCount === 0) {
		return res.sendStatus(404);
	}
	return res.json({ status: "deleted" });
});

module.exports = router;
