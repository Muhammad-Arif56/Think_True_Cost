const mongoose = require("mongoose");
const habitModel = mongoose.Schema(
  {
    habit: {
      type: String,
      required: true,
    },
    frequency: {
      type: Number,
      required: true,
    },
    avg_cost: {
      type: Number,
      required: true,
    },
    currentAge: {
      type: Number,
      required: true,
    },
    retirementAge: {
      type: Number,
      required: true,
    },
    yearsBeforeRetirement:{
      type: Number
    },
    annualReturn: {
      type: Number
    },
    weeklyCost: {
      type: Number,
    },
    monthlyCost: {
      type: Number,
    },
    yearlyCost: {
      type: Number,
    },
    sp500HistoricalReturn:{
      type:Number
    },
    tenYearTreasuryReturn:{
      type: Number
    },  

    //Final step 
  TTCSavingReturn:{
    type: Number,
  }, 
  TTCSavingSP500Return:{
    type: Number
  }, 
  TTCSaving10YrTreasurReturn:{
    type: Number
  },
  TTCSavings:{
    type: Number
  },
  TCA:{
    type:Number
  },
  TotalInterest:{
    type:Number
  },
    userId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Habit_Spend", habitModel);
