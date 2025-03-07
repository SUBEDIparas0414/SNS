import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// 1. Server Configuration
const app = express();
const PORT = 4000;

// 2. Middleware Configuration
app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable CORS for all routes

// 3. Database Configuration
try {
  mongoose.connect(
    "mongodb+srv://parashsubedi:Subedi7456@cluster0.reu8r.mongodb.net/"
  );
  console.log("MongoDB connected successfully");
} catch (error) {
  console.log("MongoDB connection failed");
  console.log(error);
}

// 4. Schema Configuration
const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  phonenumber: { type: String, required: true }, // Ensure this matches everywhere
  email: { type: String, required: true },
  dob: { type: Date, required: true }, // Date of birth
  gender: { type: String, required: true, enum: ["male", "female", "other"] }, // Allowed values
});

// 5. Model Configuration
const User = mongoose.model("User", userSchema);

// 6. Route Configuration 

// Helper function to parse date from "YYYY/MM/DD" to Date object
const parseDate = (dateString) => {
  const [year, month, day] = dateString.split("/");
  return new Date(year, month - 1, day); // Month is 0-indexed in JavaScript
};

// Create User
app.post("/users", async (req, res) => {
  try {
    const { fullname, phonenumber, email, dob, gender } = req.body;

    // Parse the date from "YYYY/MM/DD" to a Date object
    const parsedDob = parseDate(dob);

    const newUser = new User({ fullname, phonenumber, email, dob: parsedDob, gender });
    await newUser.save();
    return res.status(201).json(newUser);
  } catch (error) {
    console.log("Something went wrong", error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
});

// Get All Users
app.get("/users", async (req, res) => {
  try {
    const allUsers = await User.find();
    return res.status(200).json(allUsers);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

// Get User by ID
app.get("/users/:id", async (req, res) => {
  try {
    const singleUser = await User.findById(req.params.id);
    if (!singleUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    return res.status(200).json(singleUser);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
});

// Update User by ID
app.patch("/users/:id", async (req, res) => {
  try {
    const { fullname, phonenumber, email, dob, gender } = req.body;

    // Parse the date from "YYYY/MM/DD" to a Date object
    const parsedDob = parseDate(dob);

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { fullname, phonenumber, email, dob: parsedDob, gender },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
});

// Delete User by ID
app.delete("/users/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    return res.status(200).json({
      message: "User deleted successfully",
      deletedUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
});

// 7. Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});