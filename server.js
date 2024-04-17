const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const { getAllProducts, getProductById, addProduct, deleteProduct, addImage, getImagesFromProduct, getFirstImageFromProduct, deleteImage } = require('./db.js');

const app = express();
const port = 8080;

// Middleware para permitir solicitudes CORS desde cualquier origen
app.use(cors());

// Middleware para parsear el cuerpo de las solicitudes en formato JSON
app.use(bodyParser.json());

app.listen(port, () => console.log(`listening on port ${port}`));

/* PRODUCTOS */

app.get('/productos', async (req, res) => {
    const products = await getAllProducts();
    res.send(products);
});


app.get('/productos/:id', async (req, res) => {
    const id = req.params.id;
    const product = await getProductById(id);
    res.send(product);
});

app.post('/productos', async (req, res) => {
    const { nombre, descripcion, categoria, precio, precioAmazon, cantidadDisponible } = req.body;
    try {
        const productoAñadido = await addProduct(nombre, descripcion, categoria, precio, precioAmazon, cantidadDisponible);
        res.status(201).json(productoAñadido);
    } catch (error) {
        console.error('Error al añadir el producto:', error);
        res.status(500).json({ error: 'No se pudo añadir el producto. Error interno del servidor.' });
    }
});

app.delete('/productos/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await deleteProduct(id);
        console.log(result.affectedRows)
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Producto eliminado exitosamente.' });
        } else {
            res.status(404).json({ error: 'El producto no existe.' });
        }
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).json({ error: 'Error interno del servidor al eliminar el producto.' });
    }
});


/* IMAGES */

app.get('/firstImage/:productId', async (req, res) => {
    const productId = req.params.productId;
    const imagesUrl = await getFirstImageFromProduct(productId);
    console.log(imagesUrl)
    res.send(imagesUrl);
});

app.get('/images/:productId', async (req, res) => {
    const productId = req.params.productId;
    const imagesUrl = await getImagesFromProduct(productId);
    console.log(imagesUrl)
    const urls = imagesUrl.map(obj => obj.url);
    res.send(urls);
});

app.post('/images/:url/:productoId', async (req, res) => {
    try {
        const url = req.params.url;
        const productoId = req.params.productoId;
        await addImage(url, productoId);
        res.send('Imagen Añadida con Exito');
    } catch (error) {
        console.error('Error al añadir la imagen:', error);
        res.status(500).json({ error: 'No se pudo añadir la imagen. Error interno del servidor.' });
    }
});

app.delete('/images/:productoId', async (req, res) => {
    const productoId = req.params.productoId;
    try {
        const deletedImages = await deleteImage(productoId);
        if (deletedImages && deletedImages.length > 0) {
            res.status(200).json(deletedImages);
        } else {
            res.status(404).json({ message: 'La imagen no pudo ser encontrada o eliminada.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
