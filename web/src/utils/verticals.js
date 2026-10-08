// One engine, two vocabularies: only labels change between Trade and Education (product layout, section 13).
export const VERTICALS = {
  trade: {
    key: 'trade', name: 'Skilled work', tagline: 'Electrician, plumber, mechanic, domestic help',
    noun: 'job', nouns: 'jobs', workLabel: 'What was the job?', workPlaceholder: 'e.g. Switchboard repair',
    workSuggestions: ['Switchboard repair', 'House wiring', 'Tap repair', 'Pipe fitting', 'Bike service', 'Deep cleaning'],
    customerLabel: 'Customer phone', amountLabel: 'Job amount', repeatLabel: 'Repeat customers',
    photoBefore: 'Before photo', photoAfter: 'After photo', ratingTags: ['On time', 'Clean work', 'Fair price', 'Polite', 'Good quality'],
  },
  education: {
    key: 'education', name: 'Teaching / Training', tagline: 'Tutor, coach, trainer',
    noun: 'session', nouns: 'sessions', workLabel: 'Subject or session', workPlaceholder: 'e.g. Class 10 Maths',
    workSuggestions: ['Class 10 Maths', 'Beginner Guitar', 'IELTS Prep', 'Spoken English', 'Class 12 Physics'],
    customerLabel: 'Parent or student phone', amountLabel: 'Session or monthly fee', repeatLabel: 'Students who continued',
    photoBefore: 'Attendance photo (optional)', photoAfter: 'Work sample (optional)', ratingTags: ['Explains well', 'Patient', 'Regular', 'Good results', 'Fair fee'],
  },
};
export const getVertical = (k) => VERTICALS[k] || VERTICALS.trade;
export const EDU_SUBJECTS = ['Maths', 'Science', 'English', 'Hindi', 'Physics', 'Chemistry', 'Music', 'Computer', 'Test prep'];
