import { connectToDatabase } from "../database/mongoose";
import Email from "../database/models/email.model";
import { handleError } from "../utils";


export async function createEmail(email: string) {
    try {
      await connectToDatabase();
  
      const newEmail = await Email.create({email});
      return JSON.parse(JSON.stringify(newEmail));
    } catch (error) {
      handleError(error);
    }
  }

  export async function findEmailByEmail(email: string) {
    return await Email.findOne({ email });
  }