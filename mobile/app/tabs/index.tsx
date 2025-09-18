import AppointmentCard, { AppointmentCardItem } from "@/components/appointmentCard";
import QuickActionsSection from "@/components/dasboard/quickAction.component";
import SideMenu from "@/components/dasboard/side-menu.component";
import WelcomeCard from "@/components/dasboard/welcome-card.component";
import HealthTips from "@/components/health-tips.component";
import Section from "@/components/section.component";
import AppointmentCardSkeleton from "@/components/skeleton/AppointmentCardSkeleton";
import WelcomeCardSkeleton from "@/components/skeleton/WelcomeCardSkeleton";
import TopHeader from "@/components/top-header.component";
import Colors from "@/constants/colors";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeContext } from "@/context/ThemeContext";
import { prefetchInitialData, useAppDispatch, useAppSelector } from "@/redux/store";
import { useAppointments, useDoctors, usePatientProfile } from "@/hooks/useCache";
import { userService } from "@/services/userService";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const SWIPE_THRESHOLD = 50; // Minimum swipe distance to trigger menu
const SWIPE_VELOCITY_THRESHOLD = 0.3; // Minimum swipe velocity to trigger menu

const Dashboard = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const menuSlide = useRef(new Animated.Value(width)).current;
  const [bootLoading, setBootLoading] = useState<boolean>(true);
  
  // Use cached data hooks
  const { data: appointmentsData, loading: appointmentsLoading, refresh: refreshAppointments } = useAppointments({ limit: 5 });
  const { data: doctorsData, refresh: refreshDoctors } = useDoctors();
  const { data: profileData, refresh: refreshProfile } = usePatientProfile();
  
  // Mock medication data - replace with actual medication hook when available
  const medicationsData = useMemo(() => [
    { id: 1, name: 'Aspirin', dosage: '100mg', frequency: 'Daily', status: 'active', adherence: 85, nextDose: new Date(Date.now() + 2 * 60 * 60 * 1000) },
    { id: 2, name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', status: 'active', adherence: 92, nextDose: new Date(Date.now() + 4 * 60 * 60 * 1000) },
    { id: 3, name: 'Lisinopril', dosage: '10mg', frequency: 'Daily', status: 'active', adherence: 78, nextDose: new Date(Date.now() + 6 * 60 * 60 * 1000) },
    { id: 4, name: 'Vitamin D', dosage: '1000 IU', frequency: 'Daily', status: 'paused', adherence: 65, nextDose: null },
    { id: 5, name: 'Omeprazole', dosage: '20mg', frequency: 'Daily', status: 'completed', adherence: 95, nextDose: null },
  ], []);
  const { theme, toggleTheme } = useThemeContext();
  const themeColors = Colors[theme];
  const brandColors = Colors.brand;
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((s) => (s as any).notifications.items) as any[];
  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          prefetchInitialData(dispatch),
          loadStoredUser(),
        ]);
      } finally {}
    };
    
    initializeData();
    // Show skeleton briefly while first load runs
    const t = setTimeout(() => setBootLoading(false), 600);
    return () => clearTimeout(t);
  }, [dispatch]);

  // Update profile data when available
  useEffect(() => {
    if (profileData) {
      const fullName = profileData.firstName || "";
      const handle = (profileData.email?.split("@")[0]) || "";
      setUserName(fullName || handle);
      if (profileData.profilePicture) {
        setProfileImage(profileData.profilePicture);
      }
    }
  }, [profileData]);

  useFocusEffect(
    useCallback(() => {
      loadStoredUser();
      return () => {};
    }, [])
  );

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        loadStoredUser(),
        refreshAppointments(),
        refreshDoctors(),
        refreshProfile()
        // Add medication refresh when medication hook is available
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refreshAppointments, refreshDoctors, refreshProfile]);

  const loadStoredUser = async () => {
    try {
      const user = await userService.getStoredUser();
      if (user) {
        const fullName = user.firstName;
        const handle = (user.email?.split("@")[0]) || "";
        // Prefer username if present, else full name, else email handle
        setUserName(fullName || handle);
        // Prefer saved profile picture if present
        if (user.profilePicture) {
          setProfileImage(user.profilePicture);
        }
      }
    } catch {
      // ignore
    }
  };

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(menuSlide, {
      toValue: width - width / 1.5,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(menuSlide, {
      toValue: width,
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      setMenuVisible(false);
    });
  };

  // Create pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy, moveX, vx } = gestureState;
        const fromEdge = moveX < 20;
        const horizontalSwipe = Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10;
        const rightSwipe = dx > 0;
        const fastEnough = Math.abs(vx) > 0.1;
        return !menuVisible && fromEdge && horizontalSwipe && rightSwipe && fastEnough;
      },
      onPanResponderGrant: () => {
        // Ensure the menu is mounted so it can follow the finger during swipe
        if (!menuVisible) {
          setMenuVisible(true);
          // start from fully closed position
          menuSlide.setValue(width);
        }
      },
      onPanResponderMove: (_, gestureState) => {
        // Dynamically update menuSlide to follow the finger
        const newPosition = width - gestureState.dx;
        const clamped = Math.min(
          width,
          Math.max(width - width / 1.5, newPosition)
        );
        menuSlide.setValue(clamped);
      },
      onPanResponderRelease: (_, gestureState) => {
        const menuWidth = width / 1.5;
        const openedDistance = Math.min(
          Math.max(gestureState.dx, 0),
          menuWidth
        );
        const isPastHalf = openedDistance > menuWidth / 2;
        const shouldOpen =
          gestureState.dx > SWIPE_THRESHOLD ||
          gestureState.vx > SWIPE_VELOCITY_THRESHOLD ||
          isPastHalf;

        if (shouldOpen) {
          openMenu();
        } else {
          closeMenu();
        }
      },
    })
  ).current;

  // Medication analytics and data processing
  const medicationAnalytics = useMemo(() => {
    if (!medicationsData) return {
      totalMedications: 0,
      activeMedications: 0,
      pausedMedications: 0,
      completedMedications: 0,
      averageAdherence: 0,
      dueSoon: 0,
      highAdherence: 0,
      lowAdherence: 0
    };

    const now = Date.now();
    const nextHour = now + (60 * 60 * 1000); // Next hour

    const active = medicationsData.filter((m: any) => m.status === 'active');
    const paused = medicationsData.filter((m: any) => m.status === 'paused');
    const completed = medicationsData.filter((m: any) => m.status === 'completed');
    const dueSoon = medicationsData.filter((m: any) => 
      m.nextDose && new Date(m.nextDose).getTime() <= nextHour
    );
    const highAdherence = medicationsData.filter((m: any) => m.adherence >= 80);
    const lowAdherence = medicationsData.filter((m: any) => m.adherence < 80);

    const totalAdherence = medicationsData.reduce((sum: number, m: any) => sum + m.adherence, 0);
    const averageAdherence = medicationsData.length > 0 ? Math.round(totalAdherence / medicationsData.length) : 0;

    return {
      totalMedications: medicationsData.length,
      activeMedications: active.length,
      pausedMedications: paused.length,
      completedMedications: completed.length,
      averageAdherence,
      dueSoon: dueSoon.length,
      highAdherence: highAdherence.length,
      lowAdherence: lowAdherence.length
    };
  }, [medicationsData]);

  // Process cached appointments data
  const appointments = useMemo(() => {
    if (!appointmentsData || !doctorsData) return [];
    
    const now = Date.now();
    return appointmentsData
      .filter((a: any) => new Date(a.appointmentDate).getTime() >= now)
      .sort(
        (a: any, b: any) =>
          new Date(a.appointmentDate).getTime() -
          new Date(b.appointmentDate).getTime()
      )
      .slice(0, 2)
      .map((appt: any) => {
        const when = new Date(appt.appointmentDate);
        const dateStr = when.toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        const timeStr = when.toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
        });
        const doc = (doctorsData || []).find(
          (d: any) => String(d.doctorId) === String(appt.doctorId)
        );
        const docName = doc
          ? `${doc.firstName ?? ""} ${doc.lastName ?? ""}`.trim() || "Doctor"
          : appt.doctorName || "Doctor";

        const status =
          appt.status === "confirmed"
            ? "confirmed"
            : appt.status === "pending"
            ? "pending"
            : undefined;

        return {
          id: appt.appointmentId,
          doctorId: appt.doctorId ? String(appt.doctorId) : undefined,
          doctorName: docName,
          specialty:
            (doc && doc.specialization) || appt.doctorSpecialization || appt.appointmentMode,
          date: dateStr,
          time: timeStr,
          type: /online/i.test(appt.appointmentMode) ? "Video Call" : "In-Person",
          status,
          imageUrl: doc && (doc as any).avatarUrl ? (doc as any).avatarUrl : undefined,
        } as AppointmentCardItem;
      });
  }, [appointmentsData, doctorsData]);

  const handleJoinCall = (appointment: AppointmentCardItem) => {
    router.push({
      pathname: '/appointment/video-room',
      params: { 
        appointmentId: appointment.id.toString(),
        doctorName: appointment.doctorName 
      }
    });
  };
  
  const handleMessage = (appointment: AppointmentCardItem) => {
    router.push({
      pathname: '/appointment/chat',
      params: { 
        doctorId: appointment.doctorId ?? '',
        doctorName: appointment.doctorName 
      }
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      {/* Left-edge swipe area to open menu */}
      <View
        pointerEvents={menuVisible ? "none" : "auto"}
        style={styles.edgeSwipeArea}
        {...panResponder.panHandlers}
      />
      <TopHeader
        screen="home"
        onLeftPress={openMenu}
        onRightPress={() => router.push("/notification")}
        unreadCount={unreadCount}
      />

      {/* Slide-in menu */}
      {menuVisible && (
        <Pressable style={styles.overlay} onPress={closeMenu}>
          <SideMenu
            menuSlide={menuSlide}
            menuVisible={menuVisible}
            closeMenu={closeMenu}
            toggleTheme={toggleTheme}
            theme={theme}
          />
        </Pressable>
      )}

      <ScrollView
          contentContainerStyle={[
            styles.container,
            { backgroundColor: themeColors.background },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!menuVisible}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={themeColors.text}
            />
          }
        >
          {bootLoading ? (
            <WelcomeCardSkeleton />
          ) : (
            <WelcomeCard
              profileImage={profileImage ?? undefined}
              themeColors={themeColors}
              brandColors={brandColors}
              userName={userName}
              appointments={appointments}
              onAvatarPress={() => router.push("/tabs/profile")}
              records={[]}
            />
          )}

          <QuickActionsSection themeColors={themeColors} />

          {/* Medication Analytics Dashboard */}
          <View style={styles.analyticsSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderText}>
                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                  Medication Overview
                </Text>
              </View>
            </View>

            <View style={styles.analyticsGrid}>
              <TouchableOpacity 
                style={[styles.analyticsCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
                onPress={() => router.push("/tabs/medications")}
                activeOpacity={0.7}
              >
                <View style={[styles.analyticsIcon, { backgroundColor: '#4CAF5015' }]}>
                  <Ionicons name="medical-outline" size={18} color="#4CAF50" />
                </View>
                <Text style={[styles.analyticsNumber, { color: themeColors.text }]}>
                  {medicationAnalytics.activeMedications}
                </Text>
                <Text style={[styles.analyticsLabel, { color: themeColors.subText }]}>
                  Active
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.analyticsCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
                onPress={() => router.push("/tabs/medications")}
                activeOpacity={0.7}
              >
                <View style={[styles.analyticsIcon, { backgroundColor: '#FF980015' }]}>
                  <Ionicons name="time" size={18} color="#FF9800" />
                </View>
                <Text style={[styles.analyticsNumber, { color: themeColors.text }]}>
                  {medicationAnalytics.dueSoon}
                </Text>
                <Text style={[styles.analyticsLabel, { color: themeColors.subText }]}>
                  Due Soon
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.analyticsCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
                onPress={() => router.push("/tabs/medications")}
                activeOpacity={0.7}
              >
                <View style={[styles.analyticsIcon, { backgroundColor: '#2196F315' }]}>
                  <Ionicons name="trending-up" size={18} color="#2196F3" />
                </View>
                <Text style={[styles.analyticsNumber, { color: themeColors.text }]}>
                  {medicationAnalytics.averageAdherence}%
                </Text>
                <Text style={[styles.analyticsLabel, { color: themeColors.subText }]}>
                  Adherence
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.analyticsCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
                onPress={() => router.push("/tabs/medications")}
                activeOpacity={0.7}
              >
                <View style={[styles.analyticsIcon, { backgroundColor: '#9C27B015' }]}>
                  <Ionicons name="pause-circle" size={18} color="#9C27B0" />
                </View>
                <Text style={[styles.analyticsNumber, { color: themeColors.text }]}>
                  {medicationAnalytics.pausedMedications}
                </Text>
                <Text style={[styles.analyticsLabel, { color: themeColors.subText }]}>
                  Paused
                </Text>
              </TouchableOpacity>
            </View>

            {/* Medication Adherence Overview */}
            <View style={[styles.healthStatusCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              <View style={styles.healthStatusHeader}>
                <View style={[styles.healthStatusIcon, { backgroundColor: brandColors.primary + '15' }]}>
                  <Ionicons name="pulse" size={16} color={brandColors.primary} />
                </View>
                <Text style={[styles.healthStatusTitle, { color: themeColors.text }]}>
                  Adherence Status
                </Text>
              </View>
              <View style={styles.healthStatusContent}>
                <View style={styles.statusItem}>
                  <View style={styles.statusIndicator}>
                    <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                    <Text style={[styles.statusText, { color: themeColors.subText }]}>
                      {medicationAnalytics.highAdherence} High (≥80%)
                    </Text>
                  </View>
                </View>
                <View style={styles.statusItem}>
                  <View style={styles.statusIndicator}>
                    <View style={[styles.statusDot, { backgroundColor: '#FF9800' }]} />
                    <Text style={[styles.statusText, { color: themeColors.subText }]}>
                      {medicationAnalytics.lowAdherence} Low (&lt;80%)
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <Section
            title={t("home.upcomingAppointments")}
            emptyMessage={t("appointments.noPending")}
            destination="/tabs/appointment"
          >
            {appointmentsLoading ? (
              <AppointmentCardSkeleton />
            ) : appointments.length > 0 ? (
              <AppointmentCard items={appointments} showActions={false} />
            ) : null}
          </Section>

          <Section
            title={t("home.recentPrescriptions")}
            emptyMessage={t("home.recentPrescriptions")}
            destination="/tabs/records"
          />

          <View style={{ marginTop: 30 }}>
            <HealthTips />
          </View>
        </ScrollView>
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  analyticsSection: {
    marginTop: 30,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  analyticsCard: {
    flex: 1,
    minWidth: '47%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  analyticsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  analyticsNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  healthStatusCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  healthStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  healthStatusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  healthStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  healthStatusContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 100,
  },
  edgeSwipeArea: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 20,
    zIndex: 50,
  },
});