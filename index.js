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



// "/"
app.get("/", (req, res) => {
    res.send(`Selamat datang di Express`)
})

//CREATE
//  "/product/new-product" POST `new-produdct`
app.post("/product/new_product", (req, res) => {
    let obj
    const {
        product_name,
        category_id,
        product_desc,
        product_img
    } = req.body
    const insert_product = {
        product_name: product_name,
        category_id: category_id,
        product_desc: product_desc,
        product_img: product_img
    }
    const {
        size_id,
        color_id,
        condition_id,
        qty,
        price
    } = req.body
    const main_product = {
        size_id: size_id,
        color_id: color_id,
        condition_id: condition_id,
        qty: qty,
        price: price
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
            product_id: result,
            ...main_product
        }
        const insert_main = new Promise((resolve, reject) => {
            const queryStr = "INSERT INTO main_product SET ?"
            db.query(queryStr, mainFile, (err, data) => {
                if (!err) {
                    resolve(obj = {
                        msg : `Sukses`,
                        ...mainFile
                    })
                } else {
                    reject(`Gagal!`)
                }
            })
        })
        insert_main.then((result2) => {
            res.json(result2)
        }).catch((error) => {
            res.json(error)
        })
    }).catch((err) => {
        res.json(err)
    })
})

//POST `existing-product`
app.post("/product/existing-product", (req, res) => {
    let obj;
    const mainFile = req.body
    const insertMain = new Promise ((resolve, reject) => {
        const queryStr = "INSERT INTO main_product SET ?"
        db.query(queryStr, mainFile, (err, data) => {
            if(!err){
                resolve(obj = {
                    msg : `data berhasil dimasukan`,
                    ...mainFile
                })
            }else{
                reject(err)
            }
        })
    })
    insertMain.then((result) => {
        res.json(result)
    }).catch((error) => {
        res.json(error)
    })
})



