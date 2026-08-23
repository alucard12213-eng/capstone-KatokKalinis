import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    createEmployee,
    deleteEmployee,
    getEmployees,
    updateEmployee,
} from "../services/api";

type Employee = {
  id: number;
  name: string;
  email: string;
  roles?: {
    id: number;
    name: string;
  }[];
};

export default function EmployeesScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] =
    useState<Employee | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);

      const data = await getEmployees();

      setEmployees(data.employees || []);
    } catch (error) {
      console.error(error);

      showMessage(
        "Error",
        "Unable to load employees. Make sure Laravel is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function showMessage(title: string, message: string) {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  }

  function openAddForm() {
    setEditingEmployee(null);
    setName("");
    setEmail("");
    setPassword("");
    setShowForm(true);
  }

  function openEditForm(employee: Employee) {
    setEditingEmployee(employee);
    setName(employee.name);
    setEmail(employee.email);
    setPassword("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingEmployee(null);
    setName("");
    setEmail("");
    setPassword("");
  }

  async function handleSave() {
    if (!name.trim() || !email.trim()) {
      showMessage("Required", "Please enter the employee name and email.");
      return;
    }

    if (!editingEmployee && !password.trim()) {
      showMessage("Required", "Please enter a password.");
      return;
    }

    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, {
          name: name.trim(),
          email: email.trim(),
          ...(password.trim() ? { password: password.trim() } : {}),
        });

        showMessage("Success", "Employee updated successfully.");
      } else {
        await createEmployee({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
        });

        showMessage("Success", "Employee created successfully.");
      }

      closeForm();
      await loadEmployees();
    } catch (error) {
      console.error(error);

      showMessage(
        "Error",
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    }
  }

  async function handleDelete(employee: Employee) {
    const confirmed =
      Platform.OS === "web"
        ? window.confirm(
            `Are you sure you want to delete ${employee.name}?`
          )
        : await new Promise<boolean>((resolve) => {
            Alert.alert(
              "Delete Employee",
              `Are you sure you want to delete ${employee.name}?`,
              [
                {
                  text: "Cancel",
                  style: "cancel",
                  onPress: () => resolve(false),
                },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => resolve(true),
                },
              ]
            );
          });

    if (!confirmed) {
      return;
    }

    try {
      await deleteEmployee(employee.id);

      showMessage("Success", "Employee deleted successfully.");

      await loadEmployees();
    } catch (error) {
      console.error(error);

      showMessage(
        "Error",
        error instanceof Error
          ? error.message
          : "Unable to delete employee."
      );
    }
  }

  return (
    <View style={styles.container}>

      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Employees</Text>
            <Text style={styles.pageSubtitle}>
              Manage KatokKalinis employees
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={openAddForm}
          >
            <Text style={styles.addButtonText}>+ Add Employee</Text>
          </TouchableOpacity>
        </View>

        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingEmployee
                ? "Edit Employee"
                : "Add New Employee"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Employee name"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.input}
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder={
                editingEmployee
                  ? "New password (optional)"
                  : "Password"
              }
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeForm}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveText}>
                  {editingEmployee ? "Update" : "Create"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.idColumn]}>
              ID
            </Text>

            <Text style={[styles.headerText, styles.nameColumn]}>
              NAME
            </Text>

            <Text style={[styles.headerText, styles.emailColumn]}>
              EMAIL
            </Text>

            <Text style={[styles.headerText, styles.roleColumn]}>
              ROLE
            </Text>

            <Text style={[styles.headerText, styles.actionColumn]}>
              ACTIONS
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <Text style={styles.loadingText}>
                Loading employees...
              </Text>
            </View>
          ) : employees.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                No employees found
              </Text>

              <Text style={styles.emptyText}>
                Click &quot;Add Employee&quot; to create your first employee.
              </Text>
            </View>
          ) : (
            <ScrollView>
              {employees.map((employee) => (
                <View
                  key={employee.id}
                  style={styles.tableRow}
                >
                  <Text style={[styles.cellText, styles.idColumn]}>
                    {employee.id}
                  </Text>

                  <Text style={[styles.cellText, styles.nameColumn]}>
                    {employee.name}
                  </Text>

                  <Text style={[styles.cellText, styles.emailColumn]}>
                    {employee.email}
                  </Text>

                  <Text style={[styles.cellText, styles.roleColumn]}>
                    {employee.roles?.[0]?.name || "employee"}
                  </Text>

                  <View style={styles.actionColumn}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => openEditForm(employee)}
                    >
                      <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(employee)}
                    >
                      <Text style={styles.deleteText}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F4F7F2",
  },

  sidebar: {
    width: 240,
    backgroundColor: "#FFFFFF",
    paddingVertical: 28,
    paddingHorizontal: 18,
    borderRightWidth: 1,
    borderRightColor: "#E2E8DF",
  },

  logoContainer: {
    marginBottom: 35,
    paddingHorizontal: 10,
  },

  logo: {
    fontSize: 22,
    fontWeight: "800",
    color: "#333333",
  },

  logoGreen: {
    fontSize: 22,
    fontWeight: "800",
    color: "#4CAF50",
  },

  menuTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#999999",
    marginBottom: 12,
    paddingHorizontal: 10,
  },

  menuItem: {
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 5,
  },

  menuText: {
    fontSize: 14,
    color: "#444444",
    fontWeight: "500",
  },

  sidebarBottom: {
    marginTop: "auto",
  },

  content: {
    flex: 1,
    padding: 30,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#222222",
  },

  pageSubtitle: {
    fontSize: 14,
    color: "#777777",
    marginTop: 5,
  },

  addButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    padding: 22,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8DF",
  },

  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
  },

  input: {
    height: 45,
    borderWidth: 1,
    borderColor: "#D9DFD6",
    borderRadius: 7,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },

  formButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 5,
  },

  cancelButton: {
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 7,
    backgroundColor: "#EEEEEE",
  },

  cancelText: {
    color: "#555555",
    fontWeight: "600",
  },

  saveButton: {
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 7,
    backgroundColor: "#4CAF50",
  },

  saveText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  tableCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8DF",
    overflow: "hidden",
  },

  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5EF",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E5DE",
  },

  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  headerText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#666666",
  },

  cellText: {
    fontSize: 13,
    color: "#333333",
  },

  idColumn: {
    width: 50,
  },

  nameColumn: {
    flex: 1.2,
  },

  emailColumn: {
    flex: 1.5,
  },

  roleColumn: {
    flex: 0.8,
  },

  actionColumn: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  editButton: {
    backgroundColor: "#EAF5E9",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  editText: {
    color: "#388E3C",
    fontWeight: "700",
    fontSize: 12,
  },

  deleteButton: {
    backgroundColor: "#FDECEC",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  deleteText: {
    color: "#D32F2F",
    fontWeight: "700",
    fontSize: 12,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 50,
  },

  loadingText: {
    marginTop: 10,
    color: "#777777",
  },

  emptyContainer: {
    padding: 60,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#444444",
  },

  emptyText: {
    marginTop: 8,
    color: "#888888",
  },
});