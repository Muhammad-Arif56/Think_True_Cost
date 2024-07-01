const mongoose = require('mongoose');
const purchaseModelSchema = mongoose.Schema({
  item_name: {
    type: String,
    required: true
  },
  purchaseAmount: {
    type: Number,
    required: true
  },
  currentAge: {
    type: Number,
    required: true
  },
  retirementAge: {
    type: Number,
    required: true
  },
  yearsBeforeRetirement:{
    type: Number,
  },
  annualReturn: {
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
    required: true,
    ref: "User"
  }
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseModelSchema);