//READ
//search By Name / Cat / Name & Cat
app.get("/products/search", (req, res) => {
    let params,msg
    const searchName = new Promise((resolve, reject) => {
        let queryStr =
            `SELECT m.id, p.product_name,c.id, c.category_name, pc.color_name, ps.size_name, pco.condition_name, p.product_desc, p.product_img, m.qty, m.price, m.created_at, m.updated_at 
            FROM main_product m 
            JOIN product p ON m.product_id = p.id 
            JOIN product_category c ON p.category_id = c.id 
            JOIN product_color pc ON m.color_id = pc.id 
            JOIN product_size ps ON m.size_id = ps.id 
            JOIN product_condition pco ON m.condition_id = pco.id 
            WHERE `
        if(req.query){
            if (req.query.name != null && req.query.category != null) {
                queryStr += "p.product_name LIKE ? AND c.id = ?"
                params = [`%${req.query.name}%`, req.query.category]
            }else if (req.query.name != null) {
                queryStr += "p.product_name LIKE ?"
                params = `%${req.query.name}%`
            }else if(req.query.category != null) {
                queryStr += "c.id = ?"
                params = req.query.category
            }
        }else{
            reject(msg = {
                msg: `data tidak ditemukan`
            })
        }
        db.query(queryStr, params, (err, data) => {
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

// Sort by Name / Price / Date
app.get("/products", (req, res) => {
    const getAllProducts = new Promise ((resolve, reject) => {
        let SQL_query = 
        `SELECT m.id, p.id , p.product_name, c.category_name, pc.color_name, ps.size_name, pco.condition_name, p.product_desc, p.product_img, m.qty, m.price, m.created_at, m.updated_at 
        FROM main_product m 
        JOIN product p ON m.product_id = p.id  
        JOIN product_category c ON p.category_id = c.id  
        JOIN product_color pc ON m.color_id = pc.id  
        JOIN product_size ps ON m.size_id = ps.id 
        JOIN product_condition pco ON m.condition_id = pco.id`
        if(req.query.name != null){
            SQL_query += " ORDER BY p.product_name"
            if(req.query.name == 'desc'){
                SQL_query+=" DESC"
            }
        }else if(req.query.price != null){
            SQL_query+= " ORDER BY m.price"
            if(req.query.price == 'desc'){    
                SQL_query += " DESC"
            }
        }else if(req.query.date){
            SQL_query += " ORDER BY m.updated_at"
            if(req.query.date == 'desc'){
                 SQL_query += " DESC"
            }
        }
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
        res.json(err)
    })
}) 

//GET product By ID
app.get("/product", (req, res) => {
    const { id } = req.query
    const getProd = new Promise ((resolve, reject) => {
        const queryStr = 
        `SELECT * FROM product WHERE id = ?`
        db.query(queryStr, id, (err, data) => {
            if(!err){
                resolve(data)
            }else{
                reject(err)
            }
        })
    })
    getProd.then((result) => {
        res.json(result)
    }).catch((error) => {
        res.json(error)
    })
})





//UPDATE
//update
app.patch("/product/update", (req, res) => {
    const {
        id
    } = req.body
    const {
        body
    } = req
    const updatePatch = {
        ...body,
        updated_at: new Date(Date.now())
    }
    const update = new Promise((resolve, reject) => {
        const queryStr = "UPDATE main_product SET ? WHERE id = ?"
        db.query(queryStr, [updatePatch, id], (err, data) => {
            if (!err) {
                resolve(updatePatch)
            } else {
                reject(err)
            }
        })
    })
    update.then((result) => {
        const output = {
            msg: `Data updated at id ${id}`,
            ...result,
        }
        res.json(output)
    }).catch((error) => {
        res.json(error)
    })

})


//DELETE 
// `product/delete` DELETE `from product`
app.delete("/product/delete", (req, res) => {
    const {
        id
    } = req.query
    const deleteData = new Promise((resolve, reject) => {
        const queryStr = "DELETE FROM main_product WHERE id = ?"
        db.query(queryStr, id, (err, data) => {
            if (!err) {
                resolve(`Data berhasil dihapus pada id = ${id}`)
            } else {
                reject(`ID tidak ditemukan`)
            }
        })
    })
    deleteData.then((result) => {
        const output = {
            deletedId: id,
            msg: result
        }
        res.json(output)
    }).catch((error) => {
        res.json(error)
    })
})

//TRANSAKSI
//CREATE NEW TRANSACTION
app.post("/transaction/add", (req, res) => {
    let obj
    const trxFile = req.body
    const addTrx = new Promise ((resolve, reject) => {
        const queryStr = "INSERT INTO trans_history SET ?"
        db.query(queryStr, trxFile, (err, data) => {
            if(!err){
                resolve(
                    obj = {
                        msg : `Transaksi berhasil dilakukan`,
                        ...trxFile
                    }
                )
            }else{
                reject(err)
            }
        })
    })
    addTrx.then((result) => {
        res.json(result)
    }).catch((error) => {
        res.json(error)
    })
})

//READ
app.get("/transaction/history", (req, res) => {
    const TransHistory = new Promise ((resolve, reject) => {
        const queryStr = 
        `SELECT th.id AS 'Transaksi ID', CONCAT(u.firstname,' ',u.lastname) AS 'User', p.product_name  AS 'Nama Produk', c.category_name as 'Kategori' , pc.color_name as 'Warna', ps.size_name AS 'Ukuran', pco.condition_name AS 'Kondisi', th.qty AS 'Jumlah pembelian', m.price AS 'Satuan', (th.qty * m.price) AS 'Total Harga', th.created_at AS 'Waktu Transaksi'        
        FROM trans_history th        
        JOIN user u ON th.user_id = u.id        
        JOIN main_product m ON th.product = m.id        
        JOIN product p ON m.product_id = p.id         
        JOIN product_category c ON p.category_id = c.id         
        JOIN product_color pc ON m.color_id = pc.id         
        JOIN product_size ps ON m.size_id = ps.id         
        JOIN product_condition pco ON m.condition_id = pco.id        
        ORDER BY th.created_at DESC`
        db.query(queryStr, (err, data) => {
            if(!err){
                resolve(data)
            }else{
                reject(err)
            }
        })
    })
    TransHistory.then((result) => {
        res.json(result)
    }).catch((error) => {
        res.json(error)
    })
})

//RATING
//CREATE RATING
app.post("/rating/add", (req, res) => {
    let obj
    const ratingFile = req.body
    const newRating = new Promise ((resolve, reject) => {
        const queryStr = "INSERT INTO rating_review SET ?"
        db.query(queryStr, ratingFile, (err, data) => {
            if(!err){
                resolve(`Rating berhasil diberikan`)
            }else{
                reject(`gagal!`)
            }
        })
    })
    newRating.then((result) => {
        obj = {
            msg : result
        }
        res.json(obj)
    }).catch((error) => {
        obj = {
            msg : error
        }
        res.json(obj)
    })
})

//READ RATING
app.get("/rating", (req, res) => {
    const viewRating = new Promise ((resolve, reject) => {
        const queryStr = 
        `SELECT concat(u.firstname,' ',u.lastname) AS "Nama" , p.product_name AS "Nama Produk", r.rating AS "Rating", r.review AS "Review", r.created_at AS "Waktu"
        FROM rating_review r
        JOIN user u ON r.user_id = u.id 
        join product p ON r.product_id = p.id
        ORDER BY r.created_at DESC`
        db.query(queryStr, (err, data) => {
            if(!err){
                resolve(data)
            }else{
                reject(err)
            }
        })
    })
    viewRating.then((result) => {
        res.json(result)
    }).catch((error) => {
        res.json(error)
    })
})


//test
