import UserModel from "@/models/user.model";
import connectDb from "@/lib/connectDb";
import { type NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  // Connect to the database
  await connectDb();
  try {
    const formData = await request.formData();

    // Get fullName, username, and password from the formdata
    const fullName = formData.get("fullName") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    // Check if all fields are provided
    if (
      [fullName, username, password].some(
        (field) => field == null || field.trim() === "",
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Please provide all the fields" },
        { status: 400 },
      );
    }

    // Check if a user with the same username already exists
    const existingUserWithUsername = await UserModel.findOne({ username });

    if (existingUserWithUsername) {
      return NextResponse.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 },
      );
    }

    // Create the new user
    const newUser = new UserModel({
      fullName,
      username,
      password,
    });

    // Save the user — password gets hashed by the pre("save") hook on the model
    await newUser.save();

    // Return a success response
    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        data: {
          _id: String(newUser._id),
          fullName: newUser.fullName,
          username: newUser.username,
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.log(error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: 500 },
    );
  }
};