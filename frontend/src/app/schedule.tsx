import { Ionicons } from "@expo/vector-icons";

import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";

export default function Schedule() {
  const { width } = useWindowDimensions();

  const isMobile = width < 700;

  return (
    <View style={styles.container}>
      {/* MAIN CONTENT */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* MOBILE HEADER */}
        {isMobile && (
          <View style={styles.mobileHeader}>
            <View>
              <Text style={styles.mobileLogo}>KatokKalinis</Text>
              <Text style={styles.mobileLogoSub}>ADMIN SYSTEM</Text>
            </View>

            <TouchableOpacity style={styles.mobileMenuButton}>
              <Ionicons name="menu" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        )}

        {/* PAGE HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Collection Schedule</Text>
            <Text style={styles.pageSubtitle}>
              Manage and monitor garbage collection schedules
            </Text>
          </View>

          <View style={styles.profile}>
            <View style={styles.avatar}>
              <Ionicons
                name="person"
                size={20}
                color="#4CAF50"
              />
            </View>

            {!isMobile && (
              <View>
                <Text style={styles.profileName}>Administrator</Text>
                <Text style={styles.profileRole}>Admin</Text>
              </View>
            )}
          </View>
        </View>

        {/* ADD SCHEDULE */}
        <View style={styles.topActions}>
          <Text style={styles.heading}>Collection Schedule</Text>

          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Schedule</Text>
          </TouchableOpacity>
        </View>

        {/* SCHEDULE CARDS */}
        <View style={styles.scheduleList}>
          <ScheduleCard
            day="Monday"
            area="Barangay 1 - Cogon"
            time="7:00 AM - 10:00 AM"
            truck="Truck 01"
            status="Scheduled"
          />

          <ScheduleCard
            day="Tuesday"
            area="Barangay 2 - Carmen"
            time="8:00 AM - 11:00 AM"
            truck="Truck 02"
            status="Scheduled"
          />

          <ScheduleCard
            day="Wednesday"
            area="Barangay 3 - Macasandig"
            time="7:30 AM - 10:30 AM"
            truck="Truck 03"
            status="Scheduled"
          />

          <ScheduleCard
            day="Thursday"
            area="Barangay 4 - Lapasan"
            time="8:00 AM - 11:00 AM"
            truck="Truck 04"
            status="Scheduled"
          />

          <ScheduleCard
            day="Friday"
            area="Barangay 5 - Kauswagan"
            time="7:00 AM - 10:00 AM"
            truck="Truck 05"
            status="Scheduled"
          />
        </View>
      </ScrollView>
    </View>
  );
}


/* SCHEDULE CARD */

function ScheduleCard({
  day,
  area,
  time,
  truck,
  status,
}: {
  day: string;
  area: string;
  time: string;
  truck: string;
  status: string;
}) {
  return (
    <View style={styles.scheduleCard}>
      <View style={styles.dayBox}>
        <Text style={styles.dayText}>{day}</Text>
      </View>

      <View style={styles.scheduleInfo}>
        <Text style={styles.areaText}>{area}</Text>

        <View style={styles.infoRow}>
          <Ionicons
            name="time-outline"
            size={16}
            color="#4CAF50"
          />
          <Text style={styles.infoText}>{time}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons
            name="car-outline"
            size={16}
            color="#4CAF50"
          />
          <Text style={styles.infoText}>{truck}</Text>
        </View>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    </View>
  );
}

/* STYLES */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F5F7F4",
  },

  /* SIDEBAR */

  sidebar: {
    width: 235,
    minHeight: "100%",
    backgroundColor: "#6BCB3C",
    paddingTop: 28,
    paddingHorizontal: 14,
  },

  logoContainer: {
    paddingHorizontal: 12,
    marginBottom: 30,
  },

  logo: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "900",
  },

  logoSub: {
    color: "#E9FFE0",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 4,
  },

  sectionLabel: {
    color: "#E8FFD9",
    fontSize: 9,
    fontWeight: "800",
    marginLeft: 12,
    marginTop: 15,
    marginBottom: 7,
  },

  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    height: 43,
    paddingHorizontal: 12,
    borderRadius: 7,
    marginBottom: 3,
  },

  activeItem: {
    backgroundColor: "#4CAF50",
  },

  sidebarText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 12,
  },

  bottom: {
    marginTop: "auto",
    paddingBottom: 20,
  },

  /* CONTENT */

  content: {
    flex: 1,
  },

  contentContainer: {
    padding: 32,
    paddingBottom: 50,
  },

  /* MOBILE */

  mobileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  mobileLogo: {
    color: "#4CAF50",
    fontSize: 23,
    fontWeight: "900",
  },

  mobileLogoSub: {
    color: "#888",
    fontSize: 8,
    fontWeight: "700",
    marginTop: 2,
  },

  mobileMenuButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  /* HEADER */

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },

  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#333",
  },

  pageSubtitle: {
    color: "#888",
    fontSize: 13,
    marginTop: 5,
  },

  profile: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5F5DF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  profileName: {
    fontWeight: "700",
    color: "#333",
    fontSize: 13,
  },

  profileRole: {
    color: "#888",
    fontSize: 11,
    marginTop: 2,
  },

  /* ACTIONS */

  topActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  heading: {
    fontSize: 19,
    fontWeight: "700",
    color: "#333",
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 8,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginLeft: 6,
    fontSize: 13,
  },

  /* SCHEDULE */

  scheduleList: {
    gap: 14,
  },

  scheduleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 110,
  },

  dayBox: {
    width: 105,
    minHeight: 70,
    borderRadius: 9,
    backgroundColor: "#EDF6E8",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },

  dayText: {
    color: "#4CAF50",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },

  scheduleInfo: {
    flex: 1,
    marginLeft: 18,
  },

  areaText: {
    color: "#333",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  infoText: {
    color: "#777",
    fontSize: 12,
    marginLeft: 7,
  },

  statusContainer: {
    backgroundColor: "#EDF6E8",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  statusText: {
    color: "#4CAF50",
    fontSize: 11,
    fontWeight: "700",
  },
});