const Order = require('../models/orderModel')
const User = require('../models/userModel')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const moment = require('moment')


//------------------------------------DASHBOARD--------------------------------------------------

const adminDashboard = async (req, res) => {
    try {

        //___________________________UNWIND THE ORDERS________________________________
        const unwoundOrders = [
            {
                $unwind: "$items",
            },
            {
                $match: {
                    $and: [
                        { "items.ordered_status": "delivered" },
                        { status: { $ne: "pending" } },
                    ],
                },
            },
        ];



        //____________________TOTAL REVENUE________________________________________
        const totalSales = await Order.aggregate([
            {
                $match: {
                    "items.ordered_status": "delivered"
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$total_amount"
                    }

                }
            }

        ])
        const totalSale = totalSales.length != 0 ? totalSales[0].totalRevenue : 0




        //_____________________________TOTAL ORDERS_________________________________
        const ordersCount = await Order.aggregate([
            {
                $unwind: "$items"
            },
            {
                $match: {
                    "items.ordered_status": { $ne: "pending" }
                }
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    deliveredOrders: {
                        $sum: {
                            $cond: [
                                { $eq: ["$items.ordered_status", "delivered"] },
                                1, 0
                            ]
                        }
                    },
                    otherOrders: {
                        $sum: {
                            $cond: [
                                { $ne: ["$items.ordered_status", "delivered"] },
                                1, 0
                            ]
                        }
                    },
                    cancelOrders: {
                        $sum: {
                            $cond: [{
                                $or: [
                                    { $eq: ["$items.ordered_status", "cancelled"] },
                                    { $eq: ["$items.ordered_status", "returned"] }
                                ]
                            },
                                1, 0
                            ]
                        }
                    }
                }
            }

        ])
        const totalOrder = ordersCount.length != 0 ? ordersCount[0].totalOrders : 0
        const deliveredOrders = ordersCount.length != 0 ? ordersCount[0].deliveredOrders : 0
        const otherOrders = ordersCount.length != 0 ? ordersCount[0].otherOrders : 0
        const cancelOrders = ordersCount.length != 0 ? ordersCount[0].cancelOrders : 0



        //____________________________________TOTAL PRODUCTS/CATEGORY_____________________________

        const totalProducts = await Product.countDocuments({})
        const totalCategories = await Category.countDocuments({})



        //_________________________________THIS WEEK SALES________________________________________


        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);



        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);
        endOfWeek.setHours(23, 59, 59, 999);


        const dailyEarnings = await Order.aggregate([
            ...unwoundOrders,
            {
                $match: {
                    createdAt: {
                        $gte: startOfWeek,
                        $lt: endOfWeek,
                    },
                },
            },
            {
                $group: {
                    _id: { $week: "$createdAt" },
                    totalSales: {
                        $sum: { $multiply: ["$items.quantity", "$items.price"] },
                    },
                    count: { $sum: 1 },
                },
            },
        ])

        const DailyEarn = dailyEarnings.length != 0 ? dailyEarnings[0].totalSales : 0

        console.log("my orders count", ordersCount[0]);
        console.log("my revenue count", totalSales[0]);
        console.log("my weekly sales", dailyEarnings)




        //__________________________________THIS MONTH SALES_______________________________________

        const monthlyEarnings = await Order.aggregate([
            ...unwoundOrders,
            {
                $match: {
                    createdAt: {
                        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    totalSales: {
                        $sum: { $multiply: ["$items.quantity", "$items.price"] },
                    },
                    count: { $sum: 1 },
                },
            },
        ])

        const monthlyEarn = monthlyEarnings.length != 0 ? monthlyEarnings[0].totalSales : 0

        console.log("my orders count", ordersCount[0]);
        console.log("my revenue count", totalSales[0]);
        console.log("my monthly sales", monthlyEarnings)


        //________________________________THIS YEAR SALES_____________________________________

        const yearlyEarnings = await Order.aggregate([
            ...unwoundOrders,
            {
                $match: {
                    createdAt: {
                        $gte: new Date(new Date().getFullYear(), 0, 1),
                    },
                },
            },
            {
                $group: {
                    _id: { $year: "$createdAt" },
                    totalSales: {
                        $sum: { $multiply: ["$items.quantity", "$items.price"] },
                    },
                    count: { $sum: 1 },
                },
            },
        ])

        const yearlyEarn = yearlyEarnings.length != 0 ? yearlyEarnings[0].totalSales : 0

        console.log("my orders count", ordersCount[0]);
        console.log("my revenue count", totalSales[0]);
        console.log("my yearly sales", yearlyEarnings)



        //_________________________________________Chart Starting_______________________________________________________________________________________

        const currentYear = new Date().getFullYear();
        const yearsToInclude = 7;
        const currentMonth = new Date().getMonth() + 1;


        //____________________________________________________________________
        const defaultMonthlyValues = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            total: 0,
            count: 0,
        }));

        const defaultYearlyValues = Array.from(
            { length: yearsToInclude },
            (_, i) => ({
                year: currentYear - yearsToInclude + i + 1,
                total: 0,
                count: 0,
            })
        );
        //____________________________________________________________________



        //_____________________________________________________ Monthly sales data Graph________________________________________________________
        const monthlySalesData = await Order.aggregate([
            {
                $unwind: "$items",
            },
            {
                $match: {
                    "items.ordered_status": "delivered",
                    createdAt: { $gte: new Date(currentYear, currentMonth - 1, 1) },
                    status: { $ne: "cancelled" },
                },
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    total: {
                        $sum: { $multiply: ["$items.price", "$items.quantity"] },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id",
                    total: "$total",
                    count: "$count",
                },
            },
        ]);

        console.log('monthly Sales Data:', monthlySalesData)

        //________ Update monthly values based on retrieved data_______________________________
        const updatedMonthlyValues = defaultMonthlyValues.map((defaultMonth) => {
            const foundMonth = monthlySalesData.find(
                (monthData) => monthData.month === defaultMonth.month
            );
            return foundMonth || defaultMonth;
        });
        console.log('monthly Values:', updatedMonthlyValues)




        //_________________________________________________________Monthly Users Data Graph_____________________________________________________

        const monthlyTotalUsers = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(currentYear, currentMonth - 1, 1) },
                },
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    totalUsers: { $sum: 1 },
                },
            },
        ]);
        console.log('monthlyTotalUsers:', monthlyTotalUsers);
        // Update monthly total users based on retrieved data
        const updatedMonthlyTotalUsers = defaultMonthlyValues.map((defaultMonth) => {
            const foundMonth = monthlyTotalUsers.find(
                (monthData) => monthData._id === defaultMonth.month
            );
            return { month: defaultMonth.month, totalUsers: foundMonth ? foundMonth.totalUsers : 0 };
        });
        console.log('updatedMonthlyTotalUsers:', updatedMonthlyTotalUsers);



        //_____________________________________________________ yearly sales data Graph________________________________________________________
        const yearlySalesData = await Order.aggregate([
            {
                $unwind: "$items",
            },
            {
                $match: {
                    "items.ordered_status": "delivered",
                    createdAt: { $gte: new Date(currentYear - yearsToInclude, 0, 1) }, // Adjust the start date
                    status: { $ne: "cancelled" },
                },
            },
            {
                $group: {
                    _id: { $year: "$createdAt" },
                    total: {
                        $sum: {

                            $sum: { $multiply: ["$items.quantity", "$items.price"] },

                        },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id",
                    total: "$total",
                    count: "$count",
                },
            },
        ]);

      
        // Update yearly values based on retrieved data
        const updatedYearlyValues = defaultYearlyValues.map((defaultYear) => {
            const foundYear = yearlySalesData.find(
                (yearData) => yearData.year === defaultYear.year
            );
            return foundYear || defaultYear;
        });

        console.log('updatedYearlyValues :', updatedYearlyValues)

        //_____________________________________________________ yearly users data Graph________________________________________________________

        const yearlyTotalUsers = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(currentYear - yearsToInclude, 0, 1) },
                },
            },
            {
                $group: {
                    _id: { $year: "$createdAt" },
                    totalUsers: { $sum: 1 },
                },
            },
        ]);

        // Update yearly total users based on retrieved data
        const updatedYearlyTotalUsers = defaultYearlyValues.map((defaultYear) => {
            const foundYear = yearlyTotalUsers.find(
                (yearData) => yearData._id === defaultYear.year
            );
            return { year: defaultYear.year, totalUsers: foundYear ? foundYear.totalUsers : 0 };
        });


        //____________________LATEST-USERS__________________________________________
        const latestUsers = await User.find({}).sort({ createdAt: -1 }).limit(5)


        //____________________LATEST-ORDERS_________________________________________
        const latestOrders = await Order.aggregate([
            {
                $unwind: "$items",
            },
            {
                $match: {
                    status: { $ne: "pending" },
                },
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
            {
                $limit: 10,
            },
        ])




        res.render('admin/dashboard', {
            moment,
            //latest-users
            latestUsers,

            //latest-orders
            latestOrders,

            //revenue
            totalSale,

            //Total_Orders
            totalOrder,
            deliveredOrders,
            cancelOrders,
            otherOrders,

            //Total_Products/Categories
            totalProducts,
            totalCategories,

            //Daily Sales
            DailyEarn,

            //This month Sales
            monthlyEarn,

            //This year Sales
            yearlyEarn,

            //Monthly Sales Data Graph
            updatedMonthlyValues,

            //Monthly Users Graph
            updatedMonthlyTotalUsers,

            //yearly Sales Data Graph
            updatedYearlyValues,

            //yearly Users Data Graph
            updatedYearlyTotalUsers,

        })
    } catch (error) {
        console.log(error.message)
    }
}




