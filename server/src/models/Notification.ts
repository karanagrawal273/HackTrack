// src/models/Notification.ts

import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotification extends Document {
    user: Types.ObjectId;
    contest: Types.ObjectId;
    minutesBefore: number; // e.g., 60 or 1440
    sendTime: Date; // The exact time the email should be sent
    status: 'pending' | 'sent' | 'failed';
}

const NotificationSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    contest: { type: Schema.Types.ObjectId, ref: 'Contest', required: true },
    minutesBefore: { type: Number, required: true },
    sendTime: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
});

// IMPORTANT: Unique index to ensure only ONE reminder of a specific type (e.g., 24hr) is created per user/contest
NotificationSchema.index({ user: 1, contest: 1, minutesBefore: 1 }, { unique: true });

const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;