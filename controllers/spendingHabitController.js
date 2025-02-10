const spendingHabitModel = require("../models/spendingHabitModel");
const habitModel = require("../models/spendingHabitModel");
const User = require("../models/User");

//__________________ Spending Habit Step  _____________________

// exports.spendingHabit = async (req, res) => {
//   try {
//     const {
//       habit,
//       frequency,
//       avg_cost,
//       currentAge,
//       retirementAge,
//       annualReturn,
//     } = req.body;

//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     const yearsBeforeRetirement = retirementAge - currentAge;
//     //by default value
//     let newroi = annualReturn || 4; // default to 4 if annualReturn is falsy (undefined, 0, etc.)
//     const annualReturnDecimal = newroi; // Convert to decimal

//     // Calculate costs
//     let weeklyCost = 0;
//     let monthlyCost = 0;
//     let yearlyCost = 0;
//     if (frequency && avg_cost) {
//       weeklyCost = frequency * avg_cost;
//       // const weeks_per_month = 52 / 12;
//       monthlyCost = weeklyCost * 4.3;
//       yearlyCost = monthlyCost * 12;

//     }
//     const sp500HistoricalReturn = 10.67;
//     const tenYearTreasuryReturn = 5.6;

//     const sp500HistoricalReturnDecimal = 10.67;
//     const tenYearTreasuryReturnDecimal = 5.60;
//     function calculateFutureValue(rate, nper, pmt, pv, type) {
//       rate = rate / 100;
//       let futureValue =
//         pv * Math.pow(1 + rate, nper) +
//         pmt * ((Math.pow(1 + rate, nper) - 1) / rate) * (1 + rate * type);
//       return futureValue;
//     }

//     const nper = yearsBeforeRetirement;
//     const rate = annualReturnDecimal;
//     const pmt = yearlyCost;
//     const pv = 0;
//     const type = 0;
//     const futureValueOfHabit = calculateFutureValue(rate, nper, pmt, pv, type);
//     const TTCSavingReturn = futureValueOfHabit;
//     const TTCSavingSP500Return = calculateFutureValue(
//       sp500HistoricalReturnDecimal,
//       nper,
//       pmt,
//       pv,
//       type
//     );
//     const TTCSaving10YrTreasurReturn = calculateFutureValue(
//       tenYearTreasuryReturnDecimal,
//       nper,
//       pmt,
//       pv,
//       type
//     );
//     const TTCSavings =
//       TTCSavingReturn + TTCSavingSP500Return + TTCSaving10YrTreasurReturn;
//     const TCA = yearlyCost;
//     const P = yearlyCost;
//     const n = 1;
//     const time = yearsBeforeRetirement;
//     const Amount = P * (1 + rate / n) ** (n * time);
//     const TotalInterest = Amount - yearlyCost;
//     const calculated_data = new spendingHabitModel({
//       userId: req.user.id,
//       habit,
//       frequency,
//       avg_cost,
//       currentAge,
//       retirementAge,
//       yearsBeforeRetirement,
//       weeklyCost: weeklyCost.toFixed(0),
//       monthlyCost: monthlyCost.toFixed(0),
//       yearlyCost: yearlyCost.toFixed(0),
//       annualReturn: annualReturnDecimal,
//       sp500HistoricalReturn: sp500HistoricalReturn,
//       tenYearTreasuryReturn: tenYearTreasuryReturn,
//       TTCSavingReturn: TTCSavingReturn.toFixed(0),
//       TTCSavingSP500Return: TTCSavingSP500Return.toFixed(0),
//       TTCSaving10YrTreasurReturn: TTCSaving10YrTreasurReturn.toFixed(0),
//       TTCSavings: TTCSavings.toFixed(0),
//       TCA: TCA.toFixed(0),
//       TotalInterest: TotalInterest.toFixed(0),
//     });
//     const savedCalculatedData = await calculated_data.save();
//     const total_interest = calculated_data.TotalInterest;
//     const totalYears = calculated_data.yearsBeforeRetirement;

//     const intervals = [];
//     for (let i = 0; i <= totalYears; i += 5) {
//       intervals.push(i);
//     }

//     const calculateFutureValueForInterval = (principal, rate, time) => {
//       return principal * Math.pow(1 + rate, time);
//     };

//     const data = intervals.map((interval) => {
//       return {
//         year: interval,
//         annualReturn: calculateFutureValueForInterval(
//           total_interest,
//           annualReturnDecimal,
//           interval
//         ),
//         sp500HistoricalReturn: calculateFutureValueForInterval(
//           total_interest,
//           sp500HistoricalReturn,
//           interval
//         ),
//         tenYearTreasuryReturn: calculateFutureValueForInterval(
//           total_interest,
//           tenYearTreasuryReturn,
//           interval
//         ),
//       };
//     });
//     await spendingHabitModel.findByIdAndUpdate(
//       savedCalculatedData._id,
//       {
//         projectionData: data,
//       },
//       {
//         new: true,
//       }
//     );
//     return res.status(201).json({
//       message: "Spending Habit calculation is created and recorded",
//       calculated_data,
//       projectionData: data,
//     });
//   } catch (err) {
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

