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

    // Calculations
    const yearsBeforeRetirement = retirementAge - currentAge;

    // Default value for annual return if not provided
    let newroi = annualReturn || 4; // default to 4 if annualReturn is falsy (undefined, 0, etc.)
    const annualReturnPercentage = newroi;

    // Calculate costs
    let weeklyCost = 0;
    let monthlyCost = 0;
    let yearlyCost = 0;
    if (frequency && avg_cost) {
      weeklyCost = frequency * avg_cost;
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
      sp500HistoricalReturn: sp500HistoricalReturn,
      tenYearTreasuryReturn: tenYearTreasuryReturn,
      TTCSavingReturn: TTCSavingReturn.toFixed(0),
      TTCSavingSP500Return: TTCSavingSP500Return.toFixed(),
      TTCSaving10YrTreasurReturn: TTCSaving10YrTreasurReturn.toFixed(),
      TTCSavings: TTCSavings.toFixed(2),
      TCA: TCA.toFixed(2),
      TotalInterest: TotalInterest.toFixed(2),
    });

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

    await calculated_data.save();

    return res.status(201).json({
      message: "Spending Habit calculation is created and recorded",
      calculated_data,
      projectionData: data,
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
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
exports.updateSpendingHabit = async function (req, res) {
  try {
    const spendingId = req.params.id;

    // Checking if the spending habit exists
    const check_spending = await habitModel.findById(spendingId);
    if (!check_spending) {
      return res.status(404).json({ error: "Spending habit not found" });
    }

    // Destructuring the request body, taking only fields that are provided
    const { habit, frequency, avg_cost, age, retirement_age, investment } = req.body;

    // Construct an object for fields that are being updated
    let updatedFields = {};
    if (habit !== undefined) updatedFields.habit = habit;
    if (frequency !== undefined) updatedFields.frequency = frequency;
    if (avg_cost !== undefined) updatedFields.avg_cost = avg_cost;
    if (age !== undefined) updatedFields.age = age;
    if (retirement_age !== undefined) updatedFields.retirement_age = retirement_age;
    if (investment !== undefined) updatedFields.investment = investment;

    // Updating the document in the database
    const updatedSpendingHabit = await habitModel.findByIdAndUpdate(
      spendingId,
      { $set: updatedFields },
      { new: true }
    );

    // Return the updated spending habit
    return res.status(200).json({
      message: "Spending habit updated successfully",
      updatedSpendingHabit,
    });
  } catch (err) {
    // Catching and returning any errors
    return res.status(500).json({ error: "Internal server error" });
  }
};

