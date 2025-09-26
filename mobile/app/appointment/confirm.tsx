import { createAppointment as createAppointmentAction } from "@/redux/appointmentsSlice";
import { useAppDispatch } from "@/redux/store";
import { paymentVerificationService } from "@/services/paymentVerificationService";
import paystackService from "@/services/paystackService";
import paystackConfig from "@/config/paystack";
import { usePaystack } from "react-native-paystack-webview";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Image,
} from "react-native";

import StepHeader from "@/components/step-header-component";
import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

const ConfirmScreen = () => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const { t } = useLanguage();

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { popup } = usePaystack();
  const [reason, setReason] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");

  const { initials, name, specialty, date, time, consultationType, fee, doctorId } =
    useLocalSearchParams();

  // Initialize Paystack service with configuration
  useEffect(() => {
    paystackService.setPublicKey(paystackConfig.publicKey);
  }, []);

  const consultationFee = Number(fee) || 0;
  const platformFee = 10.0;
  const total = consultationFee + platformFee;

  console.log(typeof fee);

  const to24Hour = (t: string): string => {
    if (!t) return "09:00";
    const trimmed = t.trim();
    // Handle formats like "9:00 AM" / "10:30 PM"
    const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (ampmMatch) {
      let hours = parseInt(ampmMatch[1], 10);
      const minutes = ampmMatch[2];
      const period = ampmMatch[3].toUpperCase();
      if (period === "PM" && hours < 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return `${String(hours).padStart(2, "0")}:${minutes}`;
    }
    // Fallback for already 24h like "09:00"
    const simple = trimmed.match(/^(\d{2}):(\d{2})$/);
    if (simple) return trimmed;
    return "09:00";
  };

  const handleConfirm = async () => {
    if (!selectedMethod) {
      Alert.alert(t("confirm.error"), t("confirm.choosePaymentMethod"));
      return;
    }

    // Validate amount
    if (!paystackService.validateAmount(total)) {
      Alert.alert(t("confirm.error"), t("confirm.invalidAmount"));
      return;
    }

    const hhmm = to24Hour(time as string);
    const isoDate = new Date(`${date}T${hhmm}:00`).toISOString();

    // Map UI payment method values to backend expected values
    const paymentMethodMap: Record<string, string> = {
      "MTN": "MTN MoMo",
      "AT": "AirtelTigo Cash", 
      "Telecel": "Telecel Cash",
      "Credit Card": "Credit Card"
    };
    
    const mappedPaymentMethod = paymentMethodMap[selectedMethod] || selectedMethod;
    
    // Ensure appointment mode is correctly mapped
    const appointmentMode = consultationType === "In-Person" ? "In-person" : "Online";
    
    // Additional validation
    if (!doctorId) {
      Alert.alert(t("confirm.error"), "Doctor ID is missing. Please go back and select a doctor.");
      return;
    }
    
    if (!isoDate || isNaN(new Date(isoDate).getTime())) {
      Alert.alert(t("confirm.error"), "Invalid appointment date. Please go back and select a valid date and time.");
      return;
    }
    
    if (!mappedPaymentMethod) {
      Alert.alert(t("confirm.error"), "Invalid payment method selected. Please choose a valid payment option.");
      return;
    }

    // Log the data being sent for debugging
    console.log('[DEBUG] Appointment creation data:', {
      doctorId: String(doctorId || ""),
      appointmentDate: isoDate,
      appointmentAmount: String(total),
      appointmentMode,
      reasonForVisit: reason || undefined,
      paymentMethod: mappedPaymentMethod,
      originalSelectedMethod: selectedMethod,
      originalConsultationType: consultationType
    });

    // All payment methods now use Paystack
    try {
      setIsProcessing(true);

      // Prepare payment data using the service
      const paymentData = await paystackService.preparePaymentData(
        total,
        paystackService.createAppointmentMetadata(
          String(doctorId || ""),
          isoDate,
          consultationType === "In-Person" ? "In-person" : "Online",
          { doctorName: name, specialty, paymentMethod: selectedMethod }
        )
      );

        if (!paymentData) {
          Alert.alert(t("auth.error"), t("auth.missingEmail"));
          return;
        }

        const userId = await paystackService.getUserId();
        if (!userId) {
          Alert.alert(t("auth.error"), t("auth.missingUserId"));
          return;
        }

        // Log payment attempt
        paystackService.logPaymentAttempt(paymentData, 'appointment');

        popup.checkout({
          email: paymentData.email,
          amount: paymentData.amount,
          reference: paymentData.reference,
          metadata: paymentData.metadata,
          currency: 'GHS',
          onSuccess: async (transactionRef: any) => {
            try {
              // Extract provider reference using service method
              const providerRef = paystackService.extractTransactionReference(transactionRef);

              // Log successful payment
              paystackService.logPaymentResult({
                reference: paymentData.reference,
                status: 'success',
                transaction: transactionRef,
              });

              const created = await dispatch(
                createAppointmentAction({
                  doctorId: (doctorId as string) || "",
                  appointmentDate: isoDate,
                  appointmentAmount: String(total),
                  appointmentMode,
                  reasonForVisit: reason || undefined,
                  paymentMethod: mappedPaymentMethod as any,
                })
              ).unwrap();

              const appointmentId = created?.appointmentId as string | undefined;
              if (!appointmentId) {
                throw new Error("Payment captured but appointment creation failed. Please contact support with ref: " + providerRef);
              }

              const paymentRecord = await paymentVerificationService.createPaymentRecord({
                appointmentId,
                userId,
                amount: total,
                method: mappedPaymentMethod,
                providerRef,
                metadata: { 
                  paystack: transactionRef, 
                  reference: paymentData.reference,
                  paymentMethod: mappedPaymentMethod,
                  appointmentDetails: { doctorName: name, specialty, date, time }
                },
              });

              // Update payment status to completed after successful Paystack transaction
              if (paymentRecord?.id) {
                await paymentVerificationService.updatePaymentStatus(paymentRecord.id, 'completed');
              }

              router.replace("/appointment/success");
            } catch (err: any) {
              const msg = paystackService.formatErrorMessage(err);
              Alert.alert(t("confirm.error"), msg);
            } finally {
              setIsProcessing(false);
            }
          },
          onCancel: () => {
            setIsProcessing(false);
            paystackService.logPaymentResult({
              reference: paymentData.reference,
              status: 'cancelled',
              message: 'User cancelled payment',
            });
            Alert.alert(t("payments.cancelled"), t("payments.cancelledMessage"));
          },
          onError: (err: any) => {
            setIsProcessing(false);
            const msg = paystackService.formatErrorMessage(err);
            paystackService.logPaymentResult({
              reference: paymentData.reference,
              status: 'failed',
              message: msg,
            });
            Alert.alert(t("payments.failed"), msg);
          },
        });
    } catch (e: any) {
      setIsProcessing(false);
      const message = paystackService.formatErrorMessage(e);
      Alert.alert(t("payments.failed"), message);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView
        style={[styles.container, { backgroundColor: themeColors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/*  Header */}
        <View style={styles.Header}>
          <TouchableOpacity
            style={styles.BackButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={themeColors.text} />
          </TouchableOpacity>
          <View style={styles.HeaderContent}>
            <Text style={[styles.HeaderTitle, { color: themeColors.text }]}>
              {t("confirm.title")}
            </Text>
            <Text style={[styles.HeaderSubtitle, { color: themeColors.subText }]}>
              {t("confirm.subtitle")}
            </Text>
          </View>
        </View>

        <StepHeader step={3} />

        {/* Row layout */}
        <View style={styles.rowWrap}>
          {/*  Appointment Details */}
          <View style={[styles.Card, { backgroundColor: themeColors.subCard }]}>
            <View style={styles.CardHeader}>
              <View style={[styles.CardIcon, { backgroundColor: Colors.brand.primary + '15' }]}>
                <Ionicons name="calendar" size={20} color={Colors.brand.primary} />
              </View>
              <View>
                <Text style={[styles.CardTitle, { color: themeColors.text }]}>
                  {t("confirm.appointmentDetails")}
                </Text>
                <Text style={[styles.CardSubtitle, { color: themeColors.subText }]}>
                  {t("confirm.appointmentDetailsSubtitle")}
                </Text>
              </View>
            </View>

            <View style={styles.DocRow}>
              <View style={[styles.Avatar, { backgroundColor: Colors.brand.primary + '15' }]}>
                <Text style={[styles.AvatarText, { color: Colors.brand.primary }]}>
                  {initials?.toString() ?? "Dr"}
                </Text>
              </View>
              <View style={styles.DocInfo}>
                <Text style={[styles.DocName, { color: themeColors.text }]}>
                  {name ?? "Doctor Name"}
                </Text>
                <Text style={[styles.DocSpecialty, { color: themeColors.subText }]}>
                  {specialty ?? "Specialty"}
                </Text>
              </View>
            </View>

            <View style={styles.DetailsGrid}>
              <View style={styles.DetailItem}>
                <View style={[styles.DetailIcon, { backgroundColor: '#10B981' + '15' }]}>
                  <Ionicons name="calendar-outline" size={16} color="#10B981" />
                </View>
                <View>
                  <Text style={[styles.DetailLabel, { color: themeColors.subText }]}>
                    {t("confirm.date")}
                  </Text>
                  <Text style={[styles.DetailValue, { color: themeColors.text }]}>
                    {date ? new Date(date.toString()).toDateString() : "Date"}
                  </Text>
                </View>
              </View>

              <View style={styles.DetailItem}>
                <View style={[styles.DetailIcon, { backgroundColor: '#F59E0B' + '15' }]}>
                  <Ionicons name="time-outline" size={16} color="#F59E0B" />
                </View>
                <View>
                  <Text style={[styles.DetailLabel, { color: themeColors.subText }]}>
                    {t("confirm.time")}
                  </Text>
                  <Text style={[styles.DetailValue, { color: themeColors.text }]}>
                    {time ?? "Time"}
                  </Text>
                </View>
              </View>

              <View style={styles.DetailItem}>
                <View style={[styles.DetailIcon, { backgroundColor: '#8B5CF6' + '15' }]}>
                  <Ionicons
                    name={consultationType === "In-Person" ? "location-outline" : "videocam-outline"}
                    size={16}
                    color="#8B5CF6"
                  />
                </View>
                <View>
                  <Text style={[styles.DetailLabel, { color: themeColors.subText }]}>
                    {t("confirm.type")}
                  </Text>
                  <Text style={[styles.DetailValue, { color: themeColors.text }]}>
                    {consultationType === "In-Person"
                      ? t("confirm.inPersonVisit")
                      : t("appointments.videoCall")}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/*  Payment Summary */}
          <View style={[styles.Card, { backgroundColor: themeColors.subCard }]}>
            <View style={styles.CardHeader}>
              <View style={[styles.CardIcon, { backgroundColor: '#10B981' + '15' }]}>
                <Ionicons name="card" size={20} color="#10B981" />
              </View>
              <View>
                <Text style={[styles.CardTitle, { color: themeColors.text }]}>
                  {t("confirm.paymentSummary")}
                </Text>
                <Text style={[styles.CardSubtitle, { color: themeColors.subText }]}>
                  {t("confirm.paymentSummarySubtitle")}
                </Text>
              </View>
            </View>

            <View style={styles.PaymentBreakdown}>
              <View style={styles.PaymentRow}>
                <View style={styles.PaymentLeft}>
                  <Ionicons name="medical-outline" size={16} color="#10B981" />
                  <Text style={[styles.PaymentLabel, { color: themeColors.subText }]}>
                    {t("schedule.consultationFee")}
                  </Text>
                </View>
                <Text style={[styles.PaymentValue, { color: themeColors.text }]}>
                  ₵{consultationFee}
                </Text>
              </View>

              <View style={styles.PaymentRow}>
                <View style={styles.PaymentLeft}>
                  <Ionicons name="shield-outline" size={16} color="#F59E0B" />
                  <Text style={[styles.PaymentLabel, { color: themeColors.subText }]}>
                    {t("confirm.platformFee")}
                  </Text>
                </View>
                <Text style={[styles.PaymentValue, { color: themeColors.text }]}>
                  ₵{platformFee}
                </Text>
              </View>

              <View style={[styles.Divider, { backgroundColor: themeColors.border }]} />

              <View style={styles.TotalRow}>
                <View style={styles.PaymentLeft}>
                  <Ionicons name="calculator-outline" size={18} color={Colors.brand.primary} />
                  <Text style={[styles.TotalLabel, { color: themeColors.text }]}>
                    {t("confirm.total")}
                  </Text>
                </View>
                <Text style={[styles.TotalValue, { color: Colors.brand.primary }]}>
                  ₵{total}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/*  Reason for Visit */}
        <View style={[styles.Card, { backgroundColor: themeColors.subCard }]}>
          <View style={styles.CardHeader}>
            <View style={[styles.CardIcon, { backgroundColor: '#8B5CF6' + '15' }]}>
              <Ionicons name="document-text" size={20} color="#8B5CF6" />
            </View>
            <View>
              <Text style={[styles.CardTitle, { color: themeColors.text }]}>
                {t("confirm.reasonForVisit")}
              </Text>
              <Text style={[styles.CardSubtitle, { color: themeColors.subText }]}>
                {t("confirm.reasonForVisitSubtitle")}
              </Text>
            </View>
          </View>
          <TextInput
            placeholder={t("confirm.reasonPlaceholder")}
            multiline
            style={[styles.TextArea, {
              color: themeColors.text,
              backgroundColor: themeColors.background + '50',
              borderColor: themeColors.border
            }]}
            placeholderTextColor={themeColors.subText}
            value={reason}
            onChangeText={setReason}
          />
        </View>

        {/*  Payment Methods */}
        <View style={[styles.Card, { backgroundColor: themeColors.subCard }]}>
          <View style={styles.CardHeader}>
            <View style={[styles.CardIcon, { backgroundColor: '#F59E0B' + '15' }]}>
              <Ionicons name="wallet" size={20} color="#F59E0B" />
            </View>
            <View>
              <Text style={[styles.CardTitle, { color: themeColors.text }]}>
                {t("confirm.paymentMethod")}
              </Text>
              <Text style={[styles.CardSubtitle, { color: themeColors.subText }]}>
                {t("confirm.paymentMethodSubtitle")}
              </Text>
            </View>
          </View>

          <View style={styles.PaymentCardsGrid}>
            {/* MTN Card */}
            <TouchableOpacity
              style={[
                styles.PaymentCard,
                {
                  backgroundColor: '#FFFFFF',
                  borderColor: selectedMethod === "MTN" ? '#FFCC00' : '#E5E5E5',
                  borderWidth: selectedMethod === "MTN" ? 2 : 1,
                  shadowColor: selectedMethod === "MTN" ? '#FFCC00' : '#000',
                  shadowOpacity: selectedMethod === "MTN" ? 0.3 : 0.1,
                  shadowOffset: { width: 0, height: selectedMethod === "MTN" ? 4 : 2 },
                  shadowRadius: selectedMethod === "MTN" ? 8 : 4,
                  elevation: selectedMethod === "MTN" ? 6 : 2,
                },
              ]}
              onPress={() => setSelectedMethod("MTN")}
              activeOpacity={0.8}
            >
              <View style={styles.CardLogo}>
                <Image
                  source={require('@/assets/images/mtn.jpg')}
                  style={styles.CardLogoImage}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>

            {/* AT Card */}
            <TouchableOpacity
              style={[
                styles.PaymentCard,
                {
                  backgroundColor: '#FFFFFF',
                  borderColor: selectedMethod === "AT" ? '#0066CC' : '#E5E5E5',
                  borderWidth: selectedMethod === "AT" ? 2 : 1,
                  shadowColor: selectedMethod === "AT" ? '#0066CC' : '#000',
                  shadowOpacity: selectedMethod === "AT" ? 0.3 : 0.1,
                  shadowOffset: { width: 0, height: selectedMethod === "AT" ? 4 : 2 },
                  shadowRadius: selectedMethod === "AT" ? 8 : 4,
                  elevation: selectedMethod === "AT" ? 6 : 2,
                },
              ]}
              onPress={() => setSelectedMethod("AT")}
              activeOpacity={0.8}
            >
              <View style={styles.CardLogo}>
                <Image
                  source={require('@/assets/images/airteltigo.png')}
                  style={styles.CardLogoImage}
                  resizeMode="center"
                />
              </View>
            </TouchableOpacity>

            {/* Telecel Card */}
            <TouchableOpacity
              style={[
                styles.PaymentCard,
                {
                  backgroundColor: '#FFFFFF',
                  borderColor: selectedMethod === "Telecel" ? '#E31E24' : '#E5E5E5',
                  borderWidth: selectedMethod === "Telecel" ? 2 : 1,
                  shadowColor: selectedMethod === "Telecel" ? '#E31E24' : '#000',
                  shadowOpacity: selectedMethod === "Telecel" ? 0.3 : 0.1,
                  shadowOffset: { width: 0, height: selectedMethod === "Telecel" ? 4 : 2 },
                  shadowRadius: selectedMethod === "Telecel" ? 8 : 4,
                  elevation: selectedMethod === "Telecel" ? 6 : 2,
                },
              ]}
              onPress={() => setSelectedMethod("Telecel")}
              activeOpacity={0.8}
            >
              <View style={styles.CardLogo}>
                <Image
                  source={require('@/assets/images/telecel.png')}
                  style={styles.CardLogoImage}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </View>


        </View>

        {/*  Confirm Button */}
        <View style={styles.SubmitContainer}>
          <TouchableOpacity
            style={[
              styles.SubmitBtn,
              {
                backgroundColor: Colors.brand.primary,
                opacity: isProcessing ? 0.7 : 1,
                shadowColor: Colors.brand.primary,
                shadowOffset: {
                  width: 0,
                  height: isProcessing ? 4 : 8,
                },
                shadowOpacity: isProcessing ? 0.2 : 0.3,
                shadowRadius: isProcessing ? 8 : 12,
                elevation: isProcessing ? 4 : 8,
              }
            ]}
            onPress={handleConfirm}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            <View style={styles.SubmitContent}>
              {isProcessing ? (
                <>
                  <View style={styles.LoadingSpinner}>
                    <Ionicons name="hourglass-outline" size={20} color="#fff" />
                  </View>
                  <Text style={styles.SubmitText}>
                    {t("common.processing")}
                  </Text>
                </>
              ) : (
                <>
                  <View style={styles.SubmitIcon}>
                    <Ionicons name="shield-checkmark" size={20} color="#fff" />
                  </View>
                  <Text style={styles.SubmitText}>
                    {t("confirm.confirmAndPay", { amount: total }) || `Confirm & Pay ₵${total}`}
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.SecurityNote}>
            <Ionicons name="lock-closed-outline" size={14} color={themeColors.subText} />
            <Text style={[styles.SecurityText, { color: themeColors.subText }]}>
              {t("confirm.securityNote")}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ConfirmScreen;

// STYLES
const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flex: 1,
  },
  rowWrap: {
    gap: 20,
    marginBottom: 20,
  },
  card: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
  },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontWeight: "600",
  },
  docName: {
    fontWeight: "600",
    fontSize: 15,
  },
  grayText: {
    fontSize: 13,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 3,
  },
  rowText: {
    fontSize: 14,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
  },
  feeText: {
    fontSize: 14,
  },
  totalText: {
    fontSize: 15,
    fontWeight: "600",
  },
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    textAlignVertical: "top",
    fontSize: 14,
  },
  payOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  paymentBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  paymentBtnText: {
    fontSize: 14,
  },

  //  styles for modern UI
  Header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 16,
  },
  BackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: "center",
    alignItems: "center",
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  HeaderContent: {
    flex: 1,
  },
  HeaderTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  HeaderSubtitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  Card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  CardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  CardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  CardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  CardSubtitle: {
    fontSize: 13,
    fontWeight: "500",
  },
  DocRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 16,
  },
  Avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  AvatarText: {
    fontSize: 18,
    fontWeight: "700",
  },
  DocInfo: {
    flex: 1,
  },
  DocName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  DocSpecialty: {
    fontSize: 14,
    fontWeight: "500",
  },
  DetailsGrid: {
    gap: 16,
  },
  DetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  DetailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  DetailLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  DetailValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  PaymentBreakdown: {
    gap: 16,
  },
  PaymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  PaymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  PaymentLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  PaymentValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  Divider: {
    height: 1,
    marginVertical: 8,
  },
  TotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  TotalLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  TotalValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  TextArea: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    textAlignVertical: "top",
    fontSize: 15,
    fontWeight: "500",
    marginTop: 16,
  },
  PayOptions: {
    gap: 12,
    marginTop: 16,
  },
  PaymentBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
    position: "relative",
  },
  PaymentIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  PaymentBtnText: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  PaymentCheckmark: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  SubmitContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  SubmitBtn: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 12,
  },
  SubmitContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  SubmitIcon: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  LoadingSpinner: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  SubmitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  SecurityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  SecurityText: {
    fontSize: 12,
    fontWeight: "500",
  },

  // New payment cards grid styles
  PaymentCardsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 16,
  },
  PaymentCard: {
    flex: 1,
    aspectRatio: 1.2,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    minHeight: 80,
  },
  CardLogo: {
    width: 45,
    height: 45,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  CardLogoImage: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  CardName: {
    fontSize: 14,
    textAlign: "center",
  },
  CardSelectedIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
  },

  inputGroup: {
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  cardDetailsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  submitBtn: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 40,
  },
  submitText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
});
