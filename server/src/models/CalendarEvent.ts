// src/models/CalendarEvent.ts

import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICalendarEvent extends Document {
    user: Types.ObjectId;
    contest: Types.ObjectId;
    googleEventId: string; // The ID assigned by Google Calendar
    createdAt: Date;
}

const CalendarEventSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    contest: { type: Schema.Types.ObjectId, ref: 'Contest', required: true },
    googleEventId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

// IMPORTANT: Ensure a unique index to prevent duplicate records
CalendarEventSchema.index({ user: 1, contest: 1 }, { unique: true });

const CalendarEvent = mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);

export default CalendarEvent;