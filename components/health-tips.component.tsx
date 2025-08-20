import tipsData from "@/utils/scripts/tips.json";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

type Tip = {
  title: string;
  tip: string;
};

const HealthTips = () => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const listRef = useRef<FlatList<Tip>>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch data from API or fallback
  useEffect(() => {
    const fetchTips = async () => {
      try {
        const res = await fetch(
          "https://raw.githubusercontent.com/sylvester-dev/mock-health-tips/main/tips.json"
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setTips(data);
        } else {
          throw new Error("Invalid data format");
        }
      } catch (err) {
        console.log(
          "Error fetching health tips. Using local data instead.",
          err
        );
        setTips(tipsData);
      }
    };

    fetchTips();
  }, []);

  // Auto scroll effect
  const isFocused = useIsFocused(); // this tells us if the screen is active

  useEffect(() => {
    if (!tips.length || isUserInteracting || !isFocused) return;

    intervalRef.current = setInterval(() => {
      const nextIndex = (activeIndex + 1) % tips.length;
      setActiveIndex(nextIndex);
      listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeIndex, tips, isUserInteracting, isFocused]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const renderTip = ({ item }: { item: Tip }) => (
    <LinearGradient
      colors={["#e3ffe7", "#d9e7ff"]}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 0 }}
      style={styles.healthTips}
    >
      <MaterialCommunityIcons name="heart-pulse" size={50} color="green" />
      <View style={styles.tip}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.tip}</Text>
      </View>
    </LinearGradient>
  );

  return (
    <View style={{ width, alignSelf: "center" }}>
      <FlatList
        data={tips}
        renderItem={renderTip}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        ref={listRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onTouchStart={() => {
          setIsUserInteracting(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
        }}
        onTouchEnd={() => {
          setTimeout(() => setIsUserInteracting(false), 3000);
        }}
        onMomentumScrollEnd={() => {
          setTimeout(() => setIsUserInteracting(false), 3000);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  healthTips: {
    width: width - 40,
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  tip: {
    marginLeft: 10,
    flex: 1,
  },
  title: {
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
    flexShrink: 1,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: "#ccc",
  },
  activeDot: {
    width: 10,
    height: 10,
    backgroundColor: "#2155CD",
  },
});

export default HealthTips;
