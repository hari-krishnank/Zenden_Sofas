const Category = require('../models/categoryModel')  


const loadCategory = async(req,res) =>{
    try {
        const categories = await Category.find();

        res.render('admin/category',{categories})
    } catch (error) {
        console.log(error.message);        
    }
}

//--------------------------------------ADD CATEGORY---------------------------------

const loadAddCategory = async (req,res) =>{
    try {
        res.render('admin/addCategories')
    } catch (error) {
        console.log(error.message);
    }
}


const addCategories = async(req,res) => {
    try {
        const categoryName = req.body.cName
        const categoryDescription = req.body.cDescription
        const categoriesExist = await Category.findOne({ name: {$regex:new RegExp(`^${categoryName}$`,'i')}});

        if(categoriesExist){
            res.render('admin/addCategories',{message:'Category already exists',categoryName,categoryDescription})
        } else {
            
            const newCategory = new Category({name: categoryName, description:categoryDescription }); 
            await newCategory.save();
    
            res.redirect('/admin/category')
        }
    } catch (error) {
        console.log(error.message);
    }
}

//-----------------------------------------------EDIT CTEGORIES-------------------------------------------------------------------

const loadEditCategories = async(req,res) => {
    try {
        const categoryId = req.query.categoryId
        const category = await Category.findOne({_id:categoryId})
        // console.log('cat:',category);
        res.render('admin/editCategories', {category} )
    } catch (error) {
        console.log(error.message);
    }
}

const editCategories = async(req,res) =>{
    try {
        const {categoryId, cName, cDescription} = req.body;
        // console.log(req.body);

        const categoriesExist = await Category.findOne({
            name: {$regex: new RegExp(`^${cName}$`,'i')},
            _id:{ $ne: categoryId },
        })

        if(categoriesExist){
            res.render('admin/editCategories', {
                category: { _id: categoryId, name: cName, description: cDescription },
                message: 'Category already exists',
            });
        } else {
            
            await Category.findByIdAndUpdate(categoryId,{
                name: cName,
                description: cDescription,
            });
            res.redirect('/admin/category') 
        }
    } catch (error) {
        console.log(error.message);
    }
}


//-----------------------------------------------DELETE CATEGORIES-------------------------------------------------------------

const deleteCategories = async(req,res) => {
    try {
        
        const categoryId = req.params.categoryId
        const category = await Category.findByIdAndDelete({_id:categoryId})
        // console.log('caaat:',category);
        if(category){
            res.redirect('/admin/category')
        } else {
            console.log('Category not found');
            res.status(404).send('Category not found');
        }
        
    } catch (error) {
        console.log(error.message);
    }   
}


//------------------------------------------------LIST / UNLIST CATEGORIES--------------------------------------------------------


const listCategory = async(req,res) =>{
    try {
         const { id } = req.query;
         const category = await Category.findById({_id:id});
         if( category.is_listed===0){
            await Category.findByIdAndUpdate({_id:id}, {$set: {is_listed:1 }})
            
         } else {
            await Category.findByIdAndUpdate({_id:id},{ $set: { is_listed:0 }})
            
         }

         res.redirect('/admin/category')
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadCategory,
    loadAddCategory,
    addCategories,
    loadEditCategories,
    editCategories,
    listCategory,
    deleteCategories
}