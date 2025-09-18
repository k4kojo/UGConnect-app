import Avatar from "@/components/avatar.component";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type WelcomeCardProps = {
	profileImage?: string;
	userName?: string;
	themeColors: any;
	brandColors: any;
	onAvatarPress?: () => void;
	appointments: any[];
	records: any[];
};

const WelcomeCard = ({
	profileImage,
	userName,
	themeColors,
	brandColors,
	onAvatarPress,
	appointments,
	records,
}: WelcomeCardProps) => {
	const currentHour = new Date().getHours();
	const getGreeting = () => {
		if (currentHour < 12) return "Good Morning";
		if (currentHour < 17) return "Good Afternoon";
		return "Good Evening";
	};

	return (
		<View style={[styles.welcomeCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}> 
			{/* Header */}
			<View style={styles.headerSection}>
				<View style={styles.greetingSection}>
					<Text style={[styles.greetingText, { color: themeColors.subText }]}>
						{getGreeting()}
					</Text>
					<Text style={[styles.welcomeText, { color: themeColors.text }]}>
						{userName ? `${userName}!` : "Welcome!"}
					</Text>
				</View>
				<TouchableOpacity 
					activeOpacity={0.8} 
					onPress={onAvatarPress}
					style={styles.avatarContainer}
				>
					<Avatar
						imageUrl={profileImage}
						fullName={userName}
						size={56}
						border
						containerStyle={{ 
							backgroundColor: brandColors.primary + '15', 
							borderColor: brandColors.primary + '30',
							borderWidth: 2
						}}
					/>
				</TouchableOpacity>
			</View>

			{/* Enhanced Summary Cards */}
			<View style={styles.summarySection}>
				<View style={[styles.summaryCard, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
					<View style={[styles.summaryIcon, { backgroundColor: '#4CAF5015' }]}>
						<Ionicons name="calendar" size={16} color="#4CAF50" />
					</View>
					<View style={styles.summaryContainer}>
						<Text style={[styles.summaryNumber, { color: themeColors.text }]}>
							{appointments.length}
						</Text>
						<Text style={[styles.summaryLabel, { color: themeColors.subText }]}>
							Upcoming
						</Text>
					</View>
				</View>

				<View style={[styles.summaryCard, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
					<View style={[styles.summaryIcon, { backgroundColor: '#2196F315' }]}>
						<Ionicons name="document-text" size={16} color="#2196F3" />
					</View>
					<View style={styles.summaryContainer}>
						<Text style={[styles.summaryNumber, { color: themeColors.text }]}>
							{records.length}
						</Text>
						<Text style={[styles.summaryLabel, { color: themeColors.subText }]}>
							Records
						</Text>
					</View>
				</View>
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
		borderRadius: 16,
		borderWidth: 1,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.12,
		shadowRadius: 8,
		elevation: 4,
	},
	headerSection: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 20,
	},
	greetingSection: {
		flex: 1,
	},
	greetingText: {
		fontSize: 14,
		fontWeight: "500",
		marginBottom: 4,
	},
	welcomeText: {
		fontSize: 22,
		fontWeight: "700",
		lineHeight: 28,
	},
	avatarContainer: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
		borderRadius: 28,
	},
	summarySection: {
		flexDirection: "row",
		gap: 12,
	},
	summaryCard: {
		flex: 1,
		flexDirection: 'row',
		alignItems: "center",
		justifyContent: 'center',
		gap: 8,
		padding: 10,
		borderRadius: 12,
		borderWidth: 1,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 4,
		elevation: 2,
	},
	summaryIcon: {
		width: 32,
		height: 32,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 8,
	},
	summaryContainer: {
		flex: 1,
		alignItems: 'center'
	},
	summaryNumber: {
		fontSize: 18,
		fontWeight: "700",
		marginBottom: 4,
	},
	summaryLabel: {
		fontSize: 12,
		fontWeight: "600",
		textAlign: "center",
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	// Legacy styles (kept for compatibility)
	userInfo: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 15,
	},
	welcomeSummary: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	summaryItem: {
		alignItems: "center",
	},
});

export default WelcomeCard;
