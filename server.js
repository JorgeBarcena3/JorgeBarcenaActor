const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static("public")); // tu web

// Ruta contacto
app.post("/contacto", (req, res) => {
  const { name, email, message, date } = req.body;

  if (!name || !email || !message) {
    return res.status(400).send("Datos incompletos");
  }

  // Crear carpeta contacto si no existe
  const dirPath = path.join(__dirname, "contacto");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }

  // Nombre de archivo seguro
  const fileName = `${Date.now()}_${email.replace(/[^a-z0-9]/gi, "_")}.txt`;
  const filePath = path.join(dirPath, fileName);

  // Contenido del TXT
  const content = `
NOMBRE: ${name}
EMAIL: ${email}
FECHA: ${new Date(date).toLocaleString()}

MENSAJE:
${message}
`;

  fs.writeFile(filePath, content, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error al guardar el mensaje");
    }
    res.status(200).send("Mensaje guardado");
  });
});

app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