//______________________________SALES REPORT________________________________

const salesReport = async (req, res) => {
    try {
        const moment = require('moment')

        const firstOrder = await Order.find().sort({ createdAt: 1 });
        const lastOreder = await Order.find().sort({ createdAt: -1 });

        const salesReport = await Order.find({
            "items.ordered_status": "delivered"
        })
            .populate("user_id")
            .populate("items.product_id")
            .sort({ createdAt: -1 });

        res.render('admin/salesReport', {
            firstOrder: moment(firstOrder[0].createdAt).format("YYYY-MM-DD"),
            lastOrder: moment(lastOreder[0].createdAt).format("YYYY-MM-DD"),
            salesReport,
            moment
        })
    } catch (error) {
        console.log(error.message);
    }
}

//______________________________Sales Report by Date_________________________________________
const datePicker = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        const startDateObj = new Date(startDate);
        startDateObj.setHours(0, 0, 0, 0);

        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);

        const selectedDate = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDateObj,
                        $lte: endDateObj,
                    },
                    "items.ordered_status": "delivered",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $unwind: "$items" // Unwind to access individual items
            },

            {
                $lookup: {
                    from: "products",
                    localField: "items.product_id",
                    foreignField: "_id",
                    as: "items.product",
                },
            },
            {
                $group: {
                    _id: "$_id",
                    user: { $first: "$user" },
                    delivery_address: { $first: "$delivery_address" },
                    order_id: { $first: "$_id" },
                    date: { $first: "$date" },
                    payment: { $first: "$payment" },
                    total: { $first: "$total_amount" }, // Calculate total amount
                    ordered_status: { $first: "$items.ordered_status" }, // Get status
                    quantity: { $sum: "$items.quantity" }, // Calculate total quantity
                    product: { $first: "$items.product.name" } // Get product names
                },
            },
        ]);
        console.log('bmbmbmbmbmbmbm:', selectedDate)
        res.status(200).json({ selectedDate: selectedDate });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    adminDashboard,
    salesReport,
    datePicker
}