import { StyleSheet, Text, View } from "react-native";

const StepHeader = ({ step = 1 }: { step: number }) => {
  return (
    <View style={styles.container}>
      {["Select Doctor", "Select Time", "Confirm"].map((label, index) => {
        const current = index + 1;
        const isActive = current <= step;
        return (
          <View key={index} style={styles.step}>
            <View style={[styles.circle, isActive && styles.activeCircle]}>
              <Text style={[styles.number, isActive && styles.activeNumber]}>
                {current}
              </Text>
            </View>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {label}
            </Text>
            {current < 3 && <View style={styles.line} />}
          </View>
        );
      })}
    </View>
  );
};

export default StepHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 24,
    justifyContent: "space-around",
  },
  step: {
    alignItems: "center",
    flexDirection: "row",
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 12,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  activeCircle: {
    backgroundColor: "green",
  },
  number: {
    color: "#fff",
    fontWeight: "bold",
  },
  activeNumber: {
    color: "#fff",
  },
  label: {
    marginLeft: 3,
    color: "#999",
  },
  activeLabel: {
    color: "green",
    fontWeight: "600",
  },
  line: {
    width: 20,
    height: 1,
    backgroundColor: "#ccc",
    marginHorizontal: 5,
  },
});
