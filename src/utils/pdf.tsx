import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';
import type { DriveEntry, DriverProfile, VehicleProfile, StateInfo } from '../types';
import { US_STATES } from '../types';

// NOTE: We intentionally do NOT call Font.register here. @react-pdf/renderer
// ships built-in standard-14 fonts (Helvetica, Courier, etc.), so PDF export
// works 100% offline. Registering web fonts from a CDN would break the
// offline-first guarantee — the DMV log must be exportable without network.

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    lineHeight: 1.4,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottom: '1px solid #333',
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    width: 140,
    fontWeight: 'bold',
    color: '#334155',
  },
  infoValue: {
    flex: 1,
    color: '#0f172a',
  },
  table: {
    width: '100%',
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    color: 'white',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottom: '1px solid #e2e8f0',
    fontSize: 9,
  },
  tableRowEven: {
    backgroundColor: '#f8fafc',
  },
  cell: {
    paddingHorizontal: 4,
  },
  // Tabular mono font for all numbers (hours, miles, dates)
  cellMono: {
    fontFamily: 'Courier',
    fontSize: 8.5,
  },
  cellDate: { width: '12%', textAlign: 'center' },
  cellTime: { width: '15%', textAlign: 'center' },
  cellDuration: { width: '10%', textAlign: 'center' },
  cellDayNight: { width: '10%', textAlign: 'center' },
  cellMiles: { width: '8%', textAlign: 'center' },
  cellWeather: { width: '10%', textAlign: 'center' },
  cellRoadType: { width: '12%', textAlign: 'center' },
  cellSkills: { width: '15%' },
  cellInitials: { width: '8%', textAlign: 'center' },
  totalsRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 8,
    fontWeight: 'bold',
    borderTop: '2px solid #0f172a',
    fontSize: 10,
  },
  signatureSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: '1px solid #333',
  },
  signatureLine: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  signatureField: {
    flex: 1,
    marginRight: 20,
  },
  signatureLabel: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 40,
    textAlign: 'center',
    borderTop: '1px solid #333',
    paddingTop: 4,
  },
  perjuryBlock: {
    marginTop: 16,
    padding: 10,
    border: '1px solid #0f172a',
    borderRadius: 4,
    backgroundColor: '#f8fafc',
  },
  perjuryTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  perjuryText: {
    fontSize: 8,
    lineHeight: 1.5,
    color: '#334155',
  },
  disclaimer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: 4,
    fontSize: 8,
    color: '#92400e',
  },
});

interface PDFProps {
  drives: DriveEntry[];
  driver: DriverProfile;
  vehicle: VehicleProfile;
  state: StateInfo;
  totals: { day: number; night: number; total: number };
}

