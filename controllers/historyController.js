const historyModel = require("../models/historyModel");
const { startApp, getAppStatus } = require("./app.js")

module.exports.startApp = async (req, res, next) => {
  try {
    startApp();
    const appStatus = getAppStatus();
    return res.json({ status: true, data: appStatus });
  } catch (error) {
    next(error);
  }
};

module.exports.getAppStatus = async (req, res, next) => {
  try {
    const appStatus = getAppStatus();
    return res.json({ status: true, data: appStatus });
  } catch (error) {
    next(error);
  }
};

module.exports.getHistory = async (req, res, next) => {
  try {
    const { pageNumber, pageSize } = req.body;
    const skips = pageSize * (pageNumber - 1);
    const totalCount = await historyModel.countDocuments();

    const history = await historyModel.find()
      .sort({ blockNumber: -1 })
      .skip(skips)
      .limit(pageSize);
    return res.json({ status: true, data: history, totalCount });
  } catch (error) {
    next(error);
  }
};

module.exports.dropCollection = async (req, res, next) => {
  try {
    await historyModel.collection.drop();
    return res.json({ status: true });
  } catch (error) {
    next(error);
  }
};

module.exports.getAccounts = async (req, res, next) => {
  try {
    const { pageNumber, pageSize } = req.body;
    // Calculate the skip count based on the page number and page size
    const skipCount = (pageNumber - 1) * pageSize;

    const pipeline = [
      { $match: {} },
      { $group: { _id: "$to", balance: { $sum: "$value" } } },
      { $sort: { balance: -1 } }, // Sort by descending balance
      { $skip: skipCount }, // Skip documents based on the page number and page size
      { $limit: pageSize } // 
    ];
    const cursor = await historyModel.aggregate(pipeline);
    console.log(cursor);
    const result = cursor;
    // Map the result to the required format
    const accounts = result.map(item => ({
      address: item._id,
      balance: item.balance
    }));

    res.json(accounts);
  }
  catch (err) {
    next(err);
  }
}