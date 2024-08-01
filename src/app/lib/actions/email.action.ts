
import Email from "../database/models/email.model";

import mongoose from "mongoose";


export async function findEmailByEmail(email: string) {
  return await Email.findOne({ email });
}

export async function createEmail(email: string) {
  const newEmail = new Email({ email });
  return await newEmail.save();
}