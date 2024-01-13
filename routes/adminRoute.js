var express  = require('express')
var adminRouter = express.Router();
const adminController = require('../controllers/adminController')
const categoryController = require('../controllers/categoryController')
const productController = require('../controllers/productController')
const adminAuth = require('../middlewares/adminAuth')


const path = require('path')
const multer = require('multer')

const  storage = multer.diskStorage({
    destination:(req,file,cb) => {
        cb(null,path.join(__dirname,'..','public','webImages'))
    },
    filename:(req,file,cb) => {
        const name= Date.now()+'-'+file.originalname;
        cb(null,name)
    }
})
const upload = multer({storage:storage})



//-------------------------LOGIN------------------------------
adminRouter.get('/',adminAuth.isLogout,adminController.adminLogin)
adminRouter.post('/',adminController.adminLoginVerify)


//---------------------------LOGOUT--------------------------------

adminRouter.get('/logout',adminAuth.isLogin,adminController.adminLogout)

//------------------------DASHBOARD---------------------------
adminRouter.get('/dashboard',adminAuth.isLogin,adminController.adminDashboard)

//-------------------------LIST USERS-------------------------------
adminRouter.get('/users',adminAuth.isLogin,adminController.userManagement)

//------------BLOCK USER-------------------------
adminRouter.get('/blockUser',adminController.blockUser)

//----------------------CATEGORY-------------------------
adminRouter.get('/category',adminAuth.isLogin,categoryController.loadCategory)

//---------------------------ADD NEW CATEGORY-------------------------------
adminRouter.get('/addCategories',adminAuth.isLogin,categoryController.loadAddCategory)
adminRouter.post('/addCategories',categoryController.addCategories)

//--------------------------------EDIT CATEGORY-----------------------------
adminRouter.get('/editCategories',adminAuth.isLogin,categoryController.loadEditCategories)  
adminRouter.post('/editCategories',categoryController.editCategories)

//-------------------------------DELETE CATEGORY---------------------------------
adminRouter.delete('/category/deleteCategory/:categoryId',categoryController.deleteCategories)

//-------------------------------LIST/ UNLIST CATEGORIES--------------------------------
adminRouter.get('/listCategories',categoryController.listCategory)

//----------------------------------PRODUCTS----------------------------------------
adminRouter.get('/products',adminAuth.isLogin,productController.loadProducts)

adminRouter.get('/addProducts',adminAuth.isLogin,productController.loadAddProducts)
adminRouter.post('/addProducts',upload.array('image'),productController.addProducts)

adminRouter.get('/editProducts',adminAuth.isLogin,productController.loadEditProducts)

adminRouter.post('/editProducts',upload.array('image'),productController.editProducts)

adminRouter.put('/products/deleteImage',productController.deleteImage)  

adminRouter.get('/listProducts',productController.listProducts)




module.exports = adminRouter  