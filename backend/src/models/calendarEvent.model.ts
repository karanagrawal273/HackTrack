import { Schema, model, Document, Types } from 'mongoose';

export interface ICalendarEvent extends Document {
  user: Types.ObjectId;
  contest: Types.ObjectId;
  googleEventId: string; // The ID returned by Google Calendar API
}

const calendarEventSchema = new Schema<ICalendarEvent>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  contest: { type: Schema.Types.ObjectId, ref: 'Contest', required: true },
  googleEventId: { type: String, required: true },
}, { timestamps: true });

// Ensure we don't store duplicate entries for the same user/contest pair
calendarEventSchema.index({ user: 1, contest: 1 }, { unique: true });

const CalendarEvent = model<ICalendarEvent>('CalendarEvent', calendarEventSchema);
export default CalendarEvent;