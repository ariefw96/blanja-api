const express = require('express') //import pkg
const mySQL = require('mysql')
const logger = require('morgan')


const port = 8000 //initial port

//initialize express
const app = express()


//use logger
app.use(logger("dev"));

// Menambahkan bodyparser untuk x-www-form-urlencoded
app.use(express.urlencoded({
    extended: false
}));

// menambahkan parser untuk raw json
app.use(express.json());

//Listen Port
app.listen(port, () => {
    console.log(`Server is running at ${port}`)
}) //menyalakan server local:port

//Connect to DB
const db = mySQL.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "blanja.in"
})

db.connect(function (err) {
    if (err) throw err;
    console.log("Connected!")
})



// endpoint "/"
app.get("/", (req, res) => {
    res.send(`Selamat datang di Express`)
})

//endpoint "/products"
app.get("/products", (req, res) => {
    const getAllProducts = new Promise((resolve, reject) => { //getData
        const SQL_query = "SELECT m.id, p.id , p.product_name, c.category_name, pc.color_name, ps.size_name, pco.condition_name, p.product_desc, p.product_img, m.qty, m.price, m.created_at, m.updated_at FROM main_product m JOIN product p ON m.product_id = p.id  JOIN product_category c ON p.category_id = c.id  JOIN product_color pc ON m.color_id = pc.id  JOIN product_size ps ON m.size_id = ps.id JOIN product_condition pco ON m.condition_id = pco.id"
        db.query(SQL_query, (err, data) => {
            if (!err) {
                resolve(data)
            } else {
                reject(err)
            }
        })
    })
    getAllProducts.then((data) => {
        res.json(data)
    }).catch((err) => {
        res.json('cant find products')
    })
})

// "/products" POST
app.post("/products", (req, res) => {
    const { product_name, category_id, product_desc, product_img } = req.body
    const insert_product = {
        product_name : product_name,
        category_id : category_id,
        product_desc : product_desc,
        product_img : product_img
    }
    const { size_id , color_id, condition_id, qty, price } = req.body
    const main_product = {
        size_id : size_id,
        color_id : color_id,
        condition_id : condition_id,
        qty : qty,
        price : price
    }
    const insertProduct = new Promise((resolve, reject) => {
        const queryStr = "INSERT INTO product SET ?"
        db.query(queryStr, insert_product, (err, data) => {
            if (!err) {
                resolve(data.insertId)
            } else {
                reject(err)
            }
        })

    })
    insertProduct.then((result) => {
        const mainFile = {
            product_id : result,
            ...main_product
        }
        const insert_main = new Promise((resolve, reject) => {
            const queryStr = "INSERT INTO main_product SET ?"
            db.query(queryStr, mainFile, (err, data) => {
                if(!err){
                    resolve(mainFile)
                }else{
                    reject(`Gagal!`)
                }
            })
        }).then((rslt)=>{
            res.json(rslt)
        }).catch((error) => {
            res.json(error)
        })
    }).catch((err) => {
        res.json(err)
    })
})

//search By Name
app.get("/products/searchname", (req, res) => {
    const keyword = `%${req.query.product_name}%`
    const searchName = new Promise((resolve, reject) => {
        const queryStr =
            "SELECT m.id, p.product_name, c.category_name, pc.color_name, ps.size_name, pco.condition_name, p.product_desc, p.product_img, m.qty, m.price, m.created_at, m.updated_at FROM main_product m JOIN product p ON m.product_id = p.id JOIN product_category c ON p.category_id = c.id JOIN product_color pc ON m.color_id = pc.id JOIN product_size ps ON m.size_id = ps.id JOIN product_condition pco ON m.condition_id = pco.id WHERE p.product_name LIKE ?"
        db.query(queryStr, keyword, (err, data) => {
            if (!err) {
                resolve(data)
            } else {
                reject(err)
            }
        })
    })
    searchName.then((result) => {
        res.json(result)
    }).catch((err) => {
        res.json(err)
    })

})

//search By Category
app.get("/products/category", (req, res) => {
    const category = `%${req.query.id}%`
    console.log(category)
    const searchByCategory = new Promise((resolve, reject) => {
        const querystr =
            "SELECT m.id, p.product_name, c.id as 'category_id', c.category_name, pc.color_name, ps.size_name, pco.condition_name, p.product_desc, p.product_img, m.qty, m.price, m.created_at, m.updated_at FROM main_product m JOIN product p ON m.product_id = p.id JOIN product_category c ON p.category_id = c.id JOIN product_color pc ON m.color_id = pc.id JOIN product_size ps ON m.size_id = ps.id JOIN product_condition pco ON m.condition_id = pco.id WHERE category_id LIKE ?"
        db.query(querystr, category, (err, data) => {
            if (!err) {
                resolve(data)
            } else {
                reject(err)
            }
        })
    })
    searchByCategory.then((result) => {
        res.json(result)
    }).catch((err) => {
        res.json(err)
    })
})

//searchBy Category And Name
app.get("/products/search", (req, res) => {
    const category = `%${req.query.category}%`
    const product_name = `%${req.query.product_name}%`
    const search = new Promise ((resolve, reject) => {
        const queryStr =
        "SELECT m.id, c.id, p.product_name, c.category_name, pc.color_name, ps.size_name, pco.condition_name, p.product_desc, p.product_img, m.qty, m.price, m.created_at, m.updated_at FROM main_product m JOIN product p ON m.product_id = p.id JOIN product_category c ON p.category_id = c.id JOIN product_color pc ON m.color_id = pc.id JOIN product_size ps ON m.size_id = ps.id JOIN product_condition pco ON m.condition_id = pco.id WHERE c.category_name LIKE ? AND p.product_name LIKE ?"
        db.query(queryStr, [category, product_name ], (err, data) => {
            if(!err){
                resolve(data)
            }else{
                reject(err)
            }
        })
    })
    search.then((result)=>{
        res.json(result)
    }).catch((error)=>{
        res.json(error)
    })
})

//update
app.patch("/products/update", (req, res)=> {
    const { id } = req.body
    const { body } = req
    const updatePatch = {
        ...body,
        updated_at : new Date(Date.now())
    }
    const update = new Promise ((resolve,reject) => {
        const queryStr = "UPDATE main_product SET ? WHERE id = ?"
        db.query(queryStr, [updatePatch, id], (err, data) => {
            if(!err){
                resolve(data)
            }else{
                reject(err)
            }
        })
    })
    update.then((result)=>{
        const output = {
            msg : `Data updated at id ${id}`,
            ...updatePatch,
        }
        res.json(output)
    }).catch((error)=>{
        res.json(error)
    })
        
})


//delete 
app.delete("/products/delete", (req, res)=>{
    const { id } = req.query
    const deleteData = new Promise ((resolve, reject) =>{
        const queryStr = "DELETE FROM main_product WHERE id = ?"
        db.query(queryStr, id, (err, data) => {
            if(!err){
                resolve(`Data berhasil dihapus pada id = ${id}`)
            }else{
                reject(`ID tidak ditemukan`)
            }
        })
    })
    deleteData.then((result) => {
        const output = {
            deletedId : id,
            msg : result
        }
        res.json(output)
    }).catch((error) => {
        res.json(error)
    })
})



//updateName
app.patch("/products/updatePatch", (req, res) => {
    const id = `%${req.body.id}%`
    const update = req.body
})