## About project

this project is a simple implementation of RESTful API using *framework* ExpressJS and mySQL *database* made for for [Blanja](blanja-arief-project.netlify.app) website

## Requirements

- npm [Node.js](https://nodejs.org/en/download/)
* ExpressJS

```
 npm install express
```

- mySQL

```
 npm install mysql
```

- morgan

```
npm install morgan
```



## Getting started

### Installation

1. Clone repository
   
   ```
   https://github.com/ariefw96/blanja-api
   ```

2.  Install additional package
   
   * npm
   
   ```
   npm install
   ```
   
   * yarn
   
   ```
   yarn add
   ```

3. Config database, you can set the configuration according to config folder
   
   ```
   const db = mysql.createConnection({
     host: 'localhost',
     user: 'root',
     password: '',
     database: 'blanja.in'
   });
   ```

### Endpoint scheme

- get all product

```js
GET
/api/products
```

- get product by ID

```js
GET
/api/product?id=id
```

- add new product

```js
POST
/api/product/new_product
```
- add stock from existing product

```js
POST
/api/product/existing-product
```

- search Product by name, category

```js
GET
api/products/search?name=x&category=y
```

- sort product by name, date, and price

```js
GET
api/products?price=desc 
api/products?name=asc 
api/products?date=desc 
```


- update product

```js
PATCH
/api/product/update
```

- delete product

```js
DELETE
/api/product/delete?id=id
```

Dokumentasi POSTMAN https://documenter.getpostman.com/view/13530339/TVewY4R3