exports.spendingHabit = async (req, res) => {
  try {
    const {
      habit,
      frequency,
      avg_cost,
      currentAge,
      retirementAge,
      annualReturn,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Basic calculations
    const yearsBeforeRetirement = retirementAge - currentAge;
    let newroi = annualReturn || 7; // Default to 7% if not provided
    const annualReturnPercentage = newroi;

    let weeklyCost = frequency * avg_cost;
    let monthlyCost = weeklyCost * 4.3; // Approximate monthly cost
    let yearlyCost = monthlyCost * 12;

    const sp500HistoricalReturn = 10.67;
    const tenYearTreasuryReturn = 5.6;

    // Future value function
    function calculateFutureValue(rate, nper, pmt, pv, type) {
      rate = rate / 100; // Convert to decimal
      return (
        pv * Math.pow(1 + rate, nper) +
        pmt * ((Math.pow(1 + rate, nper) - 1) / rate) * (1 + rate * type)
      );
    }

    // Calculate main projections
    const nper = yearsBeforeRetirement;
    const pv = 0;
    const type = 0;

    const TTCSavingReturn = calculateFutureValue(annualReturnPercentage, nper, yearlyCost, pv, type);
    const TTCSavingSP500Return = calculateFutureValue(sp500HistoricalReturn, nper, yearlyCost, pv, type);
    const TTCSaving10YrTreasurReturn = calculateFutureValue(tenYearTreasuryReturn, nper, yearlyCost, pv, type);

    const TTCSavings = TTCSavingReturn;
    const TCA = yearlyCost * yearsBeforeRetirement;
    const TotalInterest = TTCSavings - TCA;

    // Save data to DB
    const calculated_data = new spendingHabitModel({
      userId: req.user.id,
      habit,
      frequency,
      avg_cost,
      currentAge,
      retirementAge,
      yearsBeforeRetirement,
      weeklyCost: weeklyCost.toFixed(2),
      monthlyCost: monthlyCost.toFixed(2),
      yearlyCost: yearlyCost.toFixed(2),
      annualReturn: annualReturnPercentage,
      sp500HistoricalReturn,
      tenYearTreasuryReturn,
      TTCSavingReturn: TTCSavingReturn.toFixed(2),
      TTCSavingSP500Return: TTCSavingSP500Return.toFixed(2),
      TTCSaving10YrTreasurReturn: TTCSaving10YrTreasurReturn.toFixed(2),
      TTCSavings: TTCSavings.toFixed(2),
      TCA: TCA.toFixed(2),
      TotalInterest: TotalInterest.toFixed(2),
    });

    // Dynamic projection until TTCSavingReturn is reached
    const projectionData = [];
    let totalSavings = 0;
    let year = 0;

    while (totalSavings < TTCSavingReturn) {
      let yearlyIncrease = totalSavings * (annualReturnPercentage / 100) + yearlyCost;
      totalSavings += yearlyIncrease;

      projectionData.push({
        year: year,
        annualReturn: totalSavings.toFixed(2),
        sp500HistoricalReturn: calculateFutureValue(sp500HistoricalReturn, year, yearlyCost, 0, 0).toFixed(2),
        tenYearTreasuryReturn: calculateFutureValue(tenYearTreasuryReturn, year, yearlyCost, 0, 0).toFixed(2),
      });

      year += 5; // Adjust interval dynamically
    }

    await calculated_data.save();

    return res.status(201).json({
      message: "Spending Habit calculation is created and recorded",
      calculated_data,
      projectionData,
    });

  } catch (err) {
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
};





//___________________   Get all Spending Habits list   _______________________

exports.getAllSpendingHabits = async (req, res) => {
  try {
    // const purchaseId = req.params.purchaseId
    const userCheck = await User.findById(req.user.id);
    if (!userCheck) {
      return res.status(404).json({ error: "No user found by this id" });
    }
    const all_purchases = await spendingHabitModel.find({
      userId: req.user.id,
    });
    if (!all_purchases) {
      return res.status(404).json({ error: "No purchase found by this id" });
    }
    return res
      .status(200)
      .json({ message: "All Spending habits : ", all_purchases });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

//updating spending habit purchase
exports.updateSpendingHabit = async (req, res) => {
  try {
    const {
      habit,
      frequency,
      avg_cost,
      currentAge,
      retirementAge,
      annualReturn,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the spending habit by ID
    const spendingHabit = await spendingHabitModel.findOne({ userId: req.user.id });
    if (!spendingHabit) {
      return res.status(404).json({ error: "Spending habit not found" });
    }

    // Update values
    spendingHabit.habit = habit || spendingHabit.habit;
    spendingHabit.frequency = frequency || spendingHabit.frequency;
    spendingHabit.avg_cost = avg_cost || spendingHabit.avg_cost;
    spendingHabit.currentAge = currentAge || spendingHabit.currentAge;
    spendingHabit.retirementAge = retirementAge || spendingHabit.retirementAge;

    // Calculations
    const yearsBeforeRetirement = spendingHabit.retirementAge - spendingHabit.currentAge;

    // Default value for annual return if not provided
    let newroi = annualReturn || spendingHabit.annualReturn || 4; // Default to 4 if not provided
    const annualReturnPercentage = newroi;

    // Calculate costs
    let weeklyCost = 0;
    let monthlyCost = 0;
    let yearlyCost = 0;
    if (spendingHabit.frequency && spendingHabit.avg_cost) {
      weeklyCost = spendingHabit.frequency * spendingHabit.avg_cost;
      monthlyCost = weeklyCost * 4.3;
      yearlyCost = monthlyCost * 12;
    }

    // Static values by client
    const sp500HistoricalReturn = 10.67;
    const tenYearTreasuryReturn = 5.6;

    // Function to calculate future value
    function calculateFutureValue(rate, nper, pmt, pv, type) {
      rate = rate / 100; // Convert rate to decimal
      let futureValue =
        pv * Math.pow(1 + rate, nper) +
        pmt * ((Math.pow(1 + rate, nper) - 1) / rate) * (1 + rate * type);
      return futureValue;
    }

    // Future value calculations
    const nper = yearsBeforeRetirement;
    const rate = annualReturnPercentage;
    const pmt = yearlyCost;
    const pv = 0;
    const type = 0; // 0 for payments made at the end of each period

    const futureValueOfHabit = calculateFutureValue(rate, nper, pmt, pv, type);

    // Think True Cost (TTC) / Lost Opportunity Cost (LOC) calculations
    const TTCSavingReturn = futureValueOfHabit;
    const TTCSavingSP500Return = calculateFutureValue(
      sp500HistoricalReturn,
      nper,
      pmt,
      pv,
      type
    );
    const TTCSaving10YrTreasurReturn = calculateFutureValue(
      tenYearTreasuryReturn,
      nper,
      pmt,
      pv,
      type
    );

    // Final calculation values for graph
    const TTCSavings = TTCSavingReturn;
    const TCA = yearlyCost * yearsBeforeRetirement;

    // Calculate total interest
    const TotalInterest = TTCSavings - TCA;

    // Update values in the model
    spendingHabit.yearsBeforeRetirement = yearsBeforeRetirement;
    spendingHabit.weeklyCost = weeklyCost.toFixed(2);
    spendingHabit.monthlyCost = monthlyCost.toFixed(2);
    spendingHabit.yearlyCost = yearlyCost.toFixed(2);
    spendingHabit.annualReturn = annualReturnPercentage;
    spendingHabit.sp500HistoricalReturn = sp500HistoricalReturn;
    spendingHabit.tenYearTreasuryReturn = tenYearTreasuryReturn;
    spendingHabit.TTCSavingReturn = TTCSavingReturn.toFixed(0);
    spendingHabit.TTCSavingSP500Return = TTCSavingSP500Return.toFixed();
    spendingHabit.TTCSaving10YrTreasurReturn = TTCSaving10YrTreasurReturn.toFixed();
    spendingHabit.TTCSavings = TTCSavings.toFixed(2);
    spendingHabit.TCA = TCA.toFixed(2);
    spendingHabit.TotalInterest = TotalInterest.toFixed(2);

    // Graph values logic
    const totalYears = yearsBeforeRetirement;

    // Generate intervals dynamically based on the number of years with a difference of 5 years
    const intervals = [];
    for (let i = 0; i <= totalYears; i += 5) {
      intervals.push(i);
    }

    // Function to calculate future value for each interval
    const calculateFutureValueForInterval = (principal, rate, time) => {
      rate = rate / 100; // Convert percentage to decimal
      return principal * Math.pow(1 + rate, time);
    };

    // Prepare data for graph with future value projections at each interval
    const data = intervals.map((interval) => {
      return {
        year: interval,
        annualReturn: calculateFutureValueForInterval(
          yearlyCost, // Use yearly cost as principal
          annualReturnPercentage,
          interval
        ),
        sp500HistoricalReturn: calculateFutureValueForInterval(
          yearlyCost, // Use yearly cost as principal
          sp500HistoricalReturn,
          interval
        ),
        tenYearTreasuryReturn: calculateFutureValueForInterval(
          yearlyCost, // Use yearly cost as principal
          tenYearTreasuryReturn,
          interval
        ),
      };
    });

    // Save updated data
    await spendingHabit.save();

    return res.status(200).json({
      message: "Spending habit updated successfully",
      updated_data: spendingHabit,
      projectionData: data,
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};





