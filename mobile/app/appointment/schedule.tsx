import Avatar from "@/components/avatar.component";
import DoctorListSkeleton from "@/components/skeleton/DoctorListSkeleton";
import StepHeader from "@/components/step-header-component";
import Colors from "@/constants/colors";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeContext } from "@/context/ThemeContext";
import { fetchDoctors } from "@/redux/doctorsSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
	FlatList,
	RefreshControl,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

type DoctorItem = {
	id: number;
	doctorId: string | null;
	specialization: string;
	licenseNumber: string;
	bio?: string | null;
	reviews: number;
	rating: number;
	experienceYears?: string | null;
	firstName?: string;
	lastName?: string;
	email?: string;
	phoneNumber?: string;
};

const ScheduleAppointment = () => {
	const { theme } = useThemeContext();
	const themeColors = Colors[theme];
	const { t } = useLanguage();

	const [searchQuery, setSearchQuery] = useState("");
	const dispatch = useAppDispatch();
	const { items: doctors, isLoading } = useAppSelector((s) => s.doctors);

	useEffect(() => {
		if (!doctors || doctors.length === 0) {
			dispatch(fetchDoctors());
		}
	}, [dispatch, doctors?.length]);

	const filteredDoctors = useMemo(
		() =>
			doctors.filter((doc) => {
				const name = `${doc.firstName ?? ""} ${doc.lastName ?? ""}`.trim();
				const specialty = doc.specialization ?? "";
				const q = searchQuery.toLowerCase();
				return name.toLowerCase().includes(q) || specialty.toLowerCase().includes(q);
			}),
		[doctors, searchQuery]
	);

	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = React.useCallback(async () => {
		try {
			setRefreshing(true);
			await dispatch(fetchDoctors());
		} finally {
			setRefreshing(false);
		}
	}, [dispatch]);

	return (
		<View style={[styles.container, { backgroundColor: themeColors.background }]}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.replace("/tabs/appointment")}>
					<Ionicons name="chevron-back" size={24} color={themeColors.text} />
				</TouchableOpacity>
				<Text style={[styles.headerTitle, { color: themeColors.text }]}>
					{t("schedule.bookAppointment")}
				</Text>
			</View>

			{/* Step Header */}
			<StepHeader step={1} />

			<Text style={[styles.sectionTitle, { color: themeColors.text }]}>
				{t("schedule.chooseDoctor")}
			</Text>

			{/* Search + Filter */}
			<View style={styles.searchRow}>
				<TextInput
					placeholder={t("schedule.searchPlaceholder")}
					placeholderTextColor={themeColors.subText}
					style={[styles.searchInput, { color: themeColors.text, borderColor: themeColors.border }]}
					value={searchQuery}
					onChangeText={setSearchQuery}
				/>
				<TouchableOpacity style={styles.filterButton} onPress={() => {}}>
					<Ionicons name="filter-outline" size={20} color={themeColors.text} />
				</TouchableOpacity>
			</View>

			{/* Doctor List */}
			{isLoading ? (
				<DoctorListSkeleton />
			) : filteredDoctors.length === 0 ? (
				<View style={styles.emptyContainer}>
					<Text style={[styles.emptyText, { color: themeColors.subText }]}>
						{searchQuery ? t("schedule.emptySearch") : t("schedule.emptyAll")}
					</Text>
				</View>
			) : (
				<FlatList
					data={filteredDoctors}
					keyExtractor={(item) => String(item.id)}
					contentContainerStyle={{ paddingBottom: 10 }}
					showsVerticalScrollIndicator={false}
					style={{ flex: 1 }}
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.text} />}
					renderItem={({ item }) => (
						<View style={[styles.doctorCard, { backgroundColor: themeColors.card }]}> 
							<View style={styles.doctorCardLeft}>								
                <Avatar
                  imageUrl={(item as any).imageUrl}
                  firstName={item.firstName || "D"}
                  lastName={item.lastName || "r"}
                  size={60}
                  border
                  containerStyle={{ backgroundColor: Colors.brand.avatarBg, borderColor: Colors.brand.avatarBg }}
                  onPress={() =>
                    router.push({ pathname: "/doctor-profile", params: { doctorId: item.doctorId ?? "" } })
                  }
                />
								
								<View style={styles.doctorInfo}>
									<Text style={[styles.doctorName, { color: themeColors.text }]}>
										{`${item.firstName || ""} ${item.lastName || ""}`.trim() || t("schedule.doctorFallback")}
									</Text>
									<Text style={[styles.specialty, { color: themeColors.subText }]}>{item.specialization}</Text>
									<View style={styles.ratingContainer}>
										<Ionicons name="star" color="#FFD700" size={14} />
										<Text style={[styles.ratingText, { color: themeColors.subText }]}>
											{t("schedule.ratingReviews", { rating: Number(item.rating ?? 0).toFixed(1), count: Math.round(Number(item.reviews ?? 0)) })}
										</Text>
									</View>
								</View>
							</View>

							<View style={styles.priceColumn}>
								<Text style={[styles.priceText, { color: Colors.brand.tertiary }]}>₵{(item as any).consultationFee || "150"}</Text>
								<Text style={[styles.feeLabel, { color: themeColors.subText }]}>{t("schedule.consultationFee")}</Text>
								<TouchableOpacity style={[styles.selectBtn, { backgroundColor: Colors.brand.primary }]}
									onPress={() => {
										const fullName = `${item.firstName || ""} ${item.lastName || ""}`.trim() || "Doctor";
										const initials = `${(item.firstName?.[0] || "D")}${(item.lastName?.[0] || "r")}`.toUpperCase();
										const fee = String((item as any).consultationFee || ((item.experienceYears ? Number(item.experienceYears) : 100) * 1));
										router.push({
											pathname: "/appointment/select-time",
											params: {
												doctorId: item.doctorId ?? "",
												name: fullName,
												specialty: item.specialization,
												fee,
												initials,
											},
										});
									}}
								>
									<Text style={styles.selectBtnText}>{t("schedule.selectDoctor")}</Text>
								</TouchableOpacity>
							</View>
						</View>
					)}
				/>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingVertical: 80,
		paddingHorizontal: 20,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 20,
		gap: 10,
	},
	headerTitle: {
		fontWeight: "bold",
		fontSize: 18,
	},
	searchRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 20,
	},
	searchInput: {
		flex: 1,
		borderWidth: 1,
		borderRadius: 8,
		padding: 10,
		marginRight: 8,
	},
	filterButton: {
		paddingHorizontal: 12,
		paddingVertical: 10,
	},
	sectionTitle: {
		fontSize: 17,
		fontWeight: "600",
		marginBottom: 10,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 40,
	},
	emptyText: {
		fontSize: 16,
		textAlign: "center",
	},
	doctorCard: {
		padding: 16,
		borderRadius: 12,
		marginBottom: 16,
		flexDirection: "row",
		justifyContent: "space-between",
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
	},
	doctorCardLeft: {
		flexDirection: "row",
		gap: 12,
		flex: 1,
	},
	doctorInfo: {
		flex: 1,
	},
	doctorName: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 4,
	},
	specialty: {
		fontSize: 14,
		color: "#666",
		marginBottom: 6,
	},
	ratingContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 6,
	},
	ratingText: {
		fontSize: 13,
		marginLeft: 4,
	},
	hospital: {
		fontSize: 13,
		marginBottom: 8,
	},
	consultationTypes: {
		flexDirection: "row",
		gap: 8,
		marginTop: 4,
	},
	consultationBadge: {
		borderRadius: 4,
		paddingVertical: 4,
		paddingHorizontal: 8,
	},
	consultationType: {
		fontSize: 12,
		fontWeight: "500",
	},
	priceColumn: {
		alignItems: "flex-end",
		justifyContent: "space-between",
		minWidth: 100,
	},
	priceText: {
		fontSize: 18,
		fontWeight: "600",
	},
	feeLabel: {
		fontSize: 12,
		marginBottom: 8,
	},
	selectBtn: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 6,
	},
	selectBtnText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "500",
	},
});

export default ScheduleAppointment;
