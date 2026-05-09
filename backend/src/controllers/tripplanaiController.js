const Trip = require("../models/Trip");
const { exec } = require("child_process");

exports.generateTripPlan = async (req, res) => {
    console.log("📥 React එකෙන් ආපු Request එක:", req.body); 

    const { budget, days, transport, members, keywords, start_loc, start_date, has_vulnerable, force_free_places } = req.body;

    try {
        const pythonArgs = JSON.stringify({
            budget: budget || 50000,
            num_days: days || 3,
            transport: transport || "Car",
            group_size: members || 2,
            interests: keywords || "",
            start_loc: start_loc || "Colombo",
            start_date: start_date || new Date().toISOString().split('T')[0],
            has_vulnerable: has_vulnerable || false,
            force_free_places: force_free_places || false // 🔴 අලුත් පරාමිතිය
        });

        const pythonScriptPath = "C:\\Users\\ASUS\\Downloads\\Traveling System (2)\\Traveling System\\Traveling System\\backend\\itinerary_api.py"; 

        const escapedArgs = pythonArgs.replace(/"/g, '\\"');
        const command = `python "${pythonScriptPath}" "${escapedArgs}"`;
        console.log("🚀 Python කේතය Run වෙනවා... Command එක:", command);

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Python Execution Error: ${error.message}`);
                return res.status(500).json({ status: "error", message: "Trip generation failed in Python script" });
            }

            console.log("✅ Python Output එක:", stdout); 

            try {
                const aiData = JSON.parse(stdout);

                // 🔴 බජට් එක මදි වුණොත්, 200 දීලම Special Status එකක් යවනවා
                if (aiData.status === "budget_insufficient") {
                    console.log("⚠️ Budget Insufficient Error Caught!");
                    return res.status(200).json({ 
                        status: "budget_insufficient", 
                        message: aiData.message,
                        required_amount: aiData.required_amount
                    });
                }

                if (aiData.status === "error") {
                    console.error("❌ Python එකෙන් Error Status එකක් ආවා:", aiData.message);
                    return res.status(400).json({ status: "error", message: aiData.message });
                }

                const formattedResponse = {
                    status: "success",
                    tripTitle: `Sri Lanka ${days}-Day Adventure`,
                    totalEstimatedCost: `LKR ${aiData.total_cost}`,
                    remainingBudget: `LKR ${aiData.remaining_budget}`,
                    fullStory: aiData.ai_story,
                    itinerary: aiData.itinerary.map(day => ({
                        day: day.Day,
                        date: day.Date,
                        destination: day.Region,
                        activities: day.Places.map(p => `${p.Name} (Distance: ${p.Distance_to_Hotel}km, Time: ${p.Visit_Time}hrs)`),
                        accommodation: day.Hotel,
                        mapUrl: day.Map_URL,
                        warnings: `${day.Holiday_Warning} ${day.Weather_Warning}`.trim()
                    }))
                };

                console.log("🎉 Successfully sending JSON to React!");
                res.status(200).json(formattedResponse);

            } catch (parseError) {
                console.error("❌ JSON Parse Error! ආපු දේ:", stdout);
                res.status(500).json({ status: "error", message: "Invalid output from Python script" });
            }
        });

    } catch (err) {
        console.error("❌ SERVER ERROR:", err.message);
        res.status(500).json({ status: "error", message: "Server Error" });
    }
};

exports.saveTripPlan = async (req, res) => {
    try {
        const { userId, planData, formData } = req.body;

        const newTrip = new Trip({
            userId: userId,
            tripTitle: planData.tripTitle,
            totalEstimatedCost: planData.totalEstimatedCost,
            fullPlanDescription: planData.fullDescription || JSON.stringify(planData.itinerary),
            itinerary: planData.itinerary || [],
            budget: formData.budget,
            days: formData.days,
            members: formData.members,
            transport: formData.transport
        });

        await newTrip.save();
        res.status(201).json({ message: "Trip saved successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Failed to save the trip" });
    }
};

exports.getUserTrips = async (req, res) => {
    try {
        const userId = req.params.userId;
        const trips = await Trip.find({ userId }).sort({ createdAt: -1 }); 
        res.status(200).json(trips);
    } catch (err) {
        res.status(500).json({ message: "Error fetching trips" });
    }
};

exports.deleteTrip = async (req, res) => {
    try {
        await Trip.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Trip deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting trip" });
    }
};