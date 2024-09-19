const purchaseModel = require("../models/purchaseModel");
const spendingHabitModel = require("../models/spendingHabitModel");
const userModel = require("../models/userModel");



//_________________ One Time Purchase Step1  ____________________

exports.oneTimePurchase = async (req, res) => {
  try {
    const { item_name, purchaseAmount, currentAge, retirementAge, annualReturn } = req.body;

    // Check if user exists
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculations
    const yearsBeforeRetirement = retirementAge - currentAge;
    //by default value
    let newroi = annualReturn || 4; // default to 4 if annualReturn is falsy (undefined, 0, etc.)
    const annualReturnDecimal = newroi; // Convert to decimal
  
    // Historical returns
    const sp500HistoricalReturn = 10.67; // Average historical return for SP 500
    const tenYearTreasuryReturn = 5.6; // Average historical return for 10 YR US Treasury bond

    
    // Excel formula parameters
    const rate = annualReturnDecimal;
    const nper = yearsBeforeRetirement;
    const pmt = 0; // Assuming no additional payments
    const pv = purchaseAmount;
    const type = 0; // Assuming payments at the end of the period
    // Future value calculation function
    function calculateFutureValue(rate, years, payment, presentValue, type) {
      // Convert rate to decimal
      rate = rate / 100;

      // Calculate the future value using the formula
      let futureValue = presentValue * Math.pow(1 + rate, years);

      futureValue += payment * ((Math.pow(1 + rate, years) - 1) / rate) * (1 + rate * type);

      // Adjust future value for payments (if any)
      // Round the future value to two decimal places
      futureValue = Math.round(futureValue * 100) / 100;
      return futureValue;
    }
    // Calculate Future Value for the provided annual return
    const futureValue = calculateFutureValue(rate, nper, pmt, pv, type);
    console.log("🚀  exports.purchaseFirstStep=  futureValue:", futureValue)

    // Lost Opportunity Cost (LOC) calculations
    const TTCSavingReturn = futureValue;
    const TTCSavingSP500Return = calculateFutureValue(sp500HistoricalReturn, yearsBeforeRetirement, 0, purchaseAmount, 0);
    const TTCSaving10YrTreasurReturn = calculateFutureValue(tenYearTreasuryReturn, yearsBeforeRetirement, 0, purchaseAmount, 0);

    //Final calculation values for Graph....
    const TTCSavings = TTCSavingReturn + TTCSavingSP500Return + TTCSaving10YrTreasurReturn
    const TCA = purchaseAmount
  
    const P = purchaseAmount
    const n = 1
    const time = yearsBeforeRetirement
    const Amount = P*(1+ rate/n)**(n*time)
    const TotalInterest = Amount - purchaseAmount


    // Save data to DB
    const purchase_calculations = await new purchaseModel({
      userId: req.user.id,
      item_name,
      purchaseAmount,
      currentAge,
      retirementAge,
      yearsBeforeRetirement,
      annualReturn: annualReturnDecimal,
      sp500HistoricalReturn,
      tenYearTreasuryReturn,
      TTCSavingReturn,
      TTCSavingSP500Return,
      TTCSaving10YrTreasurReturn: TTCSaving10YrTreasurReturn.toFixed(0),
      TTCSavings: TTCSavings.toFixed(0),
      TCA: TCA.toFixed(0),
      TotalInterest: TotalInterest.toFixed(0)
    });
    await purchase_calculations.save();

     //graph values......
     const total_interest = purchase_calculations.TotalInterest
     const totalYears = purchase_calculations.yearsBeforeRetirement

    // Generate intervals dynamically based on the number of years with a difference of 5 years
    const intervals = [];
    for (let i = 0; i <= totalYears; i += 5) {
        intervals.push(i);
    }

    const calculateFutureValueForInterval = (principal, rate, time) => {
        return principal * Math.pow(1 + rate, time);
    };

    const data = intervals.map(interval => {
        return {
            year: interval,
            annualReturn: calculateFutureValueForInterval(total_interest, annualReturnDecimal, interval),
            sp500HistoricalReturn: calculateFutureValueForInterval(total_interest, sp500HistoricalReturn, interval),
            tenYearTreasuryReturn: calculateFutureValueForInterval(total_interest, tenYearTreasuryReturn, interval)
        };
    });

    console.log(JSON.stringify(data, null, 2));


    return res.status(201).json({ message: "One Time Purchase is calculated and recorded", purchase_calculations});
  } catch (err) {
    console.error("Error in Purchasing process:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};






// //__________________ Step2  _____________________

// exports.purchaseSecondStep = async (req, res) => {
//   try {
//     const {
//       item_name,
//       purchaseAmount,
//       currentAge,
//       retirementAge,
//       annualReturn,
//     } = req.body;

//     // Check if user exists
//     const user = await userModel.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     // Calculations
//     const yearsBeforeRetirement = retirementAge - currentAge;
//     // const annualReturnPercentage = annualReturn * 100; // Convert to percentage for display

//     // Historical returns (assumed values, replace with actual data)
//     const sp500HistoricalReturn = 10.67; // Average historical return for SP 500
//     const tenYearTreasureReturn = 5.6; // Average historical return for 10 YR US Treasure bond

//     // Excel formula parameters
//     const rate = annualReturn;
//     const nper = yearsBeforeRetirement;
//     const pmt = 0; // Assuming no additional payments
//     const pv = purchaseAmount;
//     const type = 0; // Assuming payments at the end of the period
//     // Future value calculation function
//     // function calculateFutureValue(rate, nper, pmt, pv, type) {
//     //   return pv * Math.pow(1 + rate, nper);
//     // }

//     function calculateFutureValue(rate, years, payment, presentValue, type) {
//       // Convert rate to decimal
//       rate = rate / 100;
  
//       // Calculate the future value using the formula
//       let futureValue = presentValue * Math.pow(1 + rate, years);
  
//       // Adjust future value for payments (if any)
//       futureValue += payment * ((Math.pow(1 + rate, years) - 1) / rate) * (1 + rate * type);
  
//       // Round the future value to two decimal places
//       futureValue = Math.round(futureValue * 100) / 100;
  
      
//       return futureValue;
//   }
  
//   // Example usage:
//   // const fv = calculateFutureValue(6, 30, 0, -40000, 0);
//   // console.log("Future Value:", fv);
//   console.log(rate);
//   console.log(nper);
//   console.log(pmt);
//   console.log(pv);
//   console.log(type);
  
//     // Calculate Future Value using the Excel formula
//     const futureValue = calculateFutureValue(rate, nper, pmt, pv, type);
//     // console.log("🚀 ~ exports.purchaseSecondStep= ~ futureValue:", futureValue)
//     // Lost Opportunity Cost (LOC) calculations
//     const locBasedOnAnnualReturn = futureValue
//     const locBasedOnSP500Return = calculateFutureValue(sp500HistoricalReturn, nper, pmt, pv, type);
//     const locBasedOnTreasureReturn =calculateFutureValue(tenYearTreasureReturn, nper, pmt, pv, type);

//     // Save data to DB
//     const purchase_calculations = new purchaseModel({
//       userId: req.user.id,
//       item_name,
//       purchaseAmount,
//       currentAge,
//       retirementAge,
//       annualReturn,
//       locBasedOnAnnualReturn:locBasedOnAnnualReturn.toFixed(2),
//       locBasedOnSP500Return: locBasedOnSP500Return.toFixed(2),
//       locBasedOnTreasureReturn:locBasedOnTreasureReturn.toFixed(2)
//     });
//     await purchase_calculations.save();

//     // Output
//     console.log("Lost opportunity cost on saving based on your returns:",locBasedOnAnnualReturn.toFixed(2));
//     console.log("Lost opportunity cost on saving based on average SP 500 returns:",locBasedOnSP500Return.toFixed(2));
//     console.log("Lost opportunity cost on saving based on average 10 YR Treasure returns:",locBasedOnTreasureReturn.toFixed(2));

//     return res.status(201).json({message: "Second step of Purchase is calculated and recorded",purchase_calculations});
//   } catch (err) {
//     console.error("Error in Purchasing process:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };



//___________________      Get all purchase list    _______________________

exports.getAllPurchases = async (req, res)=>{
  try {
    // const purchaseId = req.params.purchaseId
    const userCheck = await userModel.findById(req.user.id)
    if(!userCheck){
      return res.status(404).json({error: "No user found by this id"})
    }
    const all_purchases = await purchaseModel.find({userId:req.user.id})
    console.log("🚀 ~ exports.getAllPurchases= ~ all_purchases:", all_purchases)
    if(!all_purchases){
      return res.status(404).json({error: "No purchase found by this id"})
    }
    return res.status(200).json({message: "All purchases : ", all_purchases})

  } catch (err) {
    console.log(err);
    console.error("Error in Purchasing process:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};







//updating purchase form
exports.updatePurchase = async function (req, res) {
  try {
    const purchaseId = req.params.id;
    const { item_name, amount, age, retirement_age, investment } = req.body;
    //checking PURCHASE existing
    const purchase = await purchaseModel.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({ error: "Purchase not found" });
    }
    let updatedFields = req.body
    const updatedPurchase = await purchaseModel.findByIdAndUpdate(
      purchaseId,
      // { item_name, amount, age, retirement_age, investment },
      updatedFields,
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "Purchase entries updated", updatedPurchase });
  } catch (err) {
    console.error("Error in Updating Purchasing process:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
