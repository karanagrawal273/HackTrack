import { IContest } from '../types';

// Dates must be in YYYYMMDDTHHMMSSZ format for Google Calendar
const formatDateForGoogle = (date: Date): string => {
  return date.toISOString().replace(/-|:|\.\d{3}/g, '');
};

export const generateGoogleCalendarLink = (contest: IContest): string => {
  const G_CAL_URL = 'https://www.google.com/calendar/render?action=TEMPLATE';
  
  const startTime = formatDateForGoogle(new Date(contest.startTime));
  const endTime = formatDateForGoogle(new Date(contest.endTime));
  
  const params = new URLSearchParams({
    text: contest.name,
    dates: `${startTime}/${endTime}`,
    details: `Platform: ${contest.platform}\nLink: ${contest.url}`,
    location: contest.platform,
  });

  return `${G_CAL_URL}&${params.toString()}`;
};