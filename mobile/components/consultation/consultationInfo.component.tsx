import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { consultationService, ConsultationDetails, Prescription, LabResult } from "@/services/consultationService";

type ConsultationInfoProps = {
  tab: number;
  consultationId?: string;
};

const ConsultationInfo = ({ tab, consultationId }: ConsultationInfoProps) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  
  const [consultationDetails, setConsultationDetails] = useState<ConsultationDetails | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (consultationId) {
      fetchConsultationData();
    }
  }, [consultationId, tab]);

  const fetchConsultationData = async () => {
    if (!consultationId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (tab === 0) {
        // Fetch consultation details for Overview tab
        const details = await consultationService.getConsultationById(consultationId);
        setConsultationDetails(details);
      } else if (tab === 1) {
        // Fetch prescriptions for Prescriptions tab
        const prescriptionsData = await consultationService.getConsultationPrescriptions(consultationId);
        setPrescriptions(prescriptionsData);
      } else if (tab === 2) {
        // Fetch lab results for Lab Results tab
        const labResultsData = await consultationService.getConsultationLabResults(consultationId);
        setLabResults(labResultsData);
      }
    } catch (err: any) {
      console.error('Error fetching consultation data:', err);
      setError(err.message || 'Failed to load consultation data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateDuration = (startDate: string, endDate?: string) => {
    if (!endDate) return 'N/A';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };
  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        marginBottom: 20,
        alignItems: "center",
      }}
    >
      {tab === 0 && (
        <View
          style={[
            styles.consultDetailCard,
            {
              backgroundColor: themeColors.subCard,
              borderColor: themeColors.border,
            },
          ]}
        >
          {/* Title */}
          <Text style={[styles.title, { color: themeColors.text }]}>
            Consultation Information
          </Text>

          {/* Date, Time, Status Row */}
          <View style={styles.rowBetween}>
            <View>
              <View style={styles.row}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={themeColors.subText}
                />
                <Text style={[styles.label, { color: themeColors.subText }]}>
                  <Text style={[styles.bold, { color: themeColors.text }]}>
                    Date:{" "}
                  </Text>
                  {consultationDetails ? formatDate(consultationDetails.consultationDate) : '2024-01-10'}
                </Text>
              </View>

              <View style={[styles.row, { marginTop: 8 }]}>
                <Ionicons
                  name="videocam-outline"
                  size={20}
                  color={themeColors.subText}
                />
                <Text style={[styles.label, { color: themeColors.subText }]}>
                  <Text style={[styles.bold, { color: themeColors.text }]}>
                    {" "}
                    Type:{" "}
                  </Text>
                  {consultationDetails?.consultationMode || 'Video Call'}
                </Text>
              </View>
              <View style={[styles.row, { marginTop: 8 }]}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={themeColors.subText}
                />
                <Text style={[styles.label, { color: themeColors.subText }]}>
                  <Text style={[styles.bold, { color: themeColors.text }]}>
                    {" "}
                    Duration:{" "}
                  </Text>
                  {consultationDetails ? calculateDuration(consultationDetails.consultationDate, consultationDetails.updatedAt) : '30m 47s'}
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                justifyContent: "space-between",
              }}
            >
              <View style={[styles.row, { marginBottom: 20 }]}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={themeColors.subText}
                />
                <Text style={[styles.label, { color: themeColors.subText }]}>
                  <Text style={[styles.bold, { color: themeColors.text }]}>
                    Time:{" "}
                  </Text>
                  {consultationDetails ? formatTime(consultationDetails.consultationDate) : '10:00 AM'}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: themeColors.success },
                ]}
              >
                <Text style={styles.statusBadgeText}>{consultationDetails?.status || 'completed'}</Text>
              </View>
            </View>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { borderColor: themeColors.border }]} />

          {/* Reason for Visit */}
          <Text style={[styles.sectionLabel, { color: themeColors.text }]}>
            Reason for Visit
          </Text>
          <Text style={[styles.sectionValue, { color: themeColors.subText }]}>
            {consultationDetails?.reasonForVisit || 'Follow-up consultation for hypertension management'}
          </Text>

          {/* Diagnosis */}
          <Text style={[styles.sectionLabel, { color: themeColors.text }]}>
            Diagnosis
          </Text>
          <Text style={[styles.sectionValue, { color: themeColors.subText }]}>
            {loading ? 'Loading diagnosis...' : error ? 'Unable to load diagnosis' : 'Common Cold'}
          </Text>
        </View>
      )}
      {tab === 1 && (
        <View
          style={[
            styles.consultDetailCard,
            {
              backgroundColor: themeColors.subCard,
              borderColor: themeColors.border,
            },
          ]}
        >
          <Text style={[styles.sectionLabel, { color: themeColors.text }]}>
            Prescriptions
          </Text>
          {loading ? (
            <Text style={[styles.sectionValue, { color: themeColors.subText }]}>Loading prescriptions...</Text>
          ) : error ? (
            <Text style={[styles.sectionValue, { color: themeColors.subText }]}>Unable to load prescriptions</Text>
          ) : prescriptions.length > 0 ? (
            prescriptions.map((prescription, index) => (
              <View key={prescription.prescriptionId} style={{ marginBottom: 12 }}>
                <Text style={[styles.prescriptionName, { color: themeColors.text }]}>
                  {prescription.medicationName}
                </Text>
                <Text style={[styles.sectionValue, { color: themeColors.subText }]}>
                  {prescription.dosage} - {prescription.frequency}
                </Text>
                <Text style={[styles.sectionValue, { color: themeColors.subText }]}>
                  Duration: {prescription.duration}
                </Text>
                {prescription.instructions && (
                  <Text style={[styles.sectionValue, { color: themeColors.subText }]}>
                    Instructions: {prescription.instructions}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <Text style={[styles.sectionValue, { color: themeColors.subText }]}>No prescriptions found.</Text>
          )}
        </View>
      )}
      {tab === 2 && (
        <View
          style={[
            styles.consultDetailCard,
            {
              backgroundColor: themeColors.subCard,
              borderColor: themeColors.border,
            },
          ]}
        >
          <Text style={[styles.sectionLabel, { color: themeColors.text }]}>
            Lab Results
          </Text>
          {loading ? (
            <Text style={[styles.sectionValue, { color: themeColors.subText }]}>Loading lab results...</Text>
          ) : error ? (
            <Text style={[styles.sectionValue, { color: themeColors.subText }]}>Unable to load lab results</Text>
          ) : labResults.length > 0 ? (
            labResults.map((result, index) => (
              <View key={result.labResultId} style={{ marginBottom: 12 }}>
                <Text style={[styles.labTestName, { color: themeColors.text }]}>
                  {result.testName}
                </Text>
                <Text style={[styles.sectionValue, { color: themeColors.subText }]}>
                  Result: {result.result} {result.unit}
                </Text>
                <Text style={[styles.sectionValue, { color: themeColors.subText }]}>
                  Normal Range: {result.normalRange}
                </Text>
                <Text style={[styles.sectionValue, { color: themeColors.subText }]}>
                  Status: {result.status}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.sectionValue, { color: themeColors.subText }]}>No lab results found.</Text>
          )}
        </View>
      )}
      {tab === 3 && (
        <View
          style={[
            styles.consultDetailCard,
            {
              backgroundColor: themeColors.subCard,
              borderColor: themeColors.border,
            },
          ]}
        >
          <Text style={[styles.sectionLabel, { color: themeColors.text }]}>
            Chat
          </Text>
          <Text style={[styles.sectionValue, { color: themeColors.subText }]}>
            No chat history found.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  consultDetailCard: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 10,
    margin: 16,
    marginBottom: 0,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 18,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: -2,
  },
  label: {
    fontSize: 15,
    marginLeft: 4,
  },
  bold: {
    fontWeight: "bold",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginLeft: 8,
  },
  statusBadgeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 18,
  },
  sectionLabel: {
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 2,
    fontSize: 16,
    color: "#111",
  },
  sectionValue: {
    color: "#4b5563",
    marginBottom: 8,
    fontSize: 15,
  },
  prescriptionName: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 4,
  },
  labTestName: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 4,
  },
});

export default ConsultationInfo;
