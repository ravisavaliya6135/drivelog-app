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
  return {
    title: `${state.name} Teen Driving Log Requirements | DriveHours`,
    description: `Track your ${state.name} supervised driving hours, including ${state.requiredNightHours} required night hours. Print a clear practice log before your road test.`,
    intro: `${state.name} requires ${state.requiredHours} supervised driving hours, including at least ${state.requiredNightHours} hours at night.`,
  };
}

const STATE_OVERRIDES: Partial<Record<StateInfo['code'], StateGuideSeo>> = {
  CA: {
    title: 'California 50-Hour Driving Log: 10 Night Hours | DriveHours',
    description: 'Track California’s 50 supervised practice hours, including 10 at night. Keep a clear driving log and verify your road-test requirements.',
    intro: 'California teen drivers need 50 hours of supervised practice, including 10 hours at night, before the driving test.',
    details: [
      'Your supervised practice must total at least 50 hours.',
      'At least 10 of those hours must be completed at night.',
      'Keep a parent-supervised practice record before the driving test.',
    ],
    officialSource: {
      label: 'California DMV teen driver roadmap',
      url: 'https://www.dmv.ca.gov/portal/teen-drivers/',
    },
  },
  NC: {
    title: 'North Carolina 60-Hour Driving Log: 10 Night Hours | DriveHours',
    description: 'Track North Carolina’s 60 required driving hours, including 10 at night. Keep a digital or printed log ready for your licensing appointment.',
    intro: 'North Carolina teen drivers need a 60-hour driving log, including 10 nighttime hours, before moving to the next license level.',
    details: [
      'Complete and log at least 60 hours of driving.',
      'At least 10 of the required hours must occur during nighttime hours.',
      'Keep your driving log ready for your Level 2 licensing appointment.',
    ],
    officialSource: {
      label: 'North Carolina DMV supervised driving requirements',
      url: 'https://www.ncdot.gov/dmv/license-id/driver-licenses/new-drivers/Documents/supervised-driving.pdf',
    },
  },
  OH: {
    title: 'Ohio 50-Hour Driving Log & BMV 5791 Affidavit | DriveHours',
    description: 'Track Ohio’s 50 driving hours, including 10 at night, and prepare the BMV 5791 Fifty-Hour Affidavit for your road test.',
    intro: 'Ohio teen drivers need 50 hours of driving, including 10 at night, and a completed BMV 5791 affidavit for the driving test.',
    details: [
      'Complete at least 50 hours of supervised driving.',
      'Include at least 10 hours of night driving.',
      'Bring the completed BMV 5791 Fifty-Hour Affidavit to the driving test.',
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
