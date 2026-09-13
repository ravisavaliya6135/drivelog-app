import type { StateInfo } from '../types';

const SITE_URL = 'https://drivehours.app';

export interface StateGuideSeo {
  title: string;
  description: string;
  intro: string;
  details?: readonly string[];
  officialSource?: {
    label: string;
    url: string;
  };
}

function defaultSeo(state: StateInfo): StateGuideSeo {
  const statText = state.statutoryCode ? ` under ${state.statutoryCode}` : '';
  return {
    title: `${state.name} ${state.requiredHours}-Hour Teen Driving Log Requirements | DriveHours`,
    description: `Track ${state.name}’s ${state.requiredHours} supervised practice hours, including ${state.requiredNightHours} at night. Keep an official DMV-compliant driving log before your road test.`,
    intro: `${state.name} requires learner permit drivers to complete at least ${state.requiredHours} hours of supervised driving practice, including ${state.requiredNightHours} hours at night${statText}. All practice sessions must be certified with dates, driving conditions, and supervisor signatures before scheduling the DMV road test.`,
  };
}

const STATE_OVERRIDES: Partial<Record<StateInfo['code'], StateGuideSeo>> = {
  CA: {
    title: 'California 50-Hour Driving Log: 10 Night Hours | DriveHours',
    description: 'Track California’s 50 supervised practice hours, including 10 at night. Keep a clear driving log and verify your road-test requirements.',
    intro: 'California requires learner permit drivers to complete at least 50 hours of supervised driving practice, including 10 hours at night, under Cal. Veh. Code § 12509. All practice sessions must be certified by a licensed adult supervisor before taking the DMV driving test for a provisional license.',
    details: [
      'Complete and log at least 50 hours of supervised practice.',
      'Complete at least 10 of those practice hours at night.',
      'Practice must be supervised by a licensed driver 25 years or older.',
      'Certify your driving log prior to your California DMV behind-the-wheel exam.',
    ],
    officialSource: {
      label: 'California DMV teen driver roadmap',
      url: 'https://www.dmv.ca.gov/portal/teen-drivers/',
    },
  },
  NC: {
    title: 'North Carolina 60-Hour Driving Log: 10 Night Hours | DriveHours',
    description: 'Track North Carolina’s 60 required driving hours, including 10 at night. Keep a digital or printed log ready for your licensing appointment.',
    intro: 'North Carolina requires Level 1 permit drivers to log at least 60 hours of supervised driving practice, including 10 hours at night, under N.C. Gen. Stat. § 20-11. All practice must be signed off by a supervising parent or guardian prior to Level 2 licensing.',
    details: [
      'Complete and log at least 60 hours of supervised driving.',
      'At least 10 of the required hours must occur during nighttime hours.',
      'Keep your driving log ready for your Level 2 licensing appointment.',
      'Supervising driver must be a parent, guardian, or approved licensed driver.',
    ],
    officialSource: {
      label: 'North Carolina DMV supervised driving requirements',
      url: 'https://www.ncdot.gov/dmv/license-id/driver-licenses/new-drivers/Documents/supervised-driving.pdf',
    },
  },
  OH: {
    title: 'Ohio 50-Hour Driving Log & BMV 5791 Affidavit | DriveHours',
    description: 'Track Ohio’s 50 driving hours, including 10 at night, and prepare the BMV 5791 Fifty-Hour Affidavit for your road test.',
    intro: 'Ohio requires temporary instruction permit holders under 18 to complete at least 50 hours of supervised driving practice, including 10 hours at night, under Ohio Rev. Code § 4507.05. Drivers must present a completed BMV 5791 Fifty-Hour Affidavit at their road test.',
    details: [
      'Complete at least 50 hours of supervised driving.',
      'Include at least 10 hours of night driving.',
      'Bring the completed BMV 5791 Fifty-Hour Affidavit to the driving test.',
      'Supervision must be provided by a licensed parent, guardian, or certified driving instructor.',
    ],
    officialSource: {
      label: 'Ohio BMV graduated driver licensing requirements',
      url: 'https://bmv.ohio.gov/dl-gdl.aspx',
    },
  },
};

export function getStateGuideCanonical(state: StateInfo): string {
  return `${SITE_URL}/dmv/${state.code.toLowerCase()}`;
}

export function getStateGuideSeo(state: StateInfo): StateGuideSeo {
  return STATE_OVERRIDES[state.code] ?? defaultSeo(state);
}
