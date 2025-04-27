import { Router } from 'express';
import {getProdByid,getUltId,cargarProductos,getProductos,agregarProducto,actualizarProducto,actualizaProductos} from '../utils/utilsProductos.js';
const router= Router();

// /productos

// GET
//Obtiene todos los productos
router.get('/allProductos',async(req,res)=>{    
    try
    {
        //lee el json
        await cargarProductos();
        //Carga los productos en una variable
        let productos=getProductos()
        const result= productos.map(e=>{
            return{
                Marca: e.marca,
                Descripción: e.descripcion,
                Precio:'$'+ e.precio,
                Stock:e.stock,
                Imagen: e.img,
                Imagenes: e.imagenes                        
            }
        })
        if(result && result.length>0)
        {
            res.status(200).json(result);
        }
        else
        {
            res.status(404).json(`No se encontraron productos.`);
        }
    }
    catch(error)
    {
        res.status(500).json({ error: "Error del servidor" });
    }
});

//Nombre de todas las motos que sean de una marca especifica
router.get('/motosMarca/:marca',async(req,res)=>{
    try
    {
        //lee el json
        await cargarProductos();
        //Carga los productos en una variable
        let productos=getProductos()
        const marca= req.params.marca;
        const motosFiltradas=productos.filter(e =>e.marca == marca); //Filtra por marca      
        const result= motosFiltradas.map(e=>{
            return{
                Marca: e.marca,
                Descripción: e.descripcion,
                Precio:'$'+ e.precio,
                Stock:e.stock,
                Imagen: e.img,
                Imagenes: e.imagenes                        
            }
        });
        if(result && result.length>0)
        {
            res.status(200).json(result);
        }
    }
    catch(error)
    {
        res.status(500).json({ error: "Error del servidor" });
    }
});
 //Todas las motos en un rango de precio
router.get('/filtroPrecio/:min/:max',async(req,res)=>{
    try 
    {
        //lee el json
        await cargarProductos();
        //Carga los productos en una variable
        let productos=getProductos()
        const min= req.params.min;
        const max= req.params.max;
        const motosFiltradas=productos.filter(e =>e.precio>=min &&e.precio<=max ); //Filtra por marca      
        const result= motosFiltradas.map(e=>{
            return{
                Marca: e.marca,
                Descripción: e.descripcion,
                Precio:'$'+ e.precio,
                Stock:e.stock,
                Imagen: e.img,
                Imagenes: e.imagenes                        
            }
        });
        if(result && result.length>0)
        {
            res.status(200).json(result);
        }
    } 
    catch (error) 
    {
        res.status(500).json({ error: "Error del servidor" });
    }
});

//POST
//Añade nuevos productos
router.post('/newMoto',async (req,res)=>{
    try 
    {
        //lee el json
        await cargarProductos();        
        const {marca,descripcion,precio,stock,img,imagenes} = req.body;
        if(!marca||!descripcion||!precio||!stock||!img||!imagenes)
        {
            return res.status(401).json("Faltan completar campos");
        }
        else
        {
            //Crea el producto
            const newMoto={
                id_producto:getUltId(),
                marca:marca,
                descripcion:descripcion,
                precio:precio,
                stock:stock,
                img:img,
                imagenes:imagenes
            }
            //Añade a la lista
            await agregarProducto(newMoto);            
            res.status(201).json(newMoto);
        }
    } 
    catch (error) 
    {
        res.status(500).json({ error: "Error del servidor" });
    }
});
//PUT
//Actualiza los datos de una moto
router.put('/updateMoto',async (req,res)=>{
    try 
    {
        //lee el json
        await cargarProductos();        
        const {id,marca,descripcion,precio,stock,img,imagenes} = req.body;
        if(!id||!marca||!descripcion||!precio||!stock||!img||!imagenes)
        {
            return res.status(401).json("Faltan completar campos");
        }
        else
        {
            //Busca si existe el producto
            const moto= getProdByid(id);
            if (!moto) {
                return res.status(404).json("Moto no encontrada");
            }   
            if(moto)
            {
                //Actualiza el producto                             
                moto.marca=marca
                moto.descripcion=descripcion
                moto.precio=precio
                moto.stock=stock
                moto.img=img
                moto.imagenes=imagenes
                await actualizarProducto(moto)                
                res.status(200).json("Producto actualizado correctamente")                        
            }            
        }
    } 
    catch (error) 
    {
        console.error("Error en updateMoto:", error);
        res.status(500).json({ error: error.message || "Error del servidor" });
    }
});
//Actualiza precio por marca,id o todos
//Aumentar o bajar precios por porcentaje (EJ:10, -5)
router.put('/updatePrecio',async(req,res)=>{
    try
    {
        //lee el json
        await cargarProductos();
        let  productos=getProductos(); 
        const {id,marca,porcentaje}= req.body;
        //Valida que se ingrese un numero
        if (typeof porcentaje !== 'number') {
            return res.status(400).json("Porcentaje inválido");
        }
        let precioNuevo
        //Actualiza por id
        if(id)
        {
            const moto= productos.find(m=>m.id_producto==id);
            if(!moto)
            {
                return res.status(404).json("Moto no encontrada");
            }
            else
            {              
                precioNuevo = Math.round((moto.precio + (moto.precio * (porcentaje / 100))) * 100) / 100;   
                if (precioNuevo <= 0) {
                    return res.status(400).json("No se permite precio negativo");
                }                             
                moto.precio=precioNuevo
                await actualizarProducto(moto)
                res.status(200).json("Precio actualizado correctamente");
            }
            
        }
        //Actualiza por marca
        else if(marca)
        {
            const motos= productos.filter(m=>m.marca==marca);
            if(!motos)
            {
                return res.status(404).json("Marca no encontrada");
            }
            else
            {
                
                //verificar que el precio no sea negativo
                const preciosInvalidos = motos.some(bike => {                    
                    precioNuevo = Math.round((bike.precio + (bike.precio * (porcentaje / 100))) * 100) / 100;
                    return precioNuevo <= 0;
                });
                if (preciosInvalidos) {
                    return res.status(400).json("No se permite precio negativo");
                }
                motos.forEach(bike => {                    
                    precioNuevo = Math.round((bike.precio + (bike.precio * (porcentaje / 100))) * 100) / 100;                    
                    bike.precio=precioNuevo;
                });
                await actualizaProductos(productos);
                res.status(200).json("Precios actualizados correctamente"); 
            }
        }
        //Actualiza todos
        else
        {
            //verificar que el precio no sea negativo
            const preciosInvalidos = productos.some(bike => {            
            precioNuevo = Math.round((bike.precio + (bike.precio * (porcentaje / 100))) * 100) / 100;
            return precioNuevo <= 0;
            });
            if (preciosInvalidos) {
                return res.status(400).json("No se permite precio negativo");
            }
            productos.forEach(bike => {                  
                precioNuevo = Math.round((bike.precio + (bike.precio * (porcentaje / 100))) * 100) / 100;                                                  
                bike.precio=precioNuevo;
            });
            await actualizaProductos(productos);
            res.status(200).json("Precios actualizados correctamente");
        }       
        
    } 
    catch (error) 
    {
        res.status(500).json({ error: "Error del servidor" });
    }
});

//DELETE

router.delete('/deleteMoto',async (req,res)=>{
    try 
    {
        
    } 
    catch (error) 
    {
        res.status(500).json({ error: "Error del servidor" });
    }
});
export default router