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
  /** Minimum provisional license age (optional; populated where codified) */
  minLicenseAge?: number;
  /** Codified state vehicle code / statutory reference for supervised hours */
  statutoryCode?: string;
}

export const US_STATES: StateInfo[] = [
  { code: 'AL', name: 'Alabama', requiredHours: 50, requiredNightHours: 0, requiresSpecificApp: false, statutoryCode: 'Ala. Code § 32-6-8' },
  { code: 'AK', name: 'Alaska', requiredHours: 40, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'Alaska Stat. § 28.15.057' },
  { code: 'AZ', name: 'Arizona', requiredHours: 30, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'Ariz. Rev. Stat. § 28-3174' },
  { code: 'AR', name: 'Arkansas', requiredHours: 40, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'Ark. Code Ann. § 27-16-702' },
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
    statutoryCode: 'Cal. Veh. Code § 12509',
    perjuryStatement:
      'I certify under penalty of perjury under the laws of the State of California that the driving hours recorded above were completed as stated, under the supervision of a licensed driver 25 years of age or older, in accordance with California Vehicle Code requirements.',
  },
  { code: 'CO', name: 'Colorado', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'Colo. Rev. Stat. § 42-2-106' },
  { code: 'CT', name: 'Connecticut', requiredHours: 40, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'Conn. Gen. Stat. § 14-36' },
  { code: 'DE', name: 'Delaware', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: '21 Del. C. § 2710' },
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
    statutoryCode: 'Fla. Stat. § 322.05',
    perjuryStatement:
      'I hereby certify that the above is a true and accurate record of the supervised driving hours completed by the named minor, and that certification of falsified information may result in the denial or revocation of the minor\'s driver license pursuant to Florida law.',
  },
  { code: 'GA', name: 'Georgia', requiredHours: 40, requiredNightHours: 6, requiresSpecificApp: false, statutoryCode: 'O.C.G.A. § 40-5-24' },
  { code: 'HI', name: 'Hawaii', requiredHours: 40, requiredNightHours: 10, requiresSpecificApp: true, appName: 'Hawaii Driver Education', statutoryCode: 'Haw. Rev. Stat. § 286-108' },
  { code: 'ID', name: 'Idaho', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'Idaho Code § 49-307' },
  { code: 'IL', name: 'Illinois', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: '625 ILCS 5/6-107' },
  { code: 'IN', name: 'Indiana', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'Ind. Code § 9-24-3-2.5' },
  { code: 'IA', name: 'Iowa', requiredHours: 20, requiredNightHours: 2, requiresSpecificApp: false, statutoryCode: 'Iowa Code § 321.180B' },
  { code: 'KS', name: 'Kansas', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'Kan. Stat. Ann. § 8-2,101' },
  { code: 'KY', name: 'Kentucky', requiredHours: 60, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'Ky. Rev. Stat. Ann. § 186.452' },
  { code: 'LA', name: 'Louisiana', requiredHours: 50, requiredNightHours: 15, requiresSpecificApp: false, statutoryCode: 'La. Stat. Ann. § 32:405.1' },
  { code: 'ME', name: 'Maine', requiredHours: 70, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: '29-A M.R.S. § 1304' },
  { code: 'MD', name: 'Maryland', requiredHours: 60, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'Md. Code, Transp. § 16-105' },
  { code: 'MA', name: 'Massachusetts', requiredHours: 40, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'Mass. Gen. Laws ch. 90 § 8' },
  { code: 'MI', name: 'Michigan', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'Mich. Comp. Laws § 257.310e' },
  { code: 'MN', name: 'Minnesota', requiredHours: 50, requiredNightHours: 15, requiresSpecificApp: false, statutoryCode: 'Minn. Stat. § 171.05' },
  { code: 'MS', name: 'Mississippi', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'Miss. Code Ann. § 63-1-21' },
  { code: 'MO', name: 'Missouri', requiredHours: 40, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'Mo. Rev. Stat. § 302.178' },
  { code: 'MT', name: 'Montana', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'Mont. Code Ann. § 61-5-106' },
  { code: 'NE', name: 'Nebraska', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'Neb. Rev. Stat. § 60-4,124' },
  { code: 'NV', name: 'Nevada', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'Nev. Rev. Stat. § 483.2521' },
  { code: 'NH', name: 'New Hampshire', requiredHours: 40, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'N.H. Rev. Stat. Ann. § 263:25' },
  { code: 'NJ', name: 'New Jersey', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'N.J. Stat. Ann. § 39:3-13' },
  { code: 'NM', name: 'New Mexico', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'N.M. Stat. Ann. § 66-5-8' },
  {
    code: 'NY',
    name: 'New York',
    requiredHours: 50,
    requiredNightHours: 15,
    requiresSpecificApp: false,
    minPermitAge: 16,
    minLicenseAge: 16.5,
    dmvFormName: 'MV-262',
    dmvFormUrl: 'https://dmv.ny.gov/forms/mv262.pdf',
    statutoryCode: 'N.Y. Veh. & Traf. Law § 502',
    perjuryStatement:
      'I certify that I am the parent, guardian, or person in loco parentis of the junior licensee named above, that the statements on this Certification of Supervised Driving are true, and that I understand this certification is made subject to the penalties of New York Vehicle and Traffic Law.',
  },
  { code: 'NC', name: 'North Carolina', requiredHours: 60, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'N.C. Gen. Stat. § 20-11' },
  { code: 'ND', name: 'North Dakota', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'N.D. Cent. Code § 39-06-04' },
  { code: 'OH', name: 'Ohio', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: true, appName: 'Ohio Driver Log', statutoryCode: 'Ohio Rev. Code § 4507.05' },
  { code: 'OK', name: 'Oklahoma', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'Okla. Stat. tit. 47 § 6-105' },
  { code: 'OR', name: 'Oregon', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'Or. Rev. Stat. § 807.065' },
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
    statutoryCode: '75 Pa. C.S. § 1505',
    perjuryStatement:
      'I certify that the above-named applicant has completed the supervised skill-building driving hours recorded on this form, that the entries are true and correct to the best of my knowledge, and that falsification of this record may result in prosecution under 18 Pa.C.S. § 4904 relating to unsworn falsification to authorities.',
  },
  { code: 'RI', name: 'Rhode Island', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'R.I. Gen. Laws § 31-10-6' },
  { code: 'SC', name: 'South Carolina', requiredHours: 40, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'S.C. Code Ann. § 56-1-176' },
  { code: 'SD', name: 'South Dakota', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'S.D. Codified Laws § 32-12-11' },
  { code: 'TN', name: 'Tennessee', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'Tenn. Code Ann. § 55-50-311' },
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
    statutoryCode: 'Tex. Transp. Code § 521.222',
    perjuryStatement:
      'I affirm that under penalty of perjury under the laws of the State of Texas that the information recorded in this practice driving log is true and correct, and that all listed hours were completed under the supervision of a qualified licensed driver in accordance with Texas Transportation Code requirements.',
  },
  { code: 'UT', name: 'Utah', requiredHours: 40, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'Utah Code Ann. § 53-3-210.5' },
  { code: 'VT', name: 'Vermont', requiredHours: 40, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: '23 V.S.A. § 607a' },
  { code: 'VA', name: 'Virginia', requiredHours: 45, requiredNightHours: 15, requiresSpecificApp: false, statutoryCode: 'Va. Code § 46.2-334.01' },
  { code: 'WA', name: 'Washington', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'Wash. Rev. Code § 46.20.055' },
  { code: 'WV', name: 'West Virginia', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'W. Va. Code § 17B-2-3a' },
  { code: 'WI', name: 'Wisconsin', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'Wis. Stat. § 343.07' },
  { code: 'WY', name: 'Wyoming', requiredHours: 50, requiredNightHours: 10, requiresSpecificApp: false, statutoryCode: 'Wyo. Stat. Ann. § 31-7-110' },
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