import { Schema } from 'mongoose';

export const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    googleId: { type: String, required: true, unique: true },
    googleAccessToken: { type: String, required: true },
    googleRefreshToken: { type: String },
    profilePicture: String,
  },
  { timestamps: true },
);

// Text index for search
UserSchema.index({ name: 'text', email: 'text' });
