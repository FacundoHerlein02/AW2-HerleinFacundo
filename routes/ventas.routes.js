import  { Router } from 'express';
//Utils Ventas
import {getVentaByid,getUltId,cargarVentas,getVentas,agregarVenta,actualizarVenta,actualizaVentas} from '../utils/utilsVentas.js';
//Utils Productos
import {getProdByid,updateStockMem,UpdateStock,cargarProductos,getProductos,actualizaProductos} from '../utils/utilsProductos.js';
//Utils Usuarios
import {getUserByid,cargarUsuarios} from '../utils/utilsUsuarios.js';
const router= Router();
// /ventas

//GET
//Muestra detalle de las ventas
router.get('/getAllVentas', async(req, res) => {
    try {
        //lee el json
        await cargarVentas();
        await cargarProductos();
        await cargarUsuarios();
        //Carga las ventas en la variable
        let ventas= getVentas();
        const result = [];
        for (const e of ventas) {
            let user;            
            try {
                user = getUserByid(e.id_cliente);                
            } catch (error) {
                return res.status(400).json({ error: error.message });
            }
            let productosDetalle;
            try {
                productosDetalle = e.productos.map(item => {
                    const prod = getProdByid(item.id_producto);
                    return {                        
                        Marca: prod.marca,
                        Descripcion: prod.descripcion,
                        Cantidad: item.cantidad,
                        Subtotal:'$'+ item.subtotal
                    };
                });
            } catch (error) {
                return res.status(400).json({ error: error.message });
            }

            result.push({
                Fecha: e.fecha,
                Cliente: user.Nombre + ' ' + user.Apellido,
                Productos: productosDetalle,
                Total:'$'+ e.total
            });
        }

        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(404).json(`No se encontraron ventas.`);
        }
    } catch (error) {
        res.status(500).json({ error: "Error del servidor." });
    }
});
//Muestra detalle de venta por Id
router.get('/ventaByid/:id',async(req,res)=>{
    try 
    {
        //lee el json
        await cargarVentas();
        await cargarProductos();
        await cargarUsuarios();            
        const id= Number(req.params.id);
        let result={};
        let venta =''        
        try
        {
            venta = getVentaByid(id);
        }
        catch(error)
        {
            return res.status(400).json({ error: error.message });
        }       
        if (venta) 
        {
            let user;
            //Obtiene el usuario            
            try 
            {
                user = getUserByid(venta.id_cliente);                
            } catch (error) 
            {
                return res.status(400).json({ error: error.message });
            } 
            let productosDetalle;
            try 
            {
                productosDetalle = venta.productos.map(item => {
                const prod = getProdByid(item.id_producto);
                return {                        
                    Marca: prod.marca,
                    Descripcion: prod.descripcion,
                    Cantidad: item.cantidad,
                    Subtotal:'$'+ item.subtotal
                };
            });
            } catch (error) {
                return res.status(400).json({ error: error.message });
            }

            result={
                Fecha: venta.fecha,
                Cliente: user.Nombre + ' ' + user.Apellido,
                Productos: productosDetalle,
                Total:'$'+ venta.total
            }
                       
            res.status(200).json(result);
        } else {
            res.status(404).json(`No se encontraron ventas.`);
        }
    } 
    catch (error) 
    {
        res.status(500).json({error:"Error del servidor."});
    }
});

//POST

//Crea ventas
router.post('/newVenta',async(req,res)=>{
    try 
    {        
        //lee el json
        await cargarVentas();
        await cargarProductos();
        await cargarUsuarios(); 
        const{fecha,idCli,prods}= req.body
        if(!fecha||!idCli||!Array.isArray(prods) || prods.length === 0)
        {
            return res.status(401).json("Faltan completar campos");
        }        
        else
        {
            //Valida que exista el usuario
            try 
            {
                getUserByid(idCli);
            } catch (error) 
            {
                return res.status(404).json(error.message);
            }    
            const productosVenta = [];            
            let total = 0;

            for (const item of prods) {
                const { idProd, cantidad } = item;

                if (!idProd || !cantidad || cantidad <= 0) {
                    return res.status(400).json("Producto o cantidad inválidos");
                }    

                const producto = getProdByid(idProd); 
                   
                if (!producto) {
                    return res.status(404).json(`Producto con id ${idProd} no encontrado`);
                }
                
                //Actualiza el stock en memoria
                const cantidadNegativa = cantidad * -1;              
                try {
                updateStockMem(idProd, cantidadNegativa);
                } catch (error) {
                    return res.status(400).json(error.message);
                }                
                
                let subtotal = Math.round(producto.precio * cantidad * 100) / 100; 
                
                productosVenta.push({
                    id_producto: idProd,
                    cantidad,
                    subtotal
                });    

                total += subtotal;
            }           
            // Una vez validado el stock, graba permanente
            UpdateStock();

            //Redondea
            total = Math.round(total * 100) / 100;
            
            const NewVenta = {
                id_venta: getUltId(),
                fecha:fecha,
                id_cliente: idCli,
                productos: productosVenta,
                total
            };
            await agregarVenta(NewVenta);                    
            res.status(201).json(NewVenta);            
        }

    } catch (error) 
    {
        res.status(500).json({error:"Error del servidor."});
    }
});

//PUT
router.put('/updateVenta',async(req,res)=>{
    //lee el json
    await cargarVentas();
    await cargarProductos();
    await cargarUsuarios();     
    const{id,fecha,prods,idCli}= req.body;    
    let venta;
    if(!id||!fecha||!Array.isArray(prods) || prods.length === 0 ||!idCli)
    {
        return res.status(401).json("Faltan completar campos");
    }
    try {
        try 
        {
            //Obtiene la venta
            venta =getVentaByid(Number(id));  
        } 
        catch (error) 
        {
            return res.status(404).json(error.message);
        }
        //Valida si existe el cliente
        try {
            getUserByid(idCli);
        } catch (error) {
            return res.status(404).json(`Cliente con id ${idCli} no encontrado`);
        }
        //Mapa con productos Originales de la venta
        const originalProductosMap = new Map();
        //Guarda los productos y cantidades de la venta
        for (const p of venta.productos) 
        {
            originalProductosMap.set(p.id_producto, p.cantidad);
        }
        //Si la venta existe
        if(venta)
        {
            const productosVenta = [];            
            let Total = 0;
            //Recorre el arreglo de productos
            for(const item of prods)
            {
                const { idProd, cantidad } = item;
                if (!idProd || !cantidad || cantidad <= 0) {
                    return res.status(400).json("Producto o cantidad inválidos");
                }
                //Valida si existe el producto  
                const producto = getProdByid(idProd);                 
                if (!producto) {
                    return res.status(404).json(`Producto con id ${idProd} no encontrado`);
                }
                // Cantidad original vendida (si existe)
                const cantidadOriginal = originalProductosMap.get(idProd) || 0;

                if (cantidadOriginal !== cantidad) {
                    //actualizamos stock según la diferencia
                    const diferencia = cantidadOriginal - cantidad;
                    try {
                        updateStockMem(idProd, diferencia);
                    } catch (error) {
                        return res.status(400).json(error.message);
                    }
                }
                // Eliminamos del mapa para luego saber qué productos fueron removidos
                originalProductosMap.delete(idProd);                

                let subtotal = Math.round(producto.precio * cantidad * 100) / 100; 
                
                productosVenta.push({
                    id_producto: idProd,
                    cantidad,
                    subtotal
                });    

                Total += subtotal;
            }

            // Los productos que quedaron en originalProductosMap fueron removidos de la venta
            for (const [idProdRemovido, cantidadRemovida] of originalProductosMap.entries()) {
                try {
                    // Sumamos la cantidad removida al stock
                    updateStockMem(idProdRemovido, cantidadRemovida);
                } catch (error) {
                    return res.status(400).json(error.message);
                }
            }
            // Una vez validado el stock, graba permanente
            UpdateStock();

            Total = Math.round(Total * 100) / 100;
            venta.fecha=fecha
            venta.id_cliente=idCli
            venta.productos=productosVenta
            venta.total=Total
            await actualizarVenta(venta);                    
            res.status(200).json("Venta actualizada correctamente")            
        }
        else
        {
            return res.status(404).json("Venta no encontrada");
        }
    } catch (error) {
        res.status(500).json({error:"Error del servidor."});
    }
    
});

//DELETE

router.delete('/deleteVenta/:id',async(req,res)=>{
    try 
    {
        const id = Number(req.params.id);
        //Lee el Json
        await cargarVentas();
        await cargarProductos();
        //Carga los Json
        let ventas = getVentas();
        let productos = getProductos();
    
        // Buscar la venta a eliminar
        const ventaAEliminar = ventas.find(v => v.id_venta === Number(id));
        if (!ventaAEliminar) {
          return res.status(404).json({ error: "Venta no encontrada" });
        }    
        // Actualizar el stock
        ventaAEliminar.productos.forEach(item => {
          const prod = productos.find(p => p.id_producto === item.id_producto);
          if (prod) {
            prod.stock += item.cantidad;  // sumamos la cantidad
          }
        });    
        //eliminar la venta por id
        ventas = ventas.filter(v => v.id_venta !== Number(id));    
        // Guardar los JSON
        await actualizaVentas(ventas);
        await actualizaProductos(productos);    
        res.status(200).json({ mensaje: "Venta eliminada correctamente" });
    } catch (error) {
        console.error("Error eliminando moto:", error);
        res.status(500).json({ error: "Error del servidor" });
    }
});

export default router