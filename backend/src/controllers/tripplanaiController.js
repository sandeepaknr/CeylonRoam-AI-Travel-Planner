const Trip = require("../models/Trip");
const { exec } = require("child_process");

exports.generateTripPlan = async (req, res) => {
    console.log("📥 Incoming Request from React:", req.body); 

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
            force_free_places: force_free_places || false // 🔴 New parameter
        });

        const pythonScriptPath = "C:\\Users\\ASUS\\Downloads\\Traveling System (2)\\Traveling System\\Traveling System\\backend\\itinerary_api.py"; 

        const escapedArgs = pythonArgs.replace(/"/g, '\\"');
        const command = `python "${pythonScriptPath}" "${escapedArgs}"`;
        console.log("🚀 Running Python script... Command:", command);

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Python Execution Error: ${error.message}`);
                return res.status(500).json({ status: "error", message: "Trip generation failed in Python script" });
            }

            console.log("✅ Python Output:", stdout); 

            try {
                const aiData = JSON.parse(stdout);

                // 🔴 If budget is insufficient, send a Special Status with HTTP 200
                if (aiData.status === "budget_insufficient") {
                    console.log("⚠️ Budget Insufficient Error Caught!");
                    return res.status(200).json({ 
                        status: "budget_insufficient", 
                        message: aiData.message,
                        required_amount: aiData.required_amount
                    });
                }

                if (aiData.status === "error") {
                    console.error("❌ Python returned an Error Status:", aiData.message);
                    return res.status(400).json({ status: "error", message: aiData.message });
                }

                const formattedResponse = {
                    status: "success",
                    tripTitle: `Sri Lanka ${days}-Day Adventure`,
                    totalEstimatedCost: aiData.total_cost,
                    remainingBudget: aiData.remaining_budget,
                    fullStory: aiData.ai_story,
                    itinerary: aiData.itinerary.map(day => ({
                        day: day.Day,
                        date: day.Date,
                        destination: day.Region,
                        activities: day.Places.map(p => {
                            // Distance_to_Hotel was added to day_places in the Python backend.
                            // This null-guard ensures we NEVER render "undefinedkm" even if the
                            // Python script is an older version that didn't include the field.
                            const distKm = (p.Distance_to_Hotel != null)
                                ? p.Distance_to_Hotel
                                : parseFloat((p.Travel_Time * 50).toFixed(1)); // fallback: Travel_Time × 50 km/h avg
                            const accessNote = p.Access_Warning ? ` ${p.Access_Warning}` : '';
                            // Travel_Time = dist_to_next / speed_kmph → varies per stop (proportional to distance).
                            // Visit_Time = estimate_visit_time(category) → fixed by category (e.g. always 1.5 for
                            // temples/default), which is why ALL stops showed identical "1.5hrs" regardless of
                            // distance. We display Travel_Time here because the label reads "Time:" and users
                            // expect journey duration, not time-at-destination.
                            const travelTime = (p.Travel_Time != null)
                                ? p.Travel_Time
                                : parseFloat((distKm / 45).toFixed(1)); // fallback: dist / 45 km/h (car default)
                            return `${p.Name} (Distance: ${distKm}km, Time: ${travelTime}hrs)${accessNote}`;
                        }),
                        accommodation: day.Hotel,
                        mapUrl: day.Map_URL,
                        warnings: `${day.Holiday_Warning} ${day.Weather_Warning}`.trim()
                    }))
                };

                console.log("🎉 Successfully sending JSON to React!");
                res.status(200).json(formattedResponse);

            } catch (parseError) {
                console.error("❌ JSON Parse Error! Raw output:", stdout);
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