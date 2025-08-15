import Avatar from "@/components/avatar.component";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type WelcomeCardProps = {
	profileImage?: string;
	userName?: string;
	themeColors: any;
	brandColors: any;
	onAvatarPress?: () => void;
};

const WelcomeCard = ({
	profileImage,
	userName,
	themeColors,
	brandColors,
	onAvatarPress,
}: WelcomeCardProps) => {
	return (
		<View style={[styles.welcomeCard, { backgroundColor: themeColors.card }]}> 
			<View style={styles.userInfo}>
				<Text style={[styles.welcomeText, { color: themeColors.text }]}>
					{userName ? `Welcome ${userName}!` : "Welcome!"}
				</Text>
				<TouchableOpacity activeOpacity={0.8} onPress={onAvatarPress}>
					<Avatar
						imageUrl={profileImage}
						fullName={userName}
						size={50}
						border
					/>
				</TouchableOpacity>
			</View>

			<View style={styles.welcomeSummary}>
				<SummaryItem
					number="0"
					label="Upcoming appointments"
					brandColors={brandColors}
					themeColors={themeColors}
				/>
				<SummaryItem
					number="0"
					label="Records"
					brandColors={brandColors}
					themeColors={themeColors}
				/>
			</View>
		</View>
	);
};

const SummaryItem = ({ number, label, brandColors, themeColors }: any) => (
	<View style={styles.summaryItem}>
		<Text style={[styles.summaryNumber, { color: brandColors.primary }]}> 
			{number}
		</Text>
		<Text style={[styles.summaryLabel, { color: themeColors.subText }]}> 
			{label}
		</Text>
	</View>
);

const styles = StyleSheet.create({
	welcomeCard: {
		padding: 20,
		marginTop: -20,
		borderRadius: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.05,
		shadowRadius: 6,
		elevation: 6,
	},
	userInfo: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 15,
	},
	welcomeText: {
		fontSize: 20,
		fontWeight: "600",
	},
	welcomeSummary: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	summaryItem: {
		alignItems: "center",
	},
	summaryNumber: {
		fontSize: 18,
		fontWeight: "bold",
	},
	summaryLabel: {
		fontSize: 14,
		textAlign: "center",
	},
});

export default WelcomeCard;