function PDFDocument({ drives, driver, vehicle, state, totals }: PDFProps) {
  const sortedDrives = [...drives].sort((a, b) =>
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  // A "specific" form name contains a form code (e.g. "MV-262", "HSMV 71143",
  // "DL-180C"); a generic one is just "Supervised Driving Log".
  const hasFormCode = Boolean(state.dmvFormName && /\d/.test(state.dmvFormName));

  // State-aware document title:
  //   coded form   -> "[State] Official Form [CODE] — Supervised Driving Log"
  //   generic form -> "[State] Supervised Driving Log"
  const docTitle = hasFormCode
    ? `${state.name} Official Form ${state.dmvFormName} — Supervised Driving Log`
    : `${state.name} Supervised Driving Log`;
  const docSubtitle = hasFormCode
    ? `Official Format — Based on ${state.name} DMV Form ${state.dmvFormName}`
    : state.dmvFormName
      ? `Official Format — Per ${state.name} DMV Requirements`
      : 'Universal DMV Format — All 50 States';

  return (
    <Document>
              <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{docTitle}</Text>
            <Text style={styles.subtitle}>{docSubtitle}</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={{ fontWeight: 'bold' }}>{state.name}</Text>
            <Text>Required: {state.requiredHours}h total, {state.requiredNightHours}h night</Text>
          </View>
        </View>

        {/* Driver & Vehicle Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver & Vehicle Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Student Driver:</Text>
            <Text style={styles.infoValue}>{driver.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Supervising Adult:</Text>
            <Text style={styles.infoValue}>
              {drives[0] ? drives.map(d => d.initials).filter((v, i, a) => a.indexOf(v) === i).join(', ') : 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vehicle:</Text>
            <Text style={styles.infoValue}>{vehicle.name} ({vehicle.year} {vehicle.make} {vehicle.model})</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>License Plate:</Text>
            <Text style={styles.infoValue}>{vehicle.licensePlate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Report Generated:</Text>
            <Text style={[styles.infoValue, styles.cellMono]}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          </View>
        </View>

        {/* Drive Log Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Drive Entries</Text>
          
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, styles.cellDate]}>Date</Text>
            <Text style={[styles.cell, styles.cellTime]}>Start - End</Text>
            <Text style={[styles.cell, styles.cellDuration]}>Duration</Text>
            <Text style={[styles.cell, styles.cellDayNight]}>Day/Night</Text>
            <Text style={[styles.cell, styles.cellMiles]}>Miles</Text>
            <Text style={[styles.cell, styles.cellWeather]}>Weather</Text>
            <Text style={[styles.cell, styles.cellRoadType]}>Road Type</Text>
            <Text style={[styles.cell, styles.cellSkills]}>Skills Practiced</Text>
            <Text style={[styles.cell, styles.cellInitials]}>Initials</Text>
          </View>

          {sortedDrives.map((entry, index) => (
            <View key={entry.id} style={[styles.tableRow, ...(index % 2 === 1 ? [styles.tableRowEven] : [])]}>
              <Text style={[styles.cell, styles.cellDate, styles.cellMono]}>{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
              <Text style={[styles.cell, styles.cellTime, styles.cellMono]}>
                {new Date(entry.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - 
                {new Date(entry.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </Text>
              <Text style={[styles.cell, styles.cellDuration, styles.cellMono]}>{entry.durationMinutes} min</Text>
              <Text style={[styles.cell, styles.cellDayNight]}>{entry.dayNight === 'day' ? 'Day' : 'Night'}</Text>
              <Text style={[styles.cell, styles.cellMiles, styles.cellMono]}>{entry.miles} mi</Text>
              <Text style={[styles.cell, styles.cellWeather]}>{entry.weather}</Text>
              <Text style={[styles.cell, styles.cellRoadType]}>{entry.roadType}</Text>
              <Text style={[styles.cell, styles.cellSkills]}>{entry.notes || 'General practice'}</Text>
              <Text style={[styles.cell, styles.cellInitials, styles.cellMono]}>{entry.initials}</Text>
            </View>
          ))}

          {/* Totals Row */}
          <View style={styles.totalsRow}>
            <Text style={[styles.cell, styles.cellDate]}>TOTALS</Text>
            <Text style={[styles.cell, styles.cellTime]}></Text>
            <Text style={[styles.cell, styles.cellDuration, styles.cellMono]}>{(totals.total / 60).toFixed(1)}h</Text>
            <Text style={[styles.cell, styles.cellDayNight, styles.cellMono]}>{(totals.day / 60).toFixed(1)}h / {(totals.night / 60).toFixed(1)}h</Text>
            <Text style={[styles.cell, styles.cellMiles, styles.cellMono]}>{drives.reduce((sum, d) => sum + d.miles, 0)} mi</Text>
            <Text style={[styles.cell, styles.cellWeather]}></Text>
            <Text style={[styles.cell, styles.cellRoadType]}></Text>
            <Text style={[styles.cell, styles.cellSkills]}></Text>
            <Text style={[styles.cell, styles.cellInitials]}></Text>
          </View>
        </View>

        {/* Progress vs Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress vs State Requirements</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Hours Logged:</Text>
            <Text style={[styles.infoValue, styles.cellMono]}>{(totals.total / 60).toFixed(1)}h / {state.requiredHours}h required</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Night Hours Logged:</Text>
            <Text style={[styles.infoValue, styles.cellMono]}>{(totals.night / 60).toFixed(1)}h / {state.requiredNightHours}h required</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Day Hours Logged:</Text>
            <Text style={[styles.infoValue, styles.cellMono]}>{(totals.day / 60).toFixed(1)}h</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Miles:</Text>
            <Text style={[styles.infoValue, styles.cellMono]}>{drives.reduce((sum, d) => sum + d.miles, 0)} mi</Text>
          </View>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <Text style={styles.sectionTitle}>Certification & Signatures</Text>
          {state.perjuryStatement ? (
            <Text style={{ fontSize: 9, marginBottom: 16, color: '#334155' }}>
              {state.perjuryStatement}
            </Text>
          ) : (
            <Text style={{ fontSize: 9, marginBottom: 16, color: '#334155' }}>
              I certify that the above driving hours were completed under my supervision as required by {state.name} law.
            </Text>
          )}
          
          <View style={styles.signatureLine}>
            <View style={styles.signatureField}>
              <Text style={styles.signatureLabel}>Supervising Adult Signature</Text>
            </View>
            <View style={styles.signatureField}>
              <Text style={styles.signatureLabel}>Date</Text>
            </View>
          </View>
          
          <View style={styles.signatureLine}>
            <View style={styles.signatureField}>
              <Text style={styles.signatureLabel}>Student Driver Signature</Text>
            </View>
            <View style={styles.signatureField}>
              <Text style={styles.signatureLabel}>Date</Text>
            </View>
          </View>

          <View style={styles.signatureLine}>
            <View style={styles.signatureField}>
              <Text style={styles.signatureLabel}>Parent/Guardian Signature (if different from supervising adult)</Text>
            </View>
            <View style={styles.signatureField}>
              <Text style={styles.signatureLabel}>Date</Text>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text>
            <Text style={{ fontWeight: 'bold' }}>Important:</Text> This log is a record-keeping tool. Requirements vary by state. 
            Please verify current requirements with your local DMV before your licensing appointment. 
            Some states may require a specific form or digital submission. This document does not guarantee license approval.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generatePDF(
  drives: DriveEntry[],
  driver: DriverProfile,
  vehicle: VehicleProfile,
  stateCode: string
): Promise<Blob> {
  const state = US_STATES.find(s => s.code === stateCode) || US_STATES.find(s => s.code === 'CA')!;
  const totals = drives.reduce(
    (acc, entry) => {
      if (entry.dayNight === 'day') {
        acc.day += entry.durationMinutes;
      } else {
        acc.night += entry.durationMinutes;
      }
      acc.total += entry.durationMinutes;
      return acc;
    },
    { day: 0, night: 0, total: 0 }
  );

  const blob = await pdf(
    <PDFDocument
      drives={drives}
      driver={driver}
      vehicle={vehicle}
      state={state}
      totals={totals}
    />
  ).toBlob();

  return blob;
}

export function downloadPDF(
  blob: Blob,
  filename: string = 'DriveLog-Supervised-Driving-Log.pdf'
): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}