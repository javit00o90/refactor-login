import ProductManager from '../dao/models/products.model.js';

import mongoose from 'mongoose';
const Product = mongoose.model('products');

const productManager = new ProductManager(Product);


export const getProducts = async (req, res) => {
    try {
        const options = {
            page: req.query.page || 1,
            limit: req.query.limit || 10,
            sort: {},
            lean: true,
        };

        const query = { status: true };

        if (req.query.category) {
            query.category = req.query.category;
        }

        if (req.query.available) {
            query.stock = { $gt: 0 };
        }

        if (req.query.sortByPrice) {
            options.sort.price = req.query.sortByPrice === 'asc' ? 1 : -1;
        }
        options.limit = req.query.limit || options.limit;

        const result = await Product.paginate(query, options);

        const response = {
            status: 'success',
            payload: result.payload,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.prevLink,
            nextLink: result.nextLink,
        };

        if (req.originalUrl.includes('/api/')) {
            res.status(200).json(response);
        } else {
            return result;
        }

    } catch (error) {
        console.error('Error reading products from MongoDB:', error.message);
        throw error;
    }
};



export const getProductById = async (req, res) => {
    try {
        const productId = req.params.pid;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ error: 'ID de producto no válido' });
        }

        const product = await productManager.getProductById(productId);
        if (product) {
            return res.status(200).json(product);
        } else {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener producto por ID desde MongoDB:', error.message);

        return res.status(500).json({ error: 'Error de servidor', message: error.message });
    }
};


export const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.pid;
        const result = await productManager.deleteProduct(productId);

        if (result === "Producto eliminado correctamente.") {
            const updatedProductList = await productManager.getProducts();
            req.app.get('io').emit('productos', updatedProductList);
            res.status(200).json({ message: "Producto borrado correctamente" });
        } else if (!result) {
            res.status(404).json({ message: "Producto no encontrado" });
        } else {
            res.status(500).json({ error: "Error de servidor!" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error de servidor!" });
    }
};

export const addProduct = async (req, res) => {
    try {
        const productsData = Array.isArray(req.body) ? req.body : [req.body];

        const validationResult = validateProducts(productsData);

        if (validationResult.error) {
            return res.status(400).json({ error: validationResult.error });
        }

        const results = await Promise.all(productsData.map(async (productData) => {
            return await productManager.addProductRawJSON(productData);
        }));

        const responseCodes = {
            "Ya existe un producto con ese código. No se agregó nada.": 400,
            "Producto agregado correctamente.": 201,
            "Error agregando producto.": 500,
        };

        const reStatus = results.some((result) => responseCodes[result] === 201) ? 201 : 500;

        if (reStatus === 201) {
            const updatedProductList = await productManager.getProducts();
            req.app.get('io').emit('productos', updatedProductList);
        }

        return res.status(reStatus).json({ messages: results });

    } catch (error) {
        console.error(`Error en la ruta de adición de productos: ${error.message}`);
        res.status(500).json({ error: "Error de servidor!" });
    }
};

const validateProducts = (productsData) => {
    const requiredFields = ['title', 'description', 'price', 'code', 'stock', 'category'];
    const invalidFields = [];

    for (const productData of productsData) {
        const missingFields = requiredFields.filter(field => !(field in productData));

        if (missingFields.length > 0) {
            invalidFields.push(`Faltan campos requeridos en un producto: ${missingFields.join(', ')}`);
        }

        const typeValidation = {
            title: 'string',
            description: 'string',
            price: 'number',
            code: 'string',
            stock: 'number',
            category: 'string',
            status: 'boolean'
        };

        const productInvalidFields = Object.entries(typeValidation).reduce((acc, [field, type]) => {
            if (productData[field] !== undefined) {
                if (type === 'array' && !Array.isArray(productData[field])) {
                    acc.push(field);
                } else if (typeof productData[field] !== type) {
                    acc.push(field);
                }
            }
            return acc;
        }, []);

        if (!Array.isArray(productData.thumbnails)) {
            invalidFields.push('Formato inválido para el campo thumbnails en un producto');
        }

        if (productInvalidFields.length > 0) {
            invalidFields.push(`Tipos de datos inválidos en los campos de un producto: ${productInvalidFields.join(', ')}`);
        }
    }

    return { error: invalidFields.join('\n') };
};

export const updateProduct = async (req, res) => {
    try {
        const productId = req.params.pid;
        const updates = req.body;

        const result = await productManager.updateProduct(productId, updates);

        if (result.status === 200) {
            const updatedProductList = await productManager.getProducts();
            req.app.get('io').emit('productos', updatedProductList);
        }

        res.status(result.status).json(result);
    } catch (error) {
        console.error(`Error en la ruta de actualización del producto: ${error.message}`);
        res.status(500).json({ error: "Error de servidor!" });
    }
};