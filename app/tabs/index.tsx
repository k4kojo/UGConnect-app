import QuickActionsSection from "@/components/dasboard/quickAction.component";
import SideMenu from "@/components/dasboard/side-menu.component";
import WelcomeCard from "@/components/dasboard/welcome-card.component";
import HealthTips from "@/components/health-tips.component";
import Loader from "@/components/loader.component";
import Section from "@/components/section.component";
import TopHeader from "@/components/top-header.component";
import Colors from "@/constants/colors";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeContext } from "@/context/ThemeContext";
import { fetchNotifications, NotificationItem } from "@/services/authService";
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
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const menuSlide = useRef(new Animated.Value(width)).current;

  const { theme, toggleTheme } = useThemeContext();
  const themeColors = Colors[theme];
  const brandColors = Colors.brand;
  const { t } = useLanguage();

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          // fetchUserProfile(),
          loadStoredUser(),
          loadNotifications(),
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStoredUser();
      loadNotifications();
      return () => {};
    }, [])
  );

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([loadStoredUser(), loadNotifications()]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const loadNotifications = async () => {
    try {
      const items: NotificationItem[] = await fetchNotifications();
      const unread = items.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch {
      // ignore
    }
  };

  // const fetchUserProfile = async () => {
  //   try {
  //     const response = await fetch(
  //       "https://randomuser.me/api/portraits/men/75.jpg"
  //     );
  //     const data = await response.json();
  //     const imageUrl = data?.results?.[0]?.picture?.medium;

  //     setProfileImage(imageUrl || null);
  //   } catch (error) {
  //     console.log("Error fetching profile:", error);
  //     setProfileImage(null);
  //   }
  // };

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

      {isLoading ? (
        <Loader 
          fullScreen 
          backgroundColor={themeColors.background}
          color={brandColors.primary}
        />
      ) : (
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
          <WelcomeCard
            profileImage={profileImage ?? undefined}
            themeColors={themeColors}
            brandColors={brandColors}
            userName={userName}
            onAvatarPress={() => router.push("/tabs/profile")}
          />

          <QuickActionsSection themeColors={themeColors} />

          <Section
            title={t("home.upcomingAppointments")}
            emptyMessage={t("appointments.noPending")}
            destination="/tabs/appointment"
          />
          <Section
            title={t("home.recentPrescriptions")}
            emptyMessage={t("home.recentPrescriptions")}
            destination="/tabs/records"
          />

          <View style={{ marginTop: 30 }}>
            <HealthTips />
          </View>
        </ScrollView>
      )}
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
