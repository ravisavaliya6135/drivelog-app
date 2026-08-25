export interface DriveEntry {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // ISO datetime string
  endTime: string; // ISO datetime string
  durationMinutes: number;
  miles: number;
  dayNight: 'day' | 'night';
  weather: string;
  roadType: string;
  notes: string;
  isVerified: boolean;
  driverId: string;
  vehicleId: string;
  initials: string; // supervising adult initials per entry
  state: string; // 2-letter state code
}

export interface DriverProfile {
  id: string;
  name: string;
  role: 'parent' | 'teen';
  phone: string;
  isPrimaryDriver: boolean;
}

export interface VehicleProfile {
  id: string;
  name: string; // e.g., "Mom's Honda"
  make: string;
  model: string;
  year: string;
  licensePlate: string;
}

export interface AppState {
  drivers: DriverProfile[];
  vehicles: VehicleProfile[];
  currentDrive: DriveEntry | null;
  totalHours: number;
  todayEntries: DriveEntry[];
}

export interface StateInfo {
  code: string;
  name: string;
  requiredHours: number;
  requiredNightHours: number;
  requiresSpecificApp: boolean;
  appName?: string;
  /** Official state DMV form name for supervised driving logs (Top-5 states) */
  dmvFormName?: string;
  /** Link to the official state PDF form for reference */
  dmvFormUrl?: string;
  /** State-specific legal declaration / perjury statement printed on the log */
  perjuryStatement?: string;
  /** Minimum learner's permit age (optional; populated where codified) */
  minPermitAge?: number;
  /** Minimum provisional license age (optional; populated where codified) */
  minLicenseAge?: number;
}

export const US_STATES: StateInfo[] = [
  { code: 'AL', name: 'Alabama', requiredHours: 50, requiredNightHours: 0, requiresSpecificApp: false },
  { code: 'AK', name: 'Alaska', requiredHours: 40, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'AZ', name: 'Arizona', requiredHours: 30, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'AR', name: 'Arkansas', requiredHours: 40, requiredNightHours: 10, requiresSpecificApp: false },
  {
    code: 'CA',
    name: 'California',
    requiredHours: 50,
    requiredNightHours: 10,
    requiresSpecificApp: false,
    minPermitAge: 15.5,
    minLicenseAge: 16,
    dmvFormName: 'Supervised Driving Log',
    dmvFormUrl: 'https://www.dmv.ca.gov/portal/teen-drivers/',
    perjuryStatement:
      'I certify under penalty of perjury under the laws of the State of California that the driving hours recorded above were completed as stated, under the supervision of a licensed driver 25 years of age or older, in accordance with California Vehicle Code requirements.',
  },
  { code: 'CO', name: 'Colorado', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'CT', name: 'Connecticut', requiredHours: 40, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'DE', name: 'Delaware', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false },
  {
    code: 'FL',
    name: 'Florida',
    requiredHours: 50,
    requiredNightHours: 10,
    requiresSpecificApp: false,
    minPermitAge: 15,
    minLicenseAge: 16,
    dmvFormName: 'HSMV 71143',
    dmvFormUrl: 'https://flhsmv.gov/pdf/forms/71143.pdf',
    perjuryStatement:
      'I hereby certify that the above is a true and accurate record of the supervised driving hours completed by the named minor, and that certification of falsified information may result in the denial or revocation of the minor\'s driver license pursuant to Florida law.',
  },
  { code: 'GA', name: 'Georgia', requiredHours: 40, requiredNightHours: 6, requiresSpecificApp: false },
  { code: 'HI', name: 'Hawaii', requiredHours: 40, requiredNightHours: 10, requiresSpecificApp: true, appName: 'Hawaii Driver Education' },
  { code: 'ID', name: 'Idaho', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'IL', name: 'Illinois', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'IN', name: 'Indiana', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'IA', name: 'Iowa', requiredHours: 20, requiredNightHours: 2, requiresSpecificApp: false },
  { code: 'KS', name: 'Kansas', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'KY', name: 'Kentucky', requiredHours: 60, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'LA', name: 'Louisiana', requiredHours: 50, requiredNightHours: 15, requiresSpecificApp: false },
  { code: 'ME', name: 'Maine', requiredHours: 70, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'MD', name: 'Maryland', requiredHours: 60, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'MA', name: 'Massachusetts', requiredHours: 40, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'MI', name: 'Michigan', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'MN', name: 'Minnesota', requiredHours: 50, requiredNightHours: 15, requiresSpecificApp: false },
  { code: 'MS', name: 'Mississippi', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'MO', name: 'Missouri', requiredHours: 40, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'MT', name: 'Montana', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'NE', name: 'Nebraska', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'NV', name: 'Nevada', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'NH', name: 'New Hampshire', requiredHours: 40, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'NJ', name: 'New Jersey', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'NM', name: 'New Mexico', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false },
  {
    code: 'NY',
    name: 'New York',
    requiredHours: 50,
    requiredNightHours: 15,
    requiresSpecificApp: false,
    minPermitAge: 16,
    minLicenseAge: 16.5,
    dmvFormName: 'MV-262',
    dmvFormUrl: 'https://dmv.ny.gov/forms/mv262.pdf',    perjuryStatement:
      'I certify that I am the parent, guardian, or person in loco parentis of the junior licensee named above, that the statements on this Certification of Supervised Driving are true, and that I understand this certification is made subject to the penalties of New York Vehicle and Traffic Law.',
  },
  { code: 'NC', name: 'North Carolina', requiredHours: 60, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'ND', name: 'North Dakota', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'OH', name: 'Ohio', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: true, appName: 'Ohio Driver Log' },
  { code: 'OK', name: 'Oklahoma', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'OR', name: 'Oregon', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false },
  {
    code: 'PA',
    name: 'Pennsylvania',
    requiredHours: 65,
    requiredNightHours: 10,
    requiresSpecificApp: false,
    minPermitAge: 16,
    minLicenseAge: 16.5,
    dmvFormName: 'DL-180C',
    dmvFormUrl: 'https://www.pa.gov/content/dam/copapwp-pagov/en/penndot/documents/public/dvspubsforms/bdl/bdl-form/dl-180c.pdf',
    perjuryStatement:
      'I certify that the above-named applicant has completed the supervised skill-building driving hours recorded on this form, that the entries are true and correct to the best of my knowledge, and that falsification of this record may result in prosecution under 18 Pa.C.S. § 4904 relating to unsworn falsification to authorities.',
  },
  { code: 'RI', name: 'Rhode Island', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'SC', name: 'South Carolina', requiredHours: 40, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'SD', name: 'South Dakota', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'TN', name: 'Tennessee', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false },
  {
    code: 'TX',
    name: 'Texas',
    requiredHours: 30,
    requiredNightHours: 10,
    requiresSpecificApp: true,
    appName: 'Texas Drivers Handbook / ITTD',
    minPermitAge: 15,
    minLicenseAge: 16,
    dmvFormName: 'Supervised Driving Log',
    dmvFormUrl: 'https://www.dps.texas.gov/section/driver-license/texas-provisional-license-teen',
    perjuryStatement:
      'I affirm that under penalty of perjury under the laws of the State of Texas that the information recorded in this practice driving log is true and correct, and that all listed hours were completed under the supervision of a qualified licensed driver in accordance with Texas Transportation Code requirements.',
  },
  { code: 'UT', name: 'Utah', requiredHours: 40, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'VT', name: 'Vermont', requiredHours: 40, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'VA', name: 'Virginia', requiredHours: 45, requiredNightHours: 15, requiresSpecificApp: false },
  { code: 'WA', name: 'Washington', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'WV', name: 'West Virginia', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'WI', name: 'Wisconsin', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false },
  { code: 'WY', name: 'Wyoming', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false },
];

export const WEATHER_OPTIONS = [
  'Clear', 'Cloudy', 'Rain', 'Snow', 'Fog', 'Windy'
];

export const ROAD_TYPE_OPTIONS = [
  'Residential', 'City/Urban', 'Highway/Freeway', 'Rural', 'Parking Lot'
];

export const SKILLS_OPTIONS = [
  'Starting/Stopping', 'Turning', 'Lane Changes', 'Highway Merging',
  'Parking (Parallel)', 'Parking (Perpendicular)', 'Parking (Angle)',
  'Backing Up', 'Three-Point Turn', 'Night Driving', 'Rain/Wet Roads',
  'Highway Driving', 'City Driving', 'Rural Roads', 'Roundabouts'
];