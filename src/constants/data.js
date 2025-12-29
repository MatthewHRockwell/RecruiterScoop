export const APP_ID = 'recruiter-scoop';

export const STAGES = [
  { id: 'initial', label: 'Initial Chat', desc: 'Screening call.' },
  { id: 'submitted', label: 'Submitted', desc: 'Resume passed to HM.' },
  { id: 'interviewed', label: 'Interviewed', desc: 'Met Hiring Manager.' },
  { id: 'assessment', label: 'Assessment', desc: 'Take-home/Technical.' },
  { id: 'offer', label: 'Offer Stage', desc: 'Salary/Terms negotiation.' }
];

export const SCOOP_TAGS = [
  { id: 'salary_transparency', label: 'Salary Provided', type: 'positive', desc: 'Range disclosed in first interaction.' },
  { id: 'timely_feedback', label: 'Timely Feedback', type: 'positive', desc: 'Updates provided within 48h.' },
  { id: 'accurate_role', label: 'Accurate Role', type: 'positive', desc: 'Job matched description perfectly.' },
  { id: 'ghosted', label: 'Process Ghosting', type: 'negative', desc: 'Communication ceased without closure.' },
  { id: 'late_feedback', label: 'Delayed Feedback', type: 'negative', desc: 'Wait times exceeded promises.' },
  { id: 'misleading', label: 'Misleading Info', type: 'negative', desc: 'Role/Salary changed during process.' },
  { id: 'fake_listing', label: 'Ghost/Fake Job', type: 'critical', desc: 'Position does not exist.' },
  { id: 'pay_to_play', label: 'Pay to Play/MLM', type: 'critical', desc: 'Required payment or recruitment.' },
  { id: 'data_mining', label: 'Data Mining', type: 'critical', desc: 'Excessive PII requested early.' }
];