
//importação
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//execução do express em uma variavel 

const app = express()

//config Json resposta 

app.use(express.json())


//models 

const User = require('../../models/User')

//abrindo uma Rota
app.get('/', (req, res) => {
    res.status(200).json({ msg: 'Bem vindo a nossa API!'})
})

//Registro de Usuario 
app.post('/auth/register', async(req, res) => {

    const {name, email, password, confirmpassword} = req.body

    //validação 

    if(!name) {
        return res.status(422).json({msg: "O nome é Obrigatório!"}) 
    }

    if(!email) {
        return res.status(422).json({msg: "O email é Obrigatório!"}) 
    }

    if(!password) {
        return res.status(422).json({msg: "A senha é Obrigatória!"}) 
    }

    if(password !== confirmpassword) {
        return res.status(422).json({msg: "As senhas não conferem!"}) 
    }
    
    //Check de Usuario existente 

    const userExstis = await User.findOne({email: email}) 
    if(userExstis) {
        return res.status(422).json({msg: "Porfavor, utilize outro e-mail!"}) 
    }

    //criando a senha de Usuário 

    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    //criando Usuário

    const user = new User({
        name,
        email,
        password: passwordHash,
    })

    try {
        await user.save()

        res.status(201).json({msg: 'Usuário criado com sucesso'})
    }catch(error) {

        console.log(error)
        res.status(500).json({msg: 'Aconteceu um erro no servidor, Tente novamente mais tarde!'})

    }
})  

//Login de usuário 

app.post("/auth/login", async (req, res) => {

    const {email, password} = req.body

    //validação

    if(!email) {
        return res.status(422).json({msg: "O email é Obrigatório!"}) 
    }

    if(!password) {
        return res.status(422).json({msg: "A senha é Obrigatória!"}) 
    }

    //check se o Usuário existe 

    const user = await User.findOne({email: email}) 
    if(!user) {
        return res.status(404).json({msg: "Usuário não encontrado"}) 
    }

    //check para ver se a senha existe 

    const checkpassword = await bcrypt.compare(password, user.password)

    if(!checkpassword){
        return res.status(422).json({msg: "Senha inválida"}) 
    }

    try {
        
        const secret = process.env.SECRET

        const token = jwt.sign(
        {
            id: user._id,
        },
        secret,
    )

    res.status(200).json({mgs: "Autenticação realizada com sucesso", token})

    } catch(err) {
        console.log(err)
        res.status(500).json({msg: 'Aconteceu um erro no servidor, Tente novamente mais tarde!'})
    }

})

//credenciais 
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

mongoose.
    connect(
        `mongodb+srv://${dbUser}:${dbPassword}@cluster0.4uduz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
        .then(() => {
        app.listen(3000)
        console.log("Conectou ao Banco!")
    })
    .catch((err) => console.log(err))



