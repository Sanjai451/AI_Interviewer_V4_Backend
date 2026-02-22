import Log from "../models/Log";


export const saveLog = async (message) => {
  try {
    await Log.create({
      value: message
    });
  } catch (error) {
    console.error("Failed to save log:", error.message);
  }
};