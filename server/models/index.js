const sequelize = require('../config/dbConfig');
const User = require('./user');
const Course = require('./course')
const TrainingPerformance = require('./trainingperformance')
const Feedback = require('./feedback')

sequelize.sync({ alter: false })
  .then(() => {
    console.log("Database synced");
  })
  .catch((err) => {
    console.log("Error syncing database", err);
  });

module.exports = {
  User,
  Course,
  TrainingPerformance,
  Feedback
};