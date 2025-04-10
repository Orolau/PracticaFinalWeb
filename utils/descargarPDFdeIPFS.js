const fetch = require('node-fetch');

const descargarPDFDesdeIPFS = async (req, res) => {
    const ipfsUrl = req.deliverynote.pdf

    try {
        const response = await fetch(ipfsUrl);
        if (!response.ok) {
            throw new Error('Error al obtener el archivo desde IPFS');
        }

        // Configurar cabeceras para que el navegador lo descargue
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="documento.pdf"');

        // Enviar el contenido directamente al cliente
        response.body.pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al descargar el PDF desde IPFS');
    }
};
module.exports = descargarPDFDesdeIPFS