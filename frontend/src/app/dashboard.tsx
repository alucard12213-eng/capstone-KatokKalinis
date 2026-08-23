import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

export default function Dashboard() {
  const { width } = useWindowDimensions();

  const params = useLocalSearchParams<{
    role?: string;
    name?: string;
  }>();

  const role =
    params.role === "admin"
      ? "admin"
      : "super_admin";

  const name =
    typeof params.name === "string" &&
    params.name.length > 0
      ? params.name
      : role === "super_admin"
        ? "Administrator"
        : "Admin";

  const isMobile = width < 700;

  return (
    <View style={styles.container}>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          isMobile &&
            styles.contentContainerMobile,
        ]}
        showsVerticalScrollIndicator={false}
      >

        {/* ===================================================
            MOBILE HEADER
        =================================================== */}

        {isMobile && (
          <View style={styles.mobileHeader}>

            <View>
              <Text style={styles.mobileLogo}>
                KatokKalinis
              </Text>

              <Text style={styles.mobileUser}>
                {name}
              </Text>

              <Text style={styles.mobileRole}>
                {role === "super_admin"
                  ? "SUPER ADMIN"
                  : "ADMIN"}
              </Text>
            </View>

          </View>
        )}

        {/* ===================================================
            PAGE HEADER
        =================================================== */}

        <View style={styles.topBar}>

          <View style={styles.titleContainer}>

            <Text
              style={[
                styles.pageTitle,
                isMobile &&
                  styles.pageTitleMobile,
              ]}
            >
              Barangay Overview
            </Text>

            <Text style={styles.pageSubtitle}>
              Welcome to KatokKalinis Administration
            </Text>

          </View>

          {/* PROFILE */}

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

                <Text style={styles.profileName}>
                  {name}
                </Text>

                <Text style={styles.profileRole}>
                  {role === "super_admin"
                    ? "Super Admin"
                    : "Admin"}
                </Text>

              </View>
            )}

          </View>

        </View>

        {/* ===================================================
            STATISTICS
        =================================================== */}

        <View
          style={[
            styles.cards,
            isMobile &&
              styles.cardsMobile,
          ]}
        >

          <DashboardCard
            icon="people-outline"
            title="Residents"
            value="1,250"
            isMobile={isMobile}
          />

          <DashboardCard
            icon="car-outline"
            title="Garbage Trucks"
            value="18"
            isMobile={isMobile}
          />

          <DashboardCard
            icon="document-text-outline"
            title="Reports & Issues"
            value="32"
            isMobile={isMobile}
          />

          <DashboardCard
            icon="checkmark-circle-outline"
            title="Collection Compliance"
            value="85%"
            isMobile={isMobile}
          />

        </View>

        {/* ===================================================
            LOWER CARDS
        =================================================== */}

        <View
          style={[
            styles.row,
            isMobile &&
              styles.rowMobile,
          ]}
        >

          {/* COLLECTION OVERVIEW */}

          <View
            style={[
              styles.largeCard,
              isMobile &&
                styles.largeCardMobile,
            ]}
          >

            <Text style={styles.cardHeading}>
              Collection Overview
            </Text>

            <View style={styles.overviewBox}>

              <Text style={styles.percent}>
                85%
              </Text>

              <Text style={styles.overviewText}>
                Collection Compliance
              </Text>

              <View
                style={
                  styles.progressBackground
                }
              >

                <View
                  style={styles.progressFill}
                />

              </View>

            </View>

          </View>

          {/* RECENT ACTIVITY */}

          <View
            style={[
              styles.largeCard,
              isMobile &&
                styles.largeCardMobile,
            ]}
          >

            <Text style={styles.cardHeading}>
              Recent Activity
            </Text>

            <Activity
              text="New report submitted"
              time="10 minutes ago"
            />

            <Activity
              text="Truck schedule updated"
              time="30 minutes ago"
            />

            <Activity
              text="Vendor record updated"
              time="1 hour ago"
            />

            <Activity
              text="Employee attendance recorded"
              time="2 hours ago"
            />

          </View>

        </View>

      </ScrollView>

    </View>
  );
}

/* ============================================================
   DASHBOARD CARD
============================================================ */

