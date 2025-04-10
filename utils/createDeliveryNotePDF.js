const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { deliverynoteModel } = require('../models');
const { handleHttpError } = require("../utils/handleError.js");
const { uploadToPinata } = require('../utils/handleUploadIPFS.js');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const fetch = require('node-fetch');



const getDeliverynotePdf = async (req, res) => {
  try {
    const { id } = req.params;

    const deliverynote = await deliverynoteModel.findById(id)
      .populate('userId')
      .populate('clientId')
      .populate('projectId');

    
    const storagePath = path.join(__dirname, '../storage');

    // Crear carpeta si no existe
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }

    const doc = new PDFDocument({ margin: 50 });
    const fileName = `albaran-${deliverynote._id}.pdf`;

    

    // Guardar en el disco
    const fileFullPath = path.join(storagePath, fileName);
    const writeStream = fs.createWriteStream(fileFullPath);
    doc.pipe(writeStream);

    // === ENCABEZADO ===
    doc.fontSize(20).text(`Albarán`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`ID del Albarán: ${deliverynote._id}`);
    doc.moveDown();

    // === DATOS DEL USUARIO ===
    doc.fontSize(14).text('Datos del Usuario', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12)
      .text(`Nombre: ${deliverynote.userId.name} ${deliverynote.userId.surnames}`)
      .text(`Email: ${deliverynote.userId.email}`);
    doc.moveDown();

    // === DATOS DEL CLIENTE ===
    doc.fontSize(14).text('Datos del Cliente', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12)
      .text(`Nombre: ${deliverynote.clientId.name}`)
      .text(`CIF: ${deliverynote.clientId.cif}`)
      .text(`Dirección: ${deliverynote.clientId.address.street}, ${deliverynote.clientId.address.number}`)
      .text(`${deliverynote.clientId.address.postal}, ${deliverynote.clientId.address.city}, ${deliverynote.clientId.address.province}`);
    doc.moveDown();

    // === DATOS DEL PROYECTO ===
    if (deliverynote.projectId) {
      doc.fontSize(14).text('Datos del Proyecto', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12)
        .text(`Nombre: ${deliverynote.projectId.name}`)
        .text(`Código: ${deliverynote.projectId.projectCode}`);
      doc.moveDown();
    }

    // === DETALLES DEL ALBARÁN ===
    doc.fontSize(14).text('Detalles del Albarán', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12)
      .text(`Formato: ${deliverynote.format}`)
      .text(`Fecha de trabajo: ${deliverynote.workdate}`)
      .text(`Estado: ${deliverynote.pending ? 'Pendiente' : 'Finalizado'}`);
    doc.moveDown();

    if (deliverynote.description) {
      doc.fontSize(12).text(`Descripción:`);
      doc.text(deliverynote.description);
      doc.moveDown();
    }

    if (deliverynote.format === "hours" && Array.isArray(deliverynote.hours)) {
      doc.fontSize(12).text("Horas trabajadas:");
      deliverynote.hours.forEach((hour, i) => {
        doc.text(`• ${hour} horas`);
      });
      doc.moveDown();
    }

    if (deliverynote.format === "material" && Array.isArray(deliverynote.materials)) {
      doc.fontSize(12).text("Materiales:");
      deliverynote.materials.forEach((mat) => {
        doc.text(`• ${mat.name}: ${mat.quantity} ${mat.unit}`);
      });
      doc.moveDown();
    }

    // === FIRMA ===
    if (deliverynote.sign) {
      doc.moveDown(2);
      doc.fontSize(12).text("Firma del Responsable:", {
        align: "right",
      });

      try {
        if (deliverynote.sign.startsWith('http')) {
          const response = await fetch(deliverynote.sign);
          if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
          const imageBuffer = await response.buffer();
      
          doc.image(imageBuffer, doc.page.width - 200, doc.y, {
            fit: [150, 100],
            align: 'right',
          });
        } 
      } catch (e) {
        console.error("Error cargando la imagen de firma:", e.message);
      }
    }else {
          doc.fontSize(10).text("Documento pendiente de firmar", { align: "right" });
        }

    doc.end();

    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    const fileBuffer = await readFile(fileFullPath);
    const result = await uploadToPinata(fileBuffer, fileName);
    const ipfsHash = result.IpfsHash;
    const ipfsURL = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    req.deliverynote = await deliverynoteModel.findByIdAndUpdate(
      { "_id": deliverynote._id },
      { pdf: ipfsURL },
      { new: true }
    );
    
  } catch (err) {
    console.error(err);
    handleHttpError(res, 'INTERNAL_SERVER_ERROR', 500);
  }
};

module.exports = {
  getDeliverynotePdf
};
