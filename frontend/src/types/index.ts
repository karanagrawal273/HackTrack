export interface IContest {
  _id: string;
  clist_id: number;
  name: string;
  platform: string;
  url: string;
  startTime: string; 
  endTime: string;
  durationSeconds: number; // Make sure this is present if you use it
}