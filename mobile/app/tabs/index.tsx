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
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View
} from "react-native";

const { width } = Dimensions.get("window");
const SWIPE_THRESHOLD = 50; // Minimum swipe distance to trigger menu
const SWIPE_VELOCITY_THRESHOLD = 0.3; // Minimum swipe velocity to trigger menu

const Dashboard = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const menuSlide = useRef(new Animated.Value(width)).current;
  const [appointments, setAppointments] = useState<AppointmentCardItem[]>([]);
  const [bootLoading, setBootLoading] = useState<boolean>(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState<boolean>(true);
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
          loadAppointments(),
        ]);
      } finally {}
    };
    
    initializeData();
    // Show skeleton briefly while first load runs
    const t = setTimeout(() => setBootLoading(false), 600);
    return () => clearTimeout(t);
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      loadStoredUser();
      return () => {};
    }, [])
  );

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([loadStoredUser(), loadAppointments()]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const loadStoredUser = async () => {
    try {
      const { getStoredUser } = await import("@/services/authService");
      const user = await getStoredUser();
      if (user) {
        const fullName = user.firstName;
        const handle = (user.email?.split("@")[0]) || "";
        // Prefer username if present, else full name, else email handle
        setUserName(user.username || fullName || handle);
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

  const loadAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      const { listAppointments, listDoctors } = await import("@/services/authService");
      const [allAppointments, doctors] = await Promise.all([
        listAppointments({ limit: 5 }).catch(() => [] as any[]),
        listDoctors().catch(() => [] as any[]),
      ]);

      const now = Date.now();
      const upcomingTwo = allAppointments
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
          const doc = (doctors || []).find(
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

      setAppointments(upcomingTwo);
    } catch (error) {
      console.error('Error loading appointments:', error);
      // Fallback: keep previous data and avoid spamming logs
      // Optionally, you can show a toast here if desired
    }
    finally {
      setAppointmentsLoading(false);
    }
  };

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
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 30,
    marginBottom: 10,
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