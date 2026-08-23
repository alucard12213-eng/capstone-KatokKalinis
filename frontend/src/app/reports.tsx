import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { API_URL } from "../services/api";
import { getToken } from "../services/auth";

type ReportStatus =
  | "pending"
  | "reviewed"
  | "resolved"
  | "rejected";

type Report = {
  id: number;
  user_id?: number | null;
  barangay_id?: number | null;
  title: string;
  description?: string | null;
  location?: string | null;
  image?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  status: ReportStatus;
  admin_notes?: string | null;
  created_at?: string;
  updated_at?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
  barangay?: {
    id: number;
    name: string;
  } | null;
};

type PendingStatusChange = {
  report: Report;
  status: ReportStatus;
};

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [selectedReport, setSelectedReport] =
    useState<Report | null>(null);

  const [detailsVisible, setDetailsVisible] =
    useState(false);

  const [confirmVisible, setConfirmVisible] =
    useState(false);

  const [pendingStatusChange, setPendingStatusChange] =
    useState<PendingStatusChange | null>(null);

  const [adminNotes, setAdminNotes] =
    useState("");

  /*
   * --------------------------------------------------
   * LOAD REPORTS
   * --------------------------------------------------
   */

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);

      const token = await getToken();

      if (!token) {
        showAlert(
          "Authentication Error",
          "You are not logged in. Please log in again."
        );
        return;
      }

      const response = await fetch(`${API_URL}/reports`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const responseText = await response.text();

      let data: any = null;

      try {
        data = JSON.parse(responseText);
      } catch {
        console.error(
          "REPORTS RESPONSE IS NOT VALID JSON:",
          responseText
        );
      }

      console.log(
        "REPORTS HTTP STATUS:",
        response.status
      );

      console.log("REPORTS RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to load reports. HTTP ${response.status}`
        );
      }

      const reportData =
        data?.reports ||
        data?.data ||
        data;

      if (Array.isArray(reportData)) {
        setReports(reportData);
      } else {
        setReports([]);
      }
    } catch (error: any) {
      console.error(
        "LOAD REPORTS ERROR:",
        error
      );

      showAlert(
        "Reports Error",
        error?.message ||
          "Unable to load reports from the server."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * --------------------------------------------------
   * INITIAL LOAD
   * --------------------------------------------------
   */

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  /*
   * --------------------------------------------------
   * ALERT
   * --------------------------------------------------
   */

  const showAlert = (
    title: string,
    message: string
  ) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  /*
   * --------------------------------------------------
   * CONFIRM STATUS CHANGE
   * --------------------------------------------------
   *
   * IMPORTANT:
   *
   * Clicking a status button DOES NOT immediately
   * call the API.
   *
   * It first opens the confirmation dialog.
   */

  const requestStatusChange = (
    report: Report,
    newStatus: ReportStatus
  ) => {
    if (report.status === newStatus) {
      return;
    }

    setPendingStatusChange({
      report,
      status: newStatus,
    });

    setConfirmVisible(true);
  };

  /*
   * --------------------------------------------------
   * CONFIRM STATUS CHANGE
   * --------------------------------------------------
   *
   * The API request happens ONLY here.
   *
   * This function is called after the admin presses
   * CONFIRM.
   */

  const confirmStatusChange = async () => {
    if (!pendingStatusChange) {
      return;
    }

    const {
      report,
      status,
    } = pendingStatusChange;

    try {
      setUpdating(true);

      const token = await getToken();

      if (!token) {
        showAlert(
          "Authentication Error",
          "Your login session has expired. Please log in again."
        );

        return;
      }

      console.log(
        "UPDATING REPORT:",
        report.id
      );

      console.log(
        "NEW STATUS:",
        status
      );

      const response = await fetch(
        `${API_URL}/reports/${report.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            admin_notes:
              adminNotes.trim() || null,
          }),
        }
      );

      const responseText =
        await response.text();

      let data: any = null;

      try {
        data = JSON.parse(responseText);
      } catch {
        console.error(
          "UPDATE RESPONSE IS NOT VALID JSON:",
          responseText
        );
      }

      console.log(
        "UPDATE REPORT HTTP STATUS:",
        response.status
      );

      console.log(
        "UPDATE REPORT RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to update report. HTTP ${response.status}`
        );
      }

      /*
       * Update the report locally after the
       * server confirms the change.
       */

      setReports((currentReports) =>
        currentReports.map((item) =>
          item.id === report.id
            ? {
                ...item,
                status,
                admin_notes:
                  adminNotes.trim() || null,
              }
            : item
        )
      );

      /*
       * Update selected report if the details
       * modal is currently open.
       */

      setSelectedReport((current) => {
        if (!current || current.id !== report.id) {
          return current;
        }

        return {
          ...current,
          status,
          admin_notes:
            adminNotes.trim() || null,
        };
      });

      setConfirmVisible(false);
      setPendingStatusChange(null);
      setAdminNotes("");

      showAlert(
        "Success",
        `Report #${report.id} has been marked as ${formatStatus(
          status
        ).toLowerCase()}.`
      );
    } catch (error: any) {
      console.error(
        "UPDATE REPORT ERROR:",
        error
      );

      showAlert(
        "Update Failed",
        error?.message ||
          "The report status could not be updated."
      );
    } finally {
      setUpdating(false);
    }
  };

  /*
   * --------------------------------------------------
   * OPEN REPORT DETAILS
   * --------------------------------------------------
   */

  const openReport = (report: Report) => {
    setSelectedReport(report);
    setAdminNotes(report.admin_notes || "");
    setDetailsVisible(true);
  };

  /*
   * --------------------------------------------------
   * CLOSE REPORT DETAILS
   * --------------------------------------------------
   */

  const closeDetails = () => {
    if (updating) {
      return;
    }

    setDetailsVisible(false);
    setSelectedReport(null);
    setAdminNotes("");
  };

  /*
   * --------------------------------------------------
   * CANCEL CONFIRMATION
   * --------------------------------------------------
   */

  const cancelStatusChange = () => {
    if (updating) {
      return;
    }

    setConfirmVisible(false);
    setPendingStatusChange(null);
  };

  /*
   * --------------------------------------------------
   * STATUS HELPERS
   * --------------------------------------------------
   */

  const formatStatus = (
    status: ReportStatus
  ) => {
    switch (status) {
      case "pending":
        return "Pending";

      case "reviewed":
        return "Reviewed";

      case "resolved":
        return "Resolved";

      case "rejected":
        return "Rejected";

      default:
        return status;
    }
  };

  const getStatusColor = (
    status: ReportStatus
  ) => {
    switch (status) {
      case "pending":
        return "#F59E0B";

      case "reviewed":
        return "#3B82F6";

      case "resolved":
        return "#22C55E";

      case "rejected":
        return "#EF4444";

      default:
        return "#777777";
    }
  };

  const getStatusDescription = (
    status: ReportStatus
  ) => {
    switch (status) {
      case "reviewed":
        return "The administrator has reviewed this report.";

      case "resolved":
        return "The reported issue has been resolved.";

      case "rejected":
        return "The report has been rejected.";

      case "pending":
      default:
        return "The report is waiting for administrator review.";
    }
  };

  /*
   * --------------------------------------------------
   * STATISTICS
   * --------------------------------------------------
   */

  const pendingCount = reports.filter(
    (report) =>
      report.status === "pending"
  ).length;

  const reviewedCount = reports.filter(
    (report) =>
      report.status === "reviewed"
  ).length;

  const resolvedCount = reports.filter(
    (report) =>
      report.status === "resolved"
  ).length;

  const rejectedCount = reports.filter(
    (report) =>
      report.status === "rejected"
  ).length;

  /*
   * --------------------------------------------------
   * DATE FORMAT
   * --------------------------------------------------
   */

  const formatDate = (
    date?: string
  ) => {
    if (!date) {
      return "Unknown date";
    }

    try {
      return new Date(date).toLocaleString();
    } catch {
      return date;
    }
  };

  /*
   * --------------------------------------------------
   * RENDER
   * --------------------------------------------------
   */

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              Reports
            </Text>

            <Text style={styles.subtitle}>
              Review and manage sanitation reports
              submitted by users.
            </Text>
          </View>

          <Pressable
            style={styles.refreshButton}
            onPress={loadReports}
            disabled={loading || updating}
          >
            <Text style={styles.refreshText}>
              Refresh
            </Text>
          </Pressable>
        </View>

        {/* ------------------------------------------
            STATISTICS
        ------------------------------------------ */}

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Total
            </Text>

            <Text style={styles.statNumber}>
              {reports.length}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Pending
            </Text>

            <Text
              style={[
                styles.statNumber,
                styles.pendingNumber,
              ]}
            >
              {pendingCount}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Reviewed
            </Text>

            <Text
              style={[
                styles.statNumber,
                styles.reviewedNumber,
              ]}
            >
              {reviewedCount}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Resolved
            </Text>

            <Text
              style={[
                styles.statNumber,
                styles.resolvedNumber,
              ]}
            >
              {resolvedCount}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Rejected
            </Text>

            <Text
              style={[
                styles.statNumber,
                styles.rejectedNumber,
              ]}
            >
              {rejectedCount}
            </Text>
          </View>
        </View>

        {/* ------------------------------------------
            REPORT LIST
        ------------------------------------------ */}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color="#4CAF50"
            />

            <Text style={styles.loadingText}>
              Loading reports...
            </Text>
          </View>
        ) : reports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              ✓
            </Text>

            <Text style={styles.emptyTitle}>
              No Reports
            </Text>

            <Text style={styles.emptyText}>
              There are currently no reports to
              display.
            </Text>
          </View>
        ) : (
          <View style={styles.reportList}>
            {reports.map((report) => (
              <View
                key={report.id}
                style={styles.reportCard}
              >
                <View style={styles.reportTop}>
                  <View style={styles.reportIdBox}>
                    <Text style={styles.reportId}>
                      #{report.id}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          getStatusColor(
                            report.status
                          ) + "18",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            getStatusColor(
                              report.status
                            ),
                        },
                      ]}
                    >
                      {formatStatus(
                        report.status
                      )}
                    </Text>
                  </View>
                </View>

                <Text style={styles.reportTitle}>
                  {report.title}
                </Text>

                <Text
                  style={styles.reportDescription}
                  numberOfLines={3}
                >
                  {report.description ||
                    "No description provided."}
                </Text>

                <View style={styles.reportInfo}>
                  <Text style={styles.infoLabel}>
                    Location
                  </Text>

                  <Text style={styles.infoValue}>
                    {report.location ||
                      "No location provided"}
                  </Text>
                </View>

                <View style={styles.reportInfo}>
                  <Text style={styles.infoLabel}>
                    Submitted
                  </Text>

                  <Text style={styles.infoValue}>
                    {formatDate(
                      report.created_at
                    )}
                  </Text>
                </View>

                <View style={styles.divider} />

                {/* --------------------------------------
                    STATUS BUTTONS
                -------------------------------------- */}

                <View style={styles.actionRow}>
                  <Pressable
                    style={[
                      styles.actionButton,
                      styles.viewButton,
                    ]}
                    onPress={() =>
                      openReport(report)
                    }
                    disabled={updating}
                  >
                    <Text
                      style={styles.viewButtonText}
                    >
                      View
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.actionButton,
                      styles.reviewButton,
                      report.status ===
                        "reviewed" &&
                        styles.disabledButton,
                    ]}
                    onPress={() =>
                      requestStatusChange(
                        report,
                        "reviewed"
                      )
                    }
                    disabled={
                      updating ||
                      report.status ===
                        "reviewed"
                    }
                  >
                    <Text
                      style={
                        styles.reviewButtonText
                      }
                    >
                      Review
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.actionButton,
                      styles.resolveButton,
                      report.status ===
                        "resolved" &&
                        styles.disabledButton,
                    ]}
                    onPress={() =>
                      requestStatusChange(
                        report,
                        "resolved"
                      )
                    }
                    disabled={
                      updating ||
                      report.status ===
                        "resolved"
                    }
                  >
                    <Text
                      style={
                        styles.resolveButtonText
                      }
                    >
                      Resolve
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.actionButton,
                      styles.rejectButton,
                      report.status ===
                        "rejected" &&
                        styles.disabledButton,
                    ]}
                    onPress={() =>
                      requestStatusChange(
                        report,
                        "rejected"
                      )
                    }
                    disabled={
                      updating ||
                      report.status ===
                        "rejected"
                    }
                  >
                    <Text
                      style={
                        styles.rejectButtonText
                      }
                    >
                      Reject
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ==================================================
          REPORT DETAILS MODAL
      ================================================== */}

      <Modal
        visible={detailsVisible}
        transparent
        animationType="fade"
        onRequestClose={closeDetails}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModal}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Report Details
                </Text>

                <Pressable
                  onPress={closeDetails}
                  disabled={updating}
                >
                  <Text style={styles.closeText}>
                    ×
                  </Text>
                </Pressable>
              </View>

              {selectedReport && (
                <>
                  <View
                    style={styles.detailStatusRow}
                  >
                    <Text style={styles.detailId}>
                      Report #
                      {selectedReport.id}
                    </Text>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            getStatusColor(
                              selectedReport.status
                            ) + "18",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              getStatusColor(
                                selectedReport.status
                              ),
                          },
                        ]}
                      >
                        {formatStatus(
                          selectedReport.status
                        )}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.detailTitle}>
                    {selectedReport.title}
                  </Text>

                  <Text style={styles.detailLabel}>
                    Description
                  </Text>

                  <Text style={styles.detailText}>
                    {selectedReport.description ||
                      "No description provided."}
                  </Text>

                  <Text style={styles.detailLabel}>
                    Location
                  </Text>

                  <Text style={styles.detailText}>
                    {selectedReport.location ||
                      "No location provided"}
                  </Text>

                  {selectedReport.latitude &&
                    selectedReport.longitude && (
                      <>
                        <Text
                          style={
                            styles.detailLabel
                          }
                        >
                          Coordinates
                        </Text>

                        <Text
                          style={styles.detailText}
                        >
                          {selectedReport.latitude},{" "}
                          {selectedReport.longitude}
                        </Text>
                      </>
                    )}

                  <Text style={styles.detailLabel}>
                    Submitted
                  </Text>

                  <Text style={styles.detailText}>
                    {formatDate(
                      selectedReport.created_at
                    )}
                  </Text>

                  {selectedReport.user && (
                    <>
                      <Text
                        style={
                          styles.detailLabel
                        }
                      >
                        Submitted By
                      </Text>

                      <Text
                        style={styles.detailText}
                      >
                        {selectedReport.user.name}
                      </Text>

                      <Text
                        style={styles.detailEmail}
                      >
                        {selectedReport.user.email}
                      </Text>
                    </>
                  )}

                  <Text style={styles.detailLabel}>
                    Admin Notes
                  </Text>

                  <TextInput
                    style={styles.notesInput}
                    value={adminNotes}
                    onChangeText={setAdminNotes}
                    placeholder="Enter admin notes..."
                    placeholderTextColor="#999"
                    multiline
                    editable={!updating}
                  />

                  <Text
                    style={
                      styles.statusExplanation
                    }
                  >
                    Current status:{" "}
                    {getStatusDescription(
                      selectedReport.status
                    )}
                  </Text>

                  <View
                    style={styles.modalActions}
                  >
                    <Pressable
                      style={[
                        styles.modalAction,
                        styles.reviewModalButton,
                      ]}
                      onPress={() =>
                        requestStatusChange(
                          selectedReport,
                          "reviewed"
                        )
                      }
                      disabled={
                        updating ||
                        selectedReport.status ===
                          "reviewed"
                      }
                    >
                      <Text
                        style={
                          styles.modalActionText
                        }
                      >
                        Mark Reviewed
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.modalAction,
                        styles.resolveModalButton,
                      ]}
                      onPress={() =>
                        requestStatusChange(
                          selectedReport,
                          "resolved"
                        )
                      }
                      disabled={
                        updating ||
                        selectedReport.status ===
                          "resolved"
                      }
                    >
                      <Text
                        style={
                          styles.modalActionText
                        }
                      >
                        Mark Resolved
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.modalAction,
                        styles.rejectModalButton,
                      ]}
                      onPress={() =>
                        requestStatusChange(
                          selectedReport,
                          "rejected"
                        )
                      }
                      disabled={
                        updating ||
                        selectedReport.status ===
                          "rejected"
                      }
                    >
                      <Text
                        style={
                          styles.modalActionText
                        }
                      >
                        Reject Report
                      </Text>
                    </Pressable>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ==================================================
          CONFIRMATION MODAL
      ================================================== */}

      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelStatusChange}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <View style={styles.confirmIcon}>
              <Text style={styles.confirmIconText}>
                !
              </Text>
            </View>

            <Text style={styles.confirmTitle}>
              Confirm Status Change
            </Text>

            {pendingStatusChange && (
              <>
                <Text
                  style={styles.confirmMessage}
                >
                  Are you sure you want to change
                  this report&apos;s status?
                </Text>

                <View
                  style={styles.confirmReportBox}
                >
                  <Text
                    style={styles.confirmReportTitle}
                  >
                    Report #
                    {pendingStatusChange.report.id}
                  </Text>

                  <Text
                    style={
                      styles.confirmReportName
                    }
                  >
                    {pendingStatusChange.report.title}
                  </Text>

                  <View
                    style={
                      styles.confirmStatusChange
                    }
                  >
                    <View
                      style={[
                        styles.confirmStatusBadge,
                        {
                          backgroundColor:
                            getStatusColor(
                              pendingStatusChange
                                .report.status
                            ) + "18",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.confirmStatusText,
                          {
                            color:
                              getStatusColor(
                                pendingStatusChange
                                  .report.status
                              ),
                          },
                        ]}
                      >
                        {formatStatus(
                          pendingStatusChange
                            .report.status
                        )}
                      </Text>
                    </View>

                    <Text
                      style={styles.arrow}
                    >
                      →
                    </Text>

                    <View
                      style={[
                        styles.confirmStatusBadge,
                        {
                          backgroundColor:
                            getStatusColor(
                              pendingStatusChange.status
                            ) + "18",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.confirmStatusText,
                          {
                            color:
                              getStatusColor(
                                pendingStatusChange.status
                              ),
                          },
                        ]}
                      >
                        {formatStatus(
                          pendingStatusChange.status
                        )}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text
                  style={styles.warningText}
                >
                  This action will update the report
                  in the database.
                </Text>

                <View
                  style={styles.confirmActions}
                >
                  <Pressable
                    style={[
                      styles.confirmButton,
                      styles.cancelButton,
                    ]}
                    onPress={
                      cancelStatusChange
                    }
                    disabled={updating}
                  >
                    <Text
                      style={
                        styles.cancelButtonText
                      }
                    >
                      Cancel
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.confirmButton,
                      styles.confirmButtonPrimary,
                      updating &&
                        styles.disabledButton,
                    ]}
                    onPress={
                      confirmStatusChange
                    }
                    disabled={updating}
                  >
                    {updating ? (
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                      />
                    ) : (
                      <Text
                        style={
                          styles.confirmButtonText
                        }
                      >
                        Confirm
                      </Text>
                    )}
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

/*
|==========================================================
| STYLES
|==========================================================
*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7F4",
  },

  scrollContent: {
    padding: 30,
    paddingBottom: 50,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#222222",
  },

  subtitle: {
    marginTop: 5,
    color: "#777777",
    fontSize: 14,
  },

  refreshButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },

  refreshText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
    marginBottom: 25,
  },

  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    minWidth: 140,
    flexGrow: 1,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  statLabel: {
    color: "#777777",
    fontSize: 13,
    fontWeight: "700",
  },

  statNumber: {
    marginTop: 5,
    color: "#222222",
    fontSize: 28,
    fontWeight: "900",
  },

  pendingNumber: {
    color: "#F59E0B",
  },

  reviewedNumber: {
    color: "#3B82F6",
  },

  resolvedNumber: {
    color: "#22C55E",
  },

  rejectedNumber: {
    color: "#EF4444",
  },

  loadingContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 50,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#777777",
  },

  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 60,
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 35,
    color: "#4CAF50",
    fontWeight: "900",
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "800",
    color: "#333333",
  },

  emptyText: {
    marginTop: 6,
    color: "#888888",
  },

  reportList: {
    gap: 18,
  },

  reportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 22,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  reportTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  reportIdBox: {
    backgroundColor: "#EDF6E8",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
  },

  reportId: {
    color: "#4CAF50",
    fontWeight: "900",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "800",
  },

  reportTitle: {
    marginTop: 16,
    fontSize: 19,
    fontWeight: "800",
    color: "#222222",
  },

  reportDescription: {
    marginTop: 7,
    color: "#666666",
    fontSize: 14,
    lineHeight: 21,
  },

  reportInfo: {
    marginTop: 13,
  },

  infoLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#999999",
    textTransform: "uppercase",
  },

  infoValue: {
    marginTop: 2,
    fontSize: 14,
    color: "#444444",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 18,
  },

  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  actionButton: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 7,
  },

  viewButton: {
    backgroundColor: "#F0F0F0",
  },

  viewButtonText: {
    color: "#444444",
    fontWeight: "800",
    fontSize: 12,
  },

  reviewButton: {
    backgroundColor: "#E8F1FF",
  },

  reviewButtonText: {
    color: "#3B82F6",
    fontWeight: "800",
    fontSize: 12,
  },

  resolveButton: {
    backgroundColor: "#EAF8EE",
  },

  resolveButtonText: {
    color: "#22C55E",
    fontWeight: "800",
    fontSize: 12,
  },

  rejectButton: {
    backgroundColor: "#FDECEC",
  },

  rejectButtonText: {
    color: "#EF4444",
    fontWeight: "800",
    fontSize: 12,
  },

  disabledButton: {
    opacity: 0.45,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  detailsModal: {
    width: "100%",
    maxWidth: 650,
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 25,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 23,
    fontWeight: "900",
    color: "#222222",
  },

  closeText: {
    fontSize: 32,
    color: "#777777",
    lineHeight: 32,
  },

  detailStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  detailId: {
    color: "#4CAF50",
    fontWeight: "900",
  },

  detailTitle: {
    marginTop: 15,
    fontSize: 23,
    fontWeight: "900",
    color: "#222222",
  },

  detailLabel: {
    marginTop: 20,
    marginBottom: 6,
    fontSize: 12,
    fontWeight: "900",
    color: "#888888",
    textTransform: "uppercase",
  },

  detailText: {
    color: "#444444",
    fontSize: 14,
    lineHeight: 21,
  },

  detailEmail: {
    color: "#888888",
    fontSize: 13,
    marginTop: 3,
  },

  notesInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    padding: 12,
    textAlignVertical: "top",
    color: "#333333",
    backgroundColor: "#FAFAFA",
  },

  statusExplanation: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F5F7F4",
    borderRadius: 8,
    color: "#666666",
    fontSize: 12,
    lineHeight: 18,
  },

  modalActions: {
    marginTop: 20,
    gap: 10,
  },

  modalAction: {
    minHeight: 45,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },

  reviewModalButton: {
    backgroundColor: "#3B82F6",
  },

  resolveModalButton: {
    backgroundColor: "#22C55E",
  },

  rejectModalButton: {
    backgroundColor: "#EF4444",
  },

  modalActionText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  confirmModal: {
    width: "100%",
    maxWidth: 450,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 28,
  },

  confirmIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFF4DD",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },

  confirmIconText: {
    color: "#F59E0B",
    fontSize: 28,
    fontWeight: "900",
  },

  confirmTitle: {
    textAlign: "center",
    marginTop: 15,
    fontSize: 21,
    fontWeight: "900",
    color: "#222222",
  },

  confirmMessage: {
    textAlign: "center",
    marginTop: 8,
    color: "#666666",
    fontSize: 14,
    lineHeight: 21,
  },

  confirmReportBox: {
    marginTop: 18,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#F5F7F4",
  },

  confirmReportTitle: {
    color: "#4CAF50",
    fontWeight: "900",
    fontSize: 13,
  },

  confirmReportName: {
    marginTop: 5,
    color: "#333333",
    fontSize: 16,
    fontWeight: "800",
  },

  confirmStatusChange: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  confirmStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  confirmStatusText: {
    fontSize: 12,
    fontWeight: "800",
  },

  arrow: {
    color: "#888888",
    fontSize: 20,
    fontWeight: "800",
  },

  warningText: {
    textAlign: "center",
    marginTop: 15,
    color: "#999999",
    fontSize: 12,
  },

  confirmActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },

  confirmButton: {
    flex: 1,
    height: 46,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },

  cancelButton: {
    backgroundColor: "#EEEEEE",
  },

  cancelButtonText: {
    color: "#555555",
    fontWeight: "800",
  },

  confirmButtonPrimary: {
    backgroundColor: "#4CAF50",
  },

  confirmButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});