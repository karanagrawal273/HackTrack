import { Schema, model, Document } from 'mongoose';

// Interface for the Contest document
export interface IContest extends Document {
  clist_id: number;
  name: string;
  platform: string;
  url: string;
  startTime: Date;
  endTime: Date;
  durationSeconds: number;
}

const contestSchema = new Schema<IContest>({
  clist_id: { type: Number, required: true, unique: true }, // To prevent duplicates
  name: { type: String, required: true },
  platform: { type: String, required: true },
  url: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  durationSeconds: { type: Number, required: true },
}, { timestamps: true });

const Contest = model<IContest>('Contest', contestSchema);
export default Contest;