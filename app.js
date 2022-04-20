const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const hbs = require("express-handlebars");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();

app.use(express.urlencoded({ extended: true }));

/* Mongoose SetUp */

mongoose.connect(
  process.env.MONGODB_URL || "mongodb://localhost:27017/mongo-1",
  { useNewUrlParser: true }
);

const UsuarioSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const Usuario = mongoose.model("Usuario", UsuarioSchema);

/* Metodos para encryptar el password y compararlo para el login */

UsuarioSchema.methods.encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

UsuarioSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};
/* UsuarioSchema.method({
  encryptPassword: async function (password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  },
  matchPassword: async function (password) {
    return await bcrypt.compare(password, this.password);
  },
});
 */

// handlebars setup
app.set("views", path.join(__dirname, "views"));

app.engine(
  ".hbs",
  hbs.engine({
    layoutsDir: path.join(app.get("views"), "layouts"),
    partialsDir: path.join(app.get("views"), "partials"),
    extname: ".hbs",
    defaultLayout: "main",
  })
);

app.set("view engine", ".hbs");

/* Codigo Funcional */

/*  Views  */

app.get("/", async (req, res) => {
  let usuarios = await Usuario.find().lean();
  res.render("index", { usuarios });
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/logout", (req, res) => {
  res.render("index");
});

app.post("/login", (req, res) => {
  const usuarioRegistrado = req.body;
  console.log(usuarioRegistrado);
  res.render("index");
});

app.post("/", async (req, res) => {
  const { name, email, password } = req.body;
  // const salt = await bcrypt.genSalt(10);
  // const hash = await bcrypt.hash(password, salt);
  // const usuario = new Usuario({ name, email, password: hash });
  const usuario = await new Usuario({ name, email, password });
  console.log(usuario);
  usuario.password = await usuario.encryptPassword(password);
  // console.log(usuario);
  // usuario.password = await Usuario.encryptPassword(password);
  await usuario.save();
  let usuarios = await Usuario.find().lean();
  res.render("index", { usuarios });
});

app.listen(process.env.PORT, () =>
  console.log(`Listening on port ${process.env.PORT} ...`)
);