function DashboardCard({
  icon,
  title,
  value,
  isMobile,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  isMobile: boolean;
}) {
  return (
    <View
      style={[
        styles.dashboardCard,
        isMobile &&
          styles.dashboardCardMobile,
      ]}
    >

      <View style={styles.cardIcon}>

        <Ionicons
          name={icon}
          size={23}
          color="#4CAF50"
        />

      </View>

      <Text
        style={[
          styles.cardValue,
          isMobile &&
            styles.cardValueMobile,
        ]}
      >
        {value}
      </Text>

      <Text style={styles.cardTitle}>
        {title}
      </Text>

    </View>
  );
}

/* ============================================================
   ACTIVITY
============================================================ */

function Activity({
  text,
  time,
}: {
  text: string;
  time: string;
}) {
  return (
    <View style={styles.activity}>

      <View style={styles.activityDot} />

      <View
        style={styles.activityContent}
      >

        <Text style={styles.activityText}>
          {text}
        </Text>

        <Text style={styles.activityTime}>
          {time}
        </Text>

      </View>

    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({

  /* ==========================================================
     MAIN
  ========================================================== */

  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F5F7F4",
    minHeight: "100%" as any,
  },

  content: {
    flex: 1,
  },

  contentContainer: {
    padding: 32,
    paddingBottom: 50,
  },

  contentContainerMobile: {
    padding: 18,
    paddingBottom: 40,
  },

  /* ==========================================================
     MOBILE
  ========================================================== */

  mobileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  mobileLogo: {
    color: "#4CAF50",
    fontSize: 23,
    fontWeight: "900",
  },

  mobileUser: {
    color: "#444444",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },

  mobileRole: {
    color: "#888888",
    fontSize: 9,
    fontWeight: "800",
    marginTop: 2,
  },

  /* ==========================================================
     PAGE HEADER
  ========================================================== */

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },

  titleContainer: {
    flex: 1,
  },

  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#333333",
  },

  pageTitleMobile: {
    fontSize: 25,
  },

  pageSubtitle: {
    color: "#888888",
    marginTop: 4,
    fontSize: 13,
  },

  /* ==========================================================
     PROFILE
  ========================================================== */

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
    color: "#333333",
    fontSize: 13,
  },

  profileRole: {
    color: "#888888",
    fontSize: 11,
    marginTop: 2,
  },

  /* ==========================================================
     STATISTICS
  ========================================================== */

  cards: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 22,
  },

  cardsMobile: {
    gap: 12,
  },

  dashboardCard: {
    flex: 1,
    minWidth: 190,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    minHeight: 135,
  },

  dashboardCardMobile: {
    minWidth: "47%" as any,
    padding: 15,
    minHeight: 125,
  },

  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: "#EDF6E8",
    justifyContent: "center",
    alignItems: "center",
  },

  cardValue: {
    color: "#333333",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 13,
  },

  cardValueMobile: {
    fontSize: 24,
    marginTop: 10,
  },

  cardTitle: {
    color: "#888888",
    fontSize: 12,
    marginTop: 3,
  },

  /* ==========================================================
     LOWER CARDS
  ========================================================== */

  row: {
    flexDirection: "row",
    gap: 18,
  },

  rowMobile: {
    flexDirection: "column",
    gap: 14,
  },

  largeCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 22,
    minHeight: 230,
  },

  largeCardMobile: {
    width: "100%" as any,
    minHeight: 200,
    padding: 18,
  },

  cardHeading: {
    color: "#333333",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 18,
  },

  /* ==========================================================
     COLLECTION OVERVIEW
  ========================================================== */

  overviewBox: {
    backgroundColor: "#EDF6E8",
    borderRadius: 9,
    padding: 25,
  },

  percent: {
    color: "#4CAF50",
    fontSize: 42,
    fontWeight: "900",
  },

  overviewText: {
    color: "#777777",
    marginTop: 5,
  },

  progressBackground: {
    height: 9,
    backgroundColor: "#D5E8CF",
    borderRadius: 5,
    marginTop: 18,
    overflow: "hidden",
  },

  progressFill: {
    width: "85%",
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 5,
  },

  /* ==========================================================
     ACTIVITY
  ========================================================== */

  activity: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginTop: 5,
    marginRight: 10,
  },

  activityContent: {
    flex: 1,
  },

  activityText: {
    color: "#444444",
    fontSize: 13,
  },

  activityTime: {
    color: "#999999",
    fontSize: 10,
    marginTop: 3,
  },

});