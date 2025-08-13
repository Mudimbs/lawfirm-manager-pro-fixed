/**
 * LawFirm Manager - App principale
 */
const path = require("path");
const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const morgan = require("morgan");

const { ensureAuthenticated, ensureRole } = require("./middleware/auth");
const db = require("./db"); // initialise la base et exporte des helpers

const app = express();
const PORT = process.env.PORT || 3000;

// Vues et statiques
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middlewares
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(session({
  secret: process.env.SESSION_SECRET || "lawfirm-secret",
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

// Donne accès aux messages flash et à l'utilisateur dans les vues
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.user = req.session.user || null;
  next();
});

// Routes
const authRoutes = require("./routes/auth");
const indexRoutes = require("./routes/index");
const clientRoutes = require("./routes/clients");
const caseRoutes = require("./routes/cases");
const hearingRoutes = require("./routes/hearings");
const invoiceRoutes = require("./routes/invoices");
const userRoutes = require("./routes/users");
const exportRoutes = require("./routes/exports");
const documentRoutes = require("./routes/documents");
const financeRoutes = require("./routes/finance");

app.use("/", authRoutes);
app.use("/", ensureAuthenticated, indexRoutes);
app.use("/clients", ensureAuthenticated, clientRoutes);
app.use("/dossiers", ensureAuthenticated, caseRoutes);
app.use("/audiences", ensureAuthenticated, hearingRoutes);
app.use("/factures", ensureAuthenticated, invoiceRoutes);
app.use("/utilisateurs", ensureAuthenticated, ensureRole("admin"), userRoutes);
app.use("/export", ensureAuthenticated, ensureRole("admin"), exportRoutes);
app.use("/finance", ensureAuthenticated, financeRoutes);
app.use("/documents", ensureAuthenticated, documentRoutes);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`✅ LawFirm Manager en marche: http://localhost:${PORT}`);
});
