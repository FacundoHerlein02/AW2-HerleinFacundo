import { Router } from 'express';
import {  readFile, writeFile } from 'fs/promises';
const prodJson = await readFile('./JSON/productos.json', 'utf-8');
const productos= JSON.parse(prodJson);
const router= Router();

// /productos

// GET
//Obtiene todos los productos
router.get('/allProductos',(req,res)=>{    
    try
    {
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
router.get('/motosMarca/:marca',(req,res)=>{
    try
    {
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
router.get('/filtroPrecio/:min/:max',(req,res)=>{
    try 
    {
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
router.post('newMoto',async (req,res)=>{
    try 
    {
        
    } 
    catch (error) 
    {
        res.status(500).json({ error: "Error del servidor" });
    }
});

//PUT

//Actualiza los datos de una moto
router.put('updateMoto',async (req,res)=>{
    try 
    {
        
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