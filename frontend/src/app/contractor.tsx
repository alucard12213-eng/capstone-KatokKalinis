import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Contractor,
  ContractorInput,
  createContractor,
  deleteContractor,
  getContractors,
  updateContractor,
} from "../services/api";

export default function ContractorsScreen() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [editingContractor, setEditingContractor] =
    useState<Contractor | null>(null);

  const [contractorCode, setContractorCode] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<
    "active" | "inactive" | "suspended"
  >("active");
  const [description, setDescription] = useState("");

  // =====================================================
  // LOAD CONTRACTORS
  // =====================================================

  const loadContractors = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getContractors();

      setContractors(data);
    } catch (err: any) {
      console.error("GET CONTRACTORS ERROR:", err);

      setError(
        err?.message ||
          "Unable to load contractors."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContractors();
  }, []);

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setContractorCode("");
    setCompanyName("");
    setContactPerson("");
    setContactNumber("");
    setEmail("");
    setAddress("");
    setStatus("active");
    setDescription("");
    setEditingContractor(null);
  };

  // =====================================================
  // OPEN ADD
  // =====================================================

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  // =====================================================
  // OPEN EDIT
  // =====================================================

  const openEditModal = (contractor: Contractor) => {
    setEditingContractor(contractor);

    setContractorCode(
      contractor.contractor_code || ""
    );

    setCompanyName(
      contractor.company_name || ""
    );

    setContactPerson(
      contractor.contact_person || ""
    );

    setContactNumber(
      contractor.contact_number || ""
    );

    setEmail(
      contractor.email || ""
    );

    setAddress(
      contractor.address || ""
    );

    if (
      contractor.status === "inactive" ||
      contractor.status === "suspended"
    ) {
      setStatus(contractor.status);
    } else {
      setStatus("active");
    }

    setDescription(
      contractor.description || ""
    );

    setModalVisible(true);
  };

  // =====================================================
  // SAVE CONTRACTOR
  // =====================================================

  const handleSave = async () => {
    if (!contractorCode.trim()) {
      Alert.alert(
        "Validation",
        "Please enter a contractor code."
      );
      return;
    }

    if (!companyName.trim()) {
      Alert.alert(
        "Validation",
        "Please enter the company name."
      );
      return;
    }

    const data: ContractorInput = {
      contractor_code:
        contractorCode.trim(),

      company_name:
        companyName.trim(),

      contact_person:
        contactPerson.trim(),

      contact_number:
        contactNumber.trim(),

      email:
        email.trim(),

      address:
        address.trim(),

      status,

      description:
        description.trim(),
    };

    try {
      setSaving(true);

      if (editingContractor) {
        await updateContractor(
          editingContractor.id,
          data
        );

        Alert.alert(
          "Success",
          "Contractor updated successfully."
        );
      } else {
        await createContractor(data);

        Alert.alert(
          "Success",
          "Contractor created successfully."
        );
      }

      setModalVisible(false);
      resetForm();

      await loadContractors();
    } catch (err: any) {
      console.error(
        "SAVE CONTRACTOR ERROR:",
        err
      );

      Alert.alert(
        "Error",
        err?.message ||
          "Unable to save contractor."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE CONTRACTOR
  // =====================================================

  const handleDelete = (
    contractor: Contractor
  ) => {
    Alert.alert(
      "Delete Contractor",
      `Are you sure you want to delete ${contractor.company_name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteContractor(
                contractor.id
              );

              Alert.alert(
                "Success",
                "Contractor deleted successfully."
              );

              await loadContractors();
            } catch (err: any) {
              console.error(
                "DELETE CONTRACTOR ERROR:",
                err
              );

              Alert.alert(
                "Error",
                err?.message ||
                  "Unable to delete contractor."
              );
            }
          },
        },
      ]
    );
  };

  // =====================================================
  // STATISTICS
  // =====================================================

  const activeCount =
    contractors.filter(
      (contractor) =>
        contractor.status === "active"
    ).length;

  const inactiveCount =
    contractors.filter(
      (contractor) =>
        contractor.status === "inactive"
    ).length;

  const suspendedCount =
    contractors.filter(
      (contractor) =>
        contractor.status === "suspended"
    ).length;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>
              Contractor Oversight
            </Text>

            <Text style={styles.pageSubtitle}>
              Manage contractors and their
              information
            </Text>
          </View>

          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadContractors}
            >
              <Text style={styles.refreshText}>
                Refresh
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addButton}
              onPress={openAddModal}
            >
              <Text style={styles.addButtonText}>
                + Add Contractor
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* =================================================
            ERROR
        ================================================= */}

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {error}
            </Text>

            <TouchableOpacity
              onPress={loadContractors}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              TOTAL CONTRACTORS
            </Text>

            <Text style={styles.statValue}>
              {contractors.length}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              ACTIVE
            </Text>

            <Text
              style={[
                styles.statValue,
                styles.activeValue,
              ]}
            >
              {activeCount}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              INACTIVE
            </Text>

            <Text style={styles.statValue}>
              {inactiveCount}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              SUSPENDED
            </Text>

            <Text
              style={[
                styles.statValue,
                styles.suspendedValue,
              ]}
            >
              {suspendedCount}
            </Text>
          </View>
        </View>

        {/* =================================================
            CONTRACTORS
        ================================================= */}

        <View style={styles.contractorsHeader}>
          <Text style={styles.contractorsTitle}>
            Contractors
          </Text>

          <Text style={styles.contractorsCount}>
            {contractors.length} record
            {contractors.length !== 1
              ? "s"
              : ""}
          </Text>
        </View>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color="#4CAF50"
            />

            <Text style={styles.loadingText}>
              Loading contractors...
            </Text>
          </View>
        ) : contractors.length === 0 ? (
          /* =================================================
             EMPTY
          ================================================= */

          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              No Contractors
            </Text>

            <Text style={styles.emptyText}>
              There are currently no contractors
              in the system.
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              onPress={openAddModal}
            >
              <Text
                style={styles.emptyButtonText}
              >
                + Add Contractor
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* =================================================
             LIST
          ================================================= */

          <View style={styles.contractorList}>
            {contractors.map(
              (contractor) => (
                <View
                  key={contractor.id}
                  style={
                    styles.contractorCard
                  }
                >
                  {/* TOP */}

                  <View
                    style={
                      styles.cardTopRow
                    }
                  >
                    <View
                      style={
                        styles.companySection
                      }
                    >
                      <Text
                        style={
                          styles.contractorName
                        }
                      >
                        {
                          contractor.company_name
                        }
                      </Text>

                      <Text
                        style={
                          styles.contractorCode
                        }
                      >
                        {
                          contractor.contractor_code
                        }
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        contractor.status ===
                          "active" &&
                          styles.statusActive,
                        contractor.status ===
                          "inactive" &&
                          styles.statusInactive,
                        contractor.status ===
                          "suspended" &&
                          styles.statusSuspended,
                      ]}
                    >
                      <Text
                        style={
                          styles.statusText
                        }
                      >
                        {(
                          contractor.status ||
                          "active"
                        ).toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* INFORMATION */}

                  <View
                    style={styles.infoRow}
                  >
                    <View
                      style={
                        styles.infoColumn
                      }
                    >
                      <Text
                        style={
                          styles.infoLabel
                        }
                      >
                        CONTACT PERSON
                      </Text>

                      <Text
                        style={
                          styles.infoValue
                        }
                      >
                        {
                          contractor.contact_person ||
                          "—"
                        }
                      </Text>
                    </View>

                    <View
                      style={
                        styles.infoColumn
                      }
                    >
                      <Text
                        style={
                          styles.infoLabel
                        }
                      >
                        CONTACT NUMBER
                      </Text>

                      <Text
                        style={
                          styles.infoValue
                        }
                      >
                        {
                          contractor.contact_number ||
                          "—"
                        }
                      </Text>
                    </View>

                    <View
                      style={
                        styles.infoColumn
                      }
                    >
                      <Text
                        style={
                          styles.infoLabel
                        }
                      >
                        EMAIL
                      </Text>

                      <Text
                        style={
                          styles.infoValue
                        }
                      >
                        {
                          contractor.email ||
                          "—"
                        }
                      </Text>
                    </View>
                  </View>

                  <View
                    style={styles.infoRow}
                  >
                    <View
                      style={
                        styles.infoColumn
                      }
                    >
                      <Text
                        style={
                          styles.infoLabel
                        }
                      >
                        ADDRESS
                      </Text>

                      <Text
                        style={
                          styles.infoValue
                        }
                      >
                        {
                          contractor.address ||
                          "—"
                        }
                      </Text>
                    </View>
                  </View>

                  {/* DESCRIPTION */}

                  {contractor.description ? (
                    <View
                      style={
                        styles.descriptionBox
                      }
                    >
                      <Text
                        style={
                          styles.infoLabel
                        }
                      >
                        DESCRIPTION
                      </Text>

                      <Text
                        style={
                          styles.descriptionText
                        }
                      >
                        {
                          contractor.description
                        }
                      </Text>
                    </View>
                  ) : null}

                  {/* BUTTONS */}

                  <View
                    style={styles.buttonRow}
                  >
                    <TouchableOpacity
                      style={
                        styles.editButton
                      }
                      onPress={() =>
                        openEditModal(
                          contractor
                        )
                      }
                    >
                      <Text
                        style={
                          styles.editButtonText
                        }
                      >
                        Edit
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={
                        styles.deleteButton
                      }
                      onPress={() =>
                        handleDelete(
                          contractor
                        )
                      }
                    >
                      <Text
                        style={
                          styles.deleteButtonText
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
        )}
      </ScrollView>

      {/* ===================================================
          ADD / EDIT MODAL
      =================================================== */}

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() =>
          setModalVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
            >
              {/* MODAL HEADER */}

              <View
                style={
                  styles.modalHeader
                }
              >
                <View>
                  <Text
                    style={
                      styles.modalTitle
                    }
                  >
                    {editingContractor
                      ? "Edit Contractor"
                      : "Add Contractor"}
                  </Text>

                  <Text
                    style={
                      styles.modalSubtitle
                    }
                  >
                    {editingContractor
                      ? "Update contractor information"
                      : "Enter contractor information"}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                >
                  <Text
                    style={
                      styles.closeButton
                    }
                  >
                    ×
                  </Text>
                </TouchableOpacity>
              </View>

              {/* CODE */}

              <Text
                style={styles.inputLabel}
              >
                Contractor Code
              </Text>

              <TextInput
                style={styles.input}
                placeholder="CON-001"
                placeholderTextColor="#999"
                value={contractorCode}
                onChangeText={
                  setContractorCode
                }
                autoCapitalize="characters"
              />

              {/* COMPANY */}

              <Text
                style={styles.inputLabel}
              >
                Company Name
              </Text>

              <TextInput
                style={styles.input}
                placeholder="ABC Waste Management"
                placeholderTextColor="#999"
                value={companyName}
                onChangeText={
                  setCompanyName
                }
              />

              {/* CONTACT PERSON */}

              <Text
                style={styles.inputLabel}
              >
                Contact Person
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Juan Dela Cruz"
                placeholderTextColor="#999"
                value={contactPerson}
                onChangeText={
                  setContactPerson
                }
              />

              {/* CONTACT NUMBER */}

              <Text
                style={styles.inputLabel}
              >
                Contact Number
              </Text>

              <TextInput
                style={styles.input}
                placeholder="09171234567"
                placeholderTextColor="#999"
                value={contactNumber}
                onChangeText={
                  setContactNumber
                }
                keyboardType="phone-pad"
              />

              {/* EMAIL */}

              <Text
                style={styles.inputLabel}
              >
                Email
              </Text>

              <TextInput
                style={styles.input}
                placeholder="company@example.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* ADDRESS */}

              <Text
                style={styles.inputLabel}
              >
                Address
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Cagayan de Oro City"
                placeholderTextColor="#999"
                value={address}
                onChangeText={setAddress}
              />

              {/* STATUS */}

              <Text
                style={styles.inputLabel}
              >
                Status
              </Text>

              <View
                style={styles.statusSelector}
              >
                {(
                  [
                    "active",
                    "inactive",
                    "suspended",
                  ] as const
                ).map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.statusOption,
                      status === item &&
                        styles.statusOptionSelected,
                    ]}
                    onPress={() =>
                      setStatus(item)
                    }
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        status === item &&
                          styles.statusOptionTextSelected,
                      ]}
                    >
                      {item
                        .charAt(0)
                        .toUpperCase() +
                        item.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* DESCRIPTION */}

              <Text
                style={styles.inputLabel}
              >
                Description
              </Text>

              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                ]}
                placeholder="Waste collection contractor"
                placeholderTextColor="#999"
                value={description}
                onChangeText={
                  setDescription
                }
                multiline
                textAlignVertical="top"
              />

              {/* ACTIONS */}

              <View
                style={
                  styles.modalActions
                }
              >
                <TouchableOpacity
                  style={
                    styles.cancelButton
                  }
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
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
                  style={
                    styles.saveButton
                  }
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator
                      color="#FFFFFF"
                      size="small"
                    />
                  ) : (
                    <Text
                      style={
                        styles.saveButtonText
                      }
                    >
                      {editingContractor
                        ? "Update Contractor"
                        : "Create Contractor"}
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

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7F4",
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 40,
    paddingTop: 35,
    paddingBottom: 60,
  },

  // HEADER

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
  },

  pageTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1F2937",
  },

  pageSubtitle: {
    marginTop: 6,
    fontSize: 15,
    color: "#6B7280",
  },

  headerButtons: {
    flexDirection: "row",
    gap: 10,
  },

  refreshButton: {
    height: 42,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  refreshText: {
    color: "#4B5563",
    fontSize: 13,
    fontWeight: "600",
  },

  addButton: {
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  // ERROR

  errorBox: {
    backgroundColor: "#FEECEC",
    borderWidth: 1,
    borderColor: "#F5B5B5",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },

  errorText: {
    color: "#B42318",
    fontSize: 13,
  },

  retryButton: {
    marginTop: 10,
    alignSelf: "flex-start",
  },

  retryText: {
    color: "#4CAF50",
    fontWeight: "700",
  },

  // STATS

  statsRow: {
    flexDirection: "row",
    gap: 18,
    width: "100%",
    marginBottom: 35,
  },

  statCard: {
    flex: 1,
    minHeight: 115,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E5E1",
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 20,
    justifyContent: "center",
  },

  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 0.5,
  },

  statValue: {
    marginTop: 9,
    fontSize: 26,
    fontWeight: "700",
    color: "#3F7D32",
  },

  activeValue: {
    color: "#4CAF50",
  },

  suspendedValue: {
    color: "#D97706",
  },

  // CONTRACTOR HEADER

  contractorsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  contractorsTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#1F2937",
  },

  contractorsCount: {
    fontSize: 13,
    color: "#8A918A",
  },

  // LIST

  contractorList: {
    gap: 18,
  },

  contractorCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E5E1",
    borderRadius: 12,
    padding: 25,
  },

  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 25,
  },

  companySection: {
    flex: 1,
  },

  contractorName: {
    fontSize: 19,
    fontWeight: "700",
    color: "#1F2937",
  },

  contractorCode: {
    marginTop: 5,
    fontSize: 12,
    color: "#8A918A",
    fontWeight: "600",
  },

  // STATUS

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusActive: {
    backgroundColor: "#E8F5E9",
  },

  statusInactive: {
    backgroundColor: "#F3F4F6",
  },

  statusSuspended: {
    backgroundColor: "#FFF4E5",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#4B5563",
  },

  // INFO

  infoRow: {
    flexDirection: "row",
    marginBottom: 20,
  },

  infoColumn: {
    flex: 1,
    paddingRight: 20,
  },

  infoLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#8A918A",
    letterSpacing: 0.5,
    marginBottom: 7,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  descriptionBox: {
    backgroundColor: "#F8FAF7",
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
  },

  descriptionText: {
    color: "#4B5563",
    fontSize: 13,
    lineHeight: 19,
  },

  // BUTTONS

  buttonRow: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEF0ED",
    paddingTop: 18,
  },

  editButton: {
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 7,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },

  editButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  deleteButton: {
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#E5B5B5",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  deleteButtonText: {
    color: "#C62828",
    fontSize: 13,
    fontWeight: "700",
  },

  // LOADING

  loadingContainer: {
    minHeight: 250,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },

  // EMPTY

  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E5E1",
    borderRadius: 12,
    padding: 50,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },

  emptyText: {
    marginTop: 8,
    color: "#6B7280",
    textAlign: "center",
  },

  emptyButton: {
    marginTop: 20,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 8,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  // MODAL

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalContainer: {
    width: "100%",
    maxWidth: 650,
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 28,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 25,
  },

  modalTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#1F2937",
  },

  modalSubtitle: {
    marginTop: 5,
    color: "#6B7280",
    fontSize: 13,
  },

  closeButton: {
    fontSize: 30,
    lineHeight: 30,
    color: "#6B7280",
    fontWeight: "300",
  },

  // INPUTS

  inputLabel: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 7,
  },

  input: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: "#D9DED8",
    borderRadius: 8,
    backgroundColor: "#FAFBFA",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#1F2937",
    marginBottom: 17,
  },

  textArea: {
    height: 90,
    paddingTop: 12,
  },

  // STATUS SELECTOR

  statusSelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 17,
  },

  statusOption: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: "#D9DED8",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  statusOptionSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },

  statusOptionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },

  statusOptionTextSelected: {
    color: "#FFFFFF",
  },

  // MODAL ACTIONS

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 5,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#EEF0ED",
  },

  cancelButton: {
    height: 44,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  cancelButtonText: {
    color: "#4B5563",
    fontSize: 13,
    fontWeight: "700",
  },

  saveButton: {
    height: 44,
    paddingHorizontal: 22,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});