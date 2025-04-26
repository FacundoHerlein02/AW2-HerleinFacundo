import { Router } from 'express';
import { readFile, writeFile } from 'fs/promises';
import {getUltId} from '../utils/utilsUsuarios.js';
import bcrypt from 'bcrypt';
const usersJson = await readFile('./JSON/usuarios.json', 'utf-8');
const users= JSON.parse(usersJson);
const router= Router();

// /usuarios
// GET
//Obtiene todos los usuarios
router.get('/allUsers',(req,res)=>{    
    try
    {
        const result= users.map(e=>{
            return{
                Id: e.id_cliente,
                Nombre: e.Nombre,
                Apellido: e.Apellido,
                Usuario:e.Usuario           
            }
        })
        if(result && result.length>0)
        {
            res.status(200).json(result);
        }
        else
        {
            res.status(404).json(`No se encontraron usuarios.`);
        }
    }
    catch(error)
    {
        res.status(500).json({ error: "Error del servidor" });
    }
});
//Obtiene usuarios por id
router.get('/userById/:id',(req,res)=>{
    const id= req.params.id
    const result= users.find(e=>e.id_cliente==id);    
    try
    {
        if(result)
        {
            res.status(200).json(result);
        }
        else
        {
            res.status(404).json(`${id} no encontrado`);
        }
    }
    catch(error)
    {
        res.status(500).json({ error: "Error del servidor" });
    }
});

//POST

//Crea Usuarios
router.post('/newUser',async(req,res)=>{
    try
    {
        const id = getUltId();
        //Obtiene los datos del body
        const nombre=req.body.nombre
        const apellido=req.body.apellido  
        const usuario=req.body.usuario
        const contraseña=req.body.clave
        if(!nombre || !apellido || !usuario || !contraseña)
        {
            res.status(404).json({ error: "Faltan datos obligatorios" });
        }
        else
        {
            // Valida si el usuario ya existe
            const existeUsuario = users.find(u => u.Usuario === usuario);
            if (existeUsuario) {
                return res.status(409).json({ error: "El nombre de usuario ya está en uso"
            });
        }
            // Encriptar la contraseña antes de guardarla
            const hashedPassword = await bcrypt.hash(contraseña, 10);
            //Crea el nuevo usuario
            const newUser = {
                id_cliente: id,
                Nombre: nombre,
                Apellido: apellido,
                Usuario: usuario,
                Contraseña: hashedPassword //Guarda la clave encriptada
            };
            // Agregar a la lista
            users.push(newUser);
            // Guardar de nuevo en archivo JSON
            await writeFile('./JSON/usuarios.json', JSON.stringify(users, null, 2));
            // Responder con el nuevo usuario
            res.status(201).json(newUser);
        }        
    }
    catch(error)
    {
        res.status(500).json({error: "Error del servidor"});
    }
});
//Loguin
router.post('/login',async (req,res)=>{
    try{
        const {usuario,clave} = req.body;
        if(!usuario || !clave)
        {
            res.status(404).json("Faltan completar campos");
        }
        const user = users.find(u => u.Usuario === usuario);
        if (!user) {
            return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
        }
        // Compara la contraseña que mandó el usuario con la encriptada
        const match = await bcrypt.compare(clave, user.Contraseña);
        if(match)
        {
            res.status(200).json({ Mensaje: "Login exitoso", user });
        }
        else
        {
            res.status(401).json({ error: "Usuario o contraseña incorrectos" });
        }

    }
    catch(error)
    {
        res.status(500).json({error:"Error del servidor."});
    }
});
//PUT

//Cambio de clave
router.put('/updateClave',async(req,res)=>{
    try
    {
        const paramUsuario= req.body.usuario;
        const claveVieja= req.body.claveOld;
        const claveNueva= req.body.claveNew;        
        
        if(!paramUsuario || !claveVieja || !claveNueva)
        {
            return res.status(404).json("Faltan completar campos");
        }
        //Busca si existe el nombre de usuario
        const user=users.find(e=> e.Usuario == paramUsuario);
        if (!user) {
            return res.status(404).json("Usuario no encontrado");
        }        
        if(user)
        {
            //Compara la contraseña vieja
            const match= await bcrypt.compare(claveVieja, user.Contraseña)
            if(!match)
            {
                return res.status(401).json("Contraseña anterior incorrecta");                
            }
            const index = users.findIndex(e => e.Usuario == paramUsuario);
            // Encripta la clave
            const hashedPassword = await bcrypt.hash(claveNueva, 10);
            users[index].Contraseña=hashedPassword
            await writeFile('./JSON/usuarios.json',JSON.stringify(users,null,2))
            res.status(200).json("Clave actualizaca correctamente") 
        }       
    }
    catch(error)
    {
        res.status(500).json({error:"Error del servidor"});
    }
});
//Actualizar usuario
router.put('/updateUser',async (req,res)=>{
    try
    {
        const {nombre,apellido,usuario,usuarioNew} = req.body;        
        if(!nombre ||!apellido ||!usuario ||!usuarioNew)
        {
            return res.status(401).json("Faltan completar campos");
        }
        const user= users.find(u=>u.Usuario== usuario);
        if(user)
        {
            const index= users.findIndex(u => u.Usuario==usuario)
            users[index].Nombre=nombre
            users[index].Apellido=apellido
            users[index].Usuario=usuarioNew
            await writeFile('./JSON/usuarios.json',JSON.stringify(users,null,2))
            res.status(200).json("Usuario actualizado correctamente");            
        }
        else
        {
            return res.status(404).json("Usuario no encontrado");
        }
    }
    catch(error)
    {
        res.status(500).json({error:"Error del servidor."});
    }
});
//DELETE
//Elimina un usuario
router.delete('',(req,res)=>{
    try
    {
        
    }
    catch(error)
    {

    }
});

export default router

