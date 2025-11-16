import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  user: Types.ObjectId;
  contest: Types.ObjectId;
  sendTime: Date;
  status: 'pending' | 'sent' | 'failed';
  minutesBefore: number;
}

const notificationSchema = new Schema<INotification>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  contest: { type: Schema.Types.ObjectId, ref: 'Contest', required: true },
  sendTime: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  minutesBefore: { type: Number, required: true },
}, { timestamps: true });

// Add an index to efficiently query for pending notifications
notificationSchema.index({ status: 1, sendTime: 1 });

const Notification = model<INotification>('Notification', notificationSchema);
export default Notification;