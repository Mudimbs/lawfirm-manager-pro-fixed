const express = require("express");
const router = express.Router();
const db = require("../db");

function monthKey(d) {
  const dt = new Date(d);
  return dt.getFullYear() + "-" + String(dt.getMonth()+1).padStart(2,"0");
}

router.get("/", async (req, res) => {
  const invoices = await db.getInvoices();
  const totals = {
    total: invoices.reduce((s,i)=>s+Number(i.amount||0),0),
    paid: invoices.filter(i=>i.status==="Payé").reduce((s,i)=>s+Number(i.amount||0),0),
    unpaid: invoices.filter(i=>i.status==="Non payé").reduce((s,i)=>s+Number(i.amount||0),0),
    partial: invoices.filter(i=>i.status==="Partiel").reduce((s,i)=>s+Number(i.amount||0),0),
  };
  const byMonth = {};
  invoices.forEach(i => {
    const k = monthKey(i.issued_at || new Date());
    byMonth[k] = byMonth[k] || { total:0, paid:0 };
    byMonth[k].total += Number(i.amount||0);
    if (i.status === "Payé") byMonth[k].paid += Number(i.amount||0);
  });
  const months = Object.keys(byMonth).sort();
  res.render("finance/dashboard", { title: "Tableau de bord financier", totals, months, byMonth });
});

module.exports = router;
