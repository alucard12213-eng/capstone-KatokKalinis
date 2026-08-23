import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { API_URL } from "../services/api";
import { getToken } from "../services/auth";

type AttendanceStatus =
  | "present"
  | "late"
  | "absent"
  | "on_leave";

type User = {
  id: number;
  name: string;
  email: string;
};

type AttendanceRecord = {
  id: number;
  user_id: number;
  date: string;
  time_in: string | null;
  time_out: string | null;
  status: AttendanceStatus;
  remarks: string | null;
  user?: User;
};

type Employee = {
  id: number;
  name: string;
  email: string;
};

export default function Attendance() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | AttendanceStatus
  >("all");

  const [showAddModal, setShowAddModal] = useState(false);

  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  const [date, setDate] = useState("");
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [newStatus, setNewStatus] =
    useState<AttendanceStatus>("present");
  const [remarks, setRemarks] = useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD ATTENDANCE
  |--------------------------------------------------------------------------
  */

  const loadAttendance = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      if (!token) {
        showAlert(
          "Authentication Error",
          "Your login session has expired. Please login again."
        );
        return;
      }

      const response = await fetch(`${API_URL}/attendance`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("ATTENDANCE RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to load attendance. HTTP ${response.status}`
        );
      }

      setAttendance(data.attendance || []);
    } catch (error: any) {
      console.error("LOAD ATTENDANCE ERROR:", error);

      showAlert(
        "Error",
        error?.message || "Unable to load attendance records."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOAD EMPLOYEES
  |--------------------------------------------------------------------------
  */

  const loadEmployees = async () => {
    try {
      const token = await getToken();

      if (!token) {
        return;
      }

      const response = await fetch(`${API_URL}/employees`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("EMPLOYEES RESPONSE:", data);

      if (!response.ok) {
        console.error(
          "EMPLOYEE LOAD ERROR:",
          data
        );

        return;
      }

      setEmployees(
        data.employees ||
          data.data ||
          []
      );
    } catch (error) {
      console.error(
        "LOAD EMPLOYEES ERROR:",
        error
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadAttendance();
    loadEmployees();
    // These loaders are intentionally defined in the screen so they can
    // access the current API/session state without triggering reload loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FILTERED ATTENDANCE
  |--------------------------------------------------------------------------
  */

  const filteredAttendance = useMemo(() => {
    const searchText = search
      .trim()
      .toLowerCase();

    return attendance.filter((record) => {
      const employeeName =
        record.user?.name?.toLowerCase() || "";

      const employeeEmail =
        record.user?.email?.toLowerCase() || "";

      const matchesSearch =
        !searchText ||
        employeeName.includes(searchText) ||
        employeeEmail.includes(searchText) ||
        record.date.includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        record.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    attendance,
    search,
    statusFilter,
  ]);

  /*
  |--------------------------------------------------------------------------
  | STATISTICS
  |--------------------------------------------------------------------------
  */

  const presentCount = attendance.filter(
    (item) => item.status === "present"
  ).length;

  const lateCount = attendance.filter(
    (item) => item.status === "late"
  ).length;

  const absentCount = attendance.filter(
    (item) => item.status === "absent"
  ).length;

  const leaveCount = attendance.filter(
    (item) => item.status === "on_leave"
  ).length;

  /*
  |--------------------------------------------------------------------------
  | ADD ATTENDANCE
  |--------------------------------------------------------------------------
  */

  const openAddModal = () => {
    setSelectedEmployee(null);
    setDate(getToday());
    setTimeIn("");
    setTimeOut("");
    setNewStatus("present");
    setRemarks("");

    setShowAddModal(true);
  };

  const createAttendance = async () => {
    if (!selectedEmployee) {
      showAlert(
        "Missing Employee",
        "Please select an employee."
      );
      return;
    }

    if (!date.trim()) {
      showAlert(
        "Missing Date",
        "Please enter the attendance date."
      );
      return;
    }

    try {
      setSaving(true);

      const token = await getToken();

      if (!token) {
        showAlert(
          "Authentication Error",
          "Your login session has expired."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/attendance`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: selectedEmployee.id,
            date,
            time_in: timeIn || null,
            time_out: timeOut || null,
            status: newStatus,
            remarks: remarks || null,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "CREATE ATTENDANCE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to create attendance."
        );
      }

      setShowAddModal(false);

      showAlert(
        "Success",
        "Attendance record created successfully."
      );

      await loadAttendance();
    } catch (error: any) {
      console.error(
        "CREATE ATTENDANCE ERROR:",
        error
      );

      showAlert(
        "Error",
        error?.message ||
          "Unable to create attendance."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CHANGE STATUS
  |--------------------------------------------------------------------------
  */

  const requestStatusChange = (
    record: AttendanceRecord,
    newStatusValue: AttendanceStatus
  ) => {
    if (
      record.status === newStatusValue
    ) {
      return;
    }

    showConfirm(
      "Confirm Status Change",
      `Change ${record.user?.name || "this employee"}'s attendance status from "${formatStatus(
        record.status
      )}" to "${formatStatus(
        newStatusValue
      )}"?`,
      () =>
        updateStatus(
          record,
          newStatusValue
        )
    );
  };

  const updateStatus = async (
    record: AttendanceRecord,
    newStatusValue: AttendanceStatus
  ) => {
    try {
      setSaving(true);

      const token = await getToken();

      if (!token) {
        showAlert(
          "Authentication Error",
          "Your login session has expired."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/attendance/${record.id}/status`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatusValue,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "UPDATE ATTENDANCE STATUS:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to update attendance status."
        );
      }

      showAlert(
        "Success",
        "Attendance status updated successfully."
      );

      await loadAttendance();
    } catch (error: any) {
      console.error(
        "UPDATE ATTENDANCE STATUS ERROR:",
        error
      );

      showAlert(
        "Error",
        error?.message ||
          "Unable to update attendance status."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const requestDelete = (
    record: AttendanceRecord
  ) => {
    showConfirm(
      "Delete Attendance",
      `Are you sure you want to delete the attendance record for ${
        record.user?.name ||
        "this employee"
      }? This action cannot be undone.`,
      () =>
        deleteAttendance(record)
    );
  };

  const deleteAttendance = async (
    record: AttendanceRecord
  ) => {
    try {
      setSaving(true);

      const token = await getToken();

      if (!token) {
        showAlert(
          "Authentication Error",
          "Your login session has expired."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/attendance/${record.id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to delete attendance."
        );
      }

      showAlert(
        "Deleted",
        "Attendance record deleted successfully."
      );

      await loadAttendance();
    } catch (error: any) {
      console.error(
        "DELETE ATTENDANCE ERROR:",
        error
      );

      showAlert(
        "Error",
        error?.message ||
          "Unable to delete attendance."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | HELPERS
  |--------------------------------------------------------------------------
  */

  const formatStatus = (
    status: AttendanceStatus
  ) => {
    switch (status) {
      case "present":
        return "Present";

      case "late":
        return "Late";

      case "absent":
        return "Absent";

      case "on_leave":
        return "On Leave";

      default:
        return status;
    }
  };

  const getToday = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(
      now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const showAlert = (
    title: string,
    message: string
  ) => {
    if (Platform.OS === "web") {
      window.alert(
        `${title}\n\n${message}`
      );
    } else {
      Alert.alert(
        title,
        message
      );
    }
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void
  ) => {
    if (Platform.OS === "web") {
      const confirmed =
        window.confirm(
          `${title}\n\n${message}`
        );

      if (confirmed) {
        onConfirm();
      }

      return;
    }

    Alert.alert(
      title,
      message,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          style: "destructive",
          onPress: onConfirm,
        },
      ]
    );
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              Attendance
            </Text>

            <Text style={styles.subtitle}>
              Monitor and manage employee
              attendance records.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={openAddModal}
          >
            <Text style={styles.addButtonText}>
              + Add Attendance
            </Text>
          </TouchableOpacity>
        </View>

        {/* STATISTICS */}

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Present
            </Text>

            <Text
              style={[
                styles.statNumber,
                styles.presentNumber,
              ]}
            >
              {presentCount}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Late
            </Text>

            <Text
              style={[
                styles.statNumber,
                styles.lateNumber,
              ]}
            >
              {lateCount}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Absent
            </Text>

            <Text
              style={[
                styles.statNumber,
                styles.absentNumber,
              ]}
            >
              {absentCount}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              On Leave
            </Text>

            <Text
              style={[
                styles.statNumber,
                styles.leaveNumber,
              ]}
            >
              {leaveCount}
            </Text>
          </View>
        </View>

        {/* SEARCH / FILTER */}

        <View style={styles.filterContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search employee or date..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />

          <View style={styles.filterButtons}>
            {(
              [
                "all",
                "present",
                "late",
                "absent",
                "on_leave",
              ] as const
            ).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  statusFilter === status &&
                    styles.filterButtonActive,
                ]}
                onPress={() =>
                  setStatusFilter(status)
                }
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    statusFilter === status &&
                      styles.filterButtonTextActive,
                  ]}
                >
                  {status === "all"
                    ? "All"
                    : formatStatus(status)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* RECORDS */}

        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableTitle}>
              Attendance Records
            </Text>

            <TouchableOpacity
              onPress={loadAttendance}
              disabled={loading}
            >
              <Text style={styles.refreshText}>
                Refresh
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color="#4CAF50"
              />

              <Text style={styles.loadingText}>
                Loading attendance...
              </Text>
            </View>
          ) : filteredAttendance.length ===
            0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                No attendance records
              </Text>

              <Text style={styles.emptyText}>
                No records match your current
                search or filter.
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator
            >
              <View>
                {/* TABLE HEAD */}

                <View
                  style={[
                    styles.row,
                    styles.headerRow,
                  ]}
                >
                  <Text
                    style={[
                      styles.cell,
                      styles.headerCell,
                      styles.employeeCell,
                    ]}
                  >
                    Employee
                  </Text>

                  <Text
                    style={[
                      styles.cell,
                      styles.headerCell,
                    ]}
                  >
                    Date
                  </Text>

                  <Text
                    style={[
                      styles.cell,
                      styles.headerCell,
                    ]}
                  >
                    Time In
                  </Text>

                  <Text
                    style={[
                      styles.cell,
                      styles.headerCell,
                    ]}
                  >
                    Time Out
                  </Text>

                  <Text
                    style={[
                      styles.cell,
                      styles.headerCell,
                    ]}
                  >
                    Status
                  </Text>

                  <Text
                    style={[
                      styles.cell,
                      styles.headerCell,
                      styles.actionCell,
                    ]}
                  >
                    Actions
                  </Text>
                </View>

                {/* TABLE ROWS */}

                {filteredAttendance.map(
                  (record) => (
                    <View
                      key={record.id}
                      style={styles.row}
                    >
                      <View
                        style={[
                          styles.cellView,
                          styles.employeeCell,
                        ]}
                      >
                        <Text
                          style={
                            styles.employeeName
                          }
                        >
                          {record.user?.name ||
                            "Unknown Employee"}
                        </Text>

                        <Text
                          style={
                            styles.employeeEmail
                          }
                        >
                          {record.user?.email ||
                            "No email"}
                        </Text>
                      </View>

                      <Text
                        style={styles.cell}
                      >
                        {record.date}
                      </Text>

                      <Text
                        style={styles.cell}
                      >
                        {record.time_in ||
                          "—"}
                      </Text>

                      <Text
                        style={styles.cell}
                      >
                        {record.time_out ||
                          "—"}
                      </Text>

                      <View
                        style={[
                          styles.cellView,
                          styles.statusCell,
                        ]}
                      >
                        <TouchableOpacity
                          style={[
                            styles.statusBadge,
                            record.status ===
                              "present" &&
                              styles.presentBadge,
                            record.status ===
                              "late" &&
                              styles.lateBadge,
                            record.status ===
                              "absent" &&
                              styles.absentBadge,
                            record.status ===
                              "on_leave" &&
                              styles.leaveBadge,
                          ]}
                          onPress={() =>
                            showStatusMenu(
                              record,
                              requestStatusChange
                            )
                          }
                        >
                          <Text
                            style={
                              styles.statusText
                            }
                          >
                            {formatStatus(
                              record.status
                            )}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View
                        style={[
                          styles.cellView,
                          styles.actionCell,
                        ]}
                      >
                        <TouchableOpacity
                          style={
                            styles.deleteButton
                          }
                          onPress={() =>
                            requestDelete(
                              record
                            )
                          }
                          disabled={saving}
                        >
                          <Text
                            style={
                              styles.deleteText
                            }
                          >
                            Delete
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </ScrollView>

      {/* ADD ATTENDANCE MODAL */}

      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowAddModal(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <ScrollView
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalTitle}>
                Add Attendance
              </Text>

              <Text style={styles.modalSubtitle}>
                Create a new employee attendance
                record.
              </Text>

              <Text style={styles.inputLabel}>
                Employee
              </Text>

              <View
                style={styles.employeePicker}
              >
                {employees.length === 0 ? (
                  <Text
                    style={
                      styles.noEmployeeText
                    }
                  >
                    No employees available.
                  </Text>
                ) : (
                  employees.map(
                    (employee) => (
                      <TouchableOpacity
                        key={employee.id}
                        style={[
                          styles.employeeOption,
                          selectedEmployee?.id ===
                            employee.id &&
                            styles.employeeOptionActive,
                        ]}
                        onPress={() =>
                          setSelectedEmployee(
                            employee
                          )
                        }
                      >
                        <Text
                          style={[
                            styles.employeeOptionName,
                            selectedEmployee?.id ===
                              employee.id &&
                              styles.employeeOptionNameActive,
                          ]}
                        >
                          {employee.name}
                        </Text>

                        <Text
                          style={
                            styles.employeeOptionEmail
                          }
                        >
                          {employee.email}
                        </Text>
                      </TouchableOpacity>
                    )
                  )
                )}
              </View>

              <Text style={styles.inputLabel}>
                Date
              </Text>

              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
                value={date}
                onChangeText={setDate}
              />

              <Text style={styles.inputLabel}>
                Time In
              </Text>

              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                placeholderTextColor="#999"
                value={timeIn}
                onChangeText={setTimeIn}
              />

              <Text style={styles.inputLabel}>
                Time Out
              </Text>

              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                placeholderTextColor="#999"
                value={timeOut}
                onChangeText={setTimeOut}
              />

              <Text style={styles.inputLabel}>
                Status
              </Text>

              <View
                style={styles.statusOptions}
              >
                {(
                  [
                    "present",
                    "late",
                    "absent",
                    "on_leave",
                  ] as AttendanceStatus[]
                ).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOption,
                      newStatus === status &&
                        styles.statusOptionActive,
                    ]}
                    onPress={() =>
                      setNewStatus(status)
                    }
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        newStatus === status &&
                          styles.statusOptionTextActive,
                      ]}
                    >
                      {formatStatus(status)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>
                Remarks
              </Text>

              <TextInput
                style={[
                  styles.input,
                  styles.remarksInput,
                ]}
                placeholder="Optional remarks"
                placeholderTextColor="#999"
                value={remarks}
                onChangeText={setRemarks}
                multiline
              />

              <View
                style={styles.modalButtons}
              >
                <TouchableOpacity
                  style={
                    styles.cancelButton
                  }
                  onPress={() =>
                    setShowAddModal(false)
                  }
                  disabled={saving}
                >
                  <Text
                    style={
                      styles.cancelButtonText
                    }
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    saving &&
                      styles.disabledButton,
                  ]}
                  onPress={createAttendance}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator
                      color="#FFFFFF"
                    />
                  ) : (
                    <Text
                      style={
                        styles.saveButtonText
                      }
                    >
                      Save Attendance
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| STATUS MENU
|--------------------------------------------------------------------------
*/

function showStatusMenu(
  record: AttendanceRecord,
  callback: (
    record: AttendanceRecord,
    status: AttendanceStatus
  ) => void
) {
  const statuses: AttendanceStatus[] = [
    "present",
    "late",
    "absent",
    "on_leave",
  ];

  if (Platform.OS === "web") {
    const choice = window.prompt(
      `Current status: ${formatStatusStatic(
        record.status
      )}\n\nEnter:\n1 = Present\n2 = Late\n3 = Absent\n4 = On Leave`
    );

    const statusMap: Record<
      string,
      AttendanceStatus
    > = {
      "1": "present",
      "2": "late",
      "3": "absent",
      "4": "on_leave",
    };

    if (
      choice &&
      statusMap[choice] &&
      statuses.includes(
        statusMap[choice]
      )
    ) {
      callback(
        record,
        statusMap[choice]
      );
    }

    return;
  }

  Alert.alert(
    "Change Attendance Status",
    `Current status: ${formatStatusStatic(
      record.status
    )}`,
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      ...statuses.map((status) => ({
        text: formatStatusStatic(status),
        onPress: () =>
          callback(record, status),
      })),
    ]
  );
}

function formatStatusStatic(
  status: AttendanceStatus
) {
  switch (status) {
    case "present":
      return "Present";

    case "late":
      return "Late";

    case "absent":
      return "Absent";

    case "on_leave":
      return "On Leave";

    default:
      return status;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7F4",
  },

  content: {
    padding: 28,
    paddingBottom: 60,
  },

  /*
  |--------------------------------------------------------------------------
  | HEADER
  |--------------------------------------------------------------------------
  */

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    gap: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#252525",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: "#777",
  },

  addButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 9,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  /*
  |--------------------------------------------------------------------------
  | STATISTICS
  |--------------------------------------------------------------------------
  */

  statsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 22,
    flexWrap: "wrap",
  },

  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    minWidth: 180,
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E8E3",
  },

  statLabel: {
    color: "#777",
    fontSize: 13,
    fontWeight: "600",
  },

  statNumber: {
    marginTop: 7,
    fontSize: 28,
    fontWeight: "900",
  },

  presentNumber: {
    color: "#4CAF50",
  },

  lateNumber: {
    color: "#E6A700",
  },

  absentNumber: {
    color: "#E53935",
  },

  leaveNumber: {
    color: "#7E57C2",
  },

  /*
  |--------------------------------------------------------------------------
  | FILTERS
  |--------------------------------------------------------------------------
  */

  filterContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E8E3",
  },

  searchInput: {
    height: 46,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    paddingHorizontal: 14,
    color: "#333",
    fontSize: 14,
    backgroundColor: "#FAFAFA",
  },

  filterButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    flexWrap: "wrap",
  },

  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F3F0",
  },

  filterButtonActive: {
    backgroundColor: "#4CAF50",
  },

  filterButtonText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "700",
  },

  filterButtonTextActive: {
    color: "#FFFFFF",
  },

  /*
  |--------------------------------------------------------------------------
  | TABLE
  |--------------------------------------------------------------------------
  */

  tableCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E8E3",
    overflow: "hidden",
  },

  tableHeader: {
    minHeight: 65,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },

  tableTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#333",
  },

  refreshText: {
    color: "#4CAF50",
    fontSize: 13,
    fontWeight: "800",
  },

  row: {
    flexDirection: "row",
    minHeight: 72,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  headerRow: {
    backgroundColor: "#F8FAF7",
    minHeight: 50,
  },

  cell: {
    width: 140,
    paddingHorizontal: 14,
    color: "#555",
    fontSize: 13,
  },

  cellView: {
    width: 140,
    paddingHorizontal: 14,
    justifyContent: "center",
  },

  headerCell: {
    color: "#666",
    fontWeight: "800",
    fontSize: 12,
  },

  employeeCell: {
    width: 230,
  },

  actionCell: {
    width: 120,
  },

  statusCell: {
    width: 145,
  },

  employeeName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#333",
  },

  employeeEmail: {
    marginTop: 3,
    fontSize: 11,
    color: "#999",
  },

  /*
  |--------------------------------------------------------------------------
  | STATUS
  |--------------------------------------------------------------------------
  */

  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },

  presentBadge: {
    backgroundColor: "#E5F6E7",
  },

  lateBadge: {
    backgroundColor: "#FFF5D6",
  },

  absentBadge: {
    backgroundColor: "#FDE7E7",
  },

  leaveBadge: {
    backgroundColor: "#EEE7FA",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#444",
  },

  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 7,
    backgroundColor: "#FDE7E7",
  },

  deleteText: {
    color: "#D32F2F",
    fontSize: 11,
    fontWeight: "800",
  },

  /*
  |--------------------------------------------------------------------------
  | LOADING / EMPTY
  |--------------------------------------------------------------------------
  */

  loadingContainer: {
    padding: 60,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#777",
    fontSize: 13,
  },

  emptyContainer: {
    padding: 60,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#444",
  },

  emptyText: {
    marginTop: 6,
    color: "#999",
    fontSize: 13,
    textAlign: "center",
  },

  /*
  |--------------------------------------------------------------------------
  | MODAL
  |--------------------------------------------------------------------------
  */

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modal: {
    width: "100%",
    maxWidth: 600,
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 25,
  },

  modalTitle: {
    fontSize: 23,
    fontWeight: "900",
    color: "#333",
  },

  modalSubtitle: {
    marginTop: 5,
    marginBottom: 22,
    color: "#888",
    fontSize: 13,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#444",
    marginBottom: 7,
    marginTop: 12,
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    paddingHorizontal: 13,
    color: "#333",
    backgroundColor: "#FAFAFA",
  },

  remarksInput: {
    height: 85,
    paddingTop: 12,
    textAlignVertical: "top",
  },

  employeePicker: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    maxHeight: 170,
    overflow: "hidden",
  },

  employeeOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  employeeOptionActive: {
    backgroundColor: "#EAF7E9",
  },

  employeeOptionName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#333",
  },

  employeeOptionNameActive: {
    color: "#4CAF50",
  },

  employeeOptionEmail: {
    marginTop: 2,
    fontSize: 11,
    color: "#999",
  },

  noEmployeeText: {
    padding: 15,
    color: "#999",
    fontSize: 13,
  },

  statusOptions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },

  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#F0F2EF",
  },

  statusOptionActive: {
    backgroundColor: "#4CAF50",
  },

  statusOptionText: {
    color: "#666",
    fontSize: 11,
    fontWeight: "700",
  },

  statusOptionTextActive: {
    color: "#FFFFFF",
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 25,
  },

  cancelButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#EEEEEE",
  },

  cancelButtonText: {
    color: "#555",
    fontSize: 13,
    fontWeight: "800",
  },

  saveButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    minWidth: 145,
    alignItems: "center",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.6,
  },
});
