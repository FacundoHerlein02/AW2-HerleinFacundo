import  { Router } from 'express';
import { readFile, writeFile} from 'fs/promises';
const ventasJson = await readFile('./JSON/ventas.json', 'utf-8');
const ventas= JSON.parse(ventasJson);
const router= Router();

// /ventas
router.get('/hola', (req,res)=>{
    res.status(200).json("Hola");
})
//Muestra detalle de venta y todos los datos
/*const get_detalleVenta=(id) =>{
    let venta= ventas.find(e => e.id_venta == id);    
    let filtro_producto= venta.productos.map(e =>
    { 
        let prod= productos.find(p=> p.id_producto == e.id_producto);
        return {
            marca: prod.marca,
            descripcion: prod.descripcion,
            cantidad: e.cantidad                         
        };
    });
    let total = venta.productos.reduce((sum, p) => sum + p.subtotal, 0);
    let cliente = usuarios.find(u => u.id_cliente == venta.id_cliente);
    let filtro_cliente = {
        nombre: cliente.Nombre, 
        apellido: cliente.Apellido 
    };
    return {
        fecha: venta.fecha,
        cliente: filtro_cliente,
        productos: filtro_producto,
        Total: total
    };   
}
console.log("DETALLE DE VENTAA")
console.log(get_detalleVenta(2))*/

export default router