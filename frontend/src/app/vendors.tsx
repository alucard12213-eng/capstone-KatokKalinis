import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { API_URL } from "../services/api";
import { getToken } from "../services/auth";

type VendorStatus =
  | "active"
  | "inactive"
  | "suspended";

type Vendor = {
  id: number;
  user_id?: number | null;
  barangay_id?: number | null;
  vendor_code: string;
  business_name: string;
  owner_name: string;
  market?: string | null;
  stall_number?: string | null;
  contact_number?: string | null;
  address?: string | null;
  qr_code?: string | null;
  status: VendorStatus;

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

type StatusFilter =
  | "all"
  | VendorStatus;

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [selectedVendor, setSelectedVendor] =
    useState<Vendor | null>(null);

  const [detailsVisible, setDetailsVisible] =
    useState(false);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | LOAD VENDORS
  |--------------------------------------------------------------------------
  */

  const loadVendors = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append(
          "search",
          search.trim()
        );
      }

      if (statusFilter !== "all") {
        params.append(
          "status",
          statusFilter
        );
      }

      const query = params.toString();

      const response = await fetch(
        `${API_URL}/vendors${
          query ? `?${query}` : ""
        }`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text =
        await response.text();

      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Laravel returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to load vendors. HTTP ${response.status}`
        );
      }

      setVendors(
        Array.isArray(data?.vendors)
          ? data.vendors
          : []
      );
    } catch (error: any) {
      console.error(
        "LOAD VENDORS ERROR:",
        error
      );

      showAlert(
        "Error",
        error?.message ||
          "Unable to load vendors."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  /*
  |--------------------------------------------------------------------------
  | SEARCH DELAY
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer = setTimeout(() => {
      loadVendors();
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  /*
  |--------------------------------------------------------------------------
  | STATUS COUNTS
  |--------------------------------------------------------------------------
  */

  const counts = useMemo(() => {
    return {
      total: vendors.length,

      active: vendors.filter(
        (vendor) =>
          vendor.status === "active"
      ).length,

      inactive: vendors.filter(
        (vendor) =>
          vendor.status === "inactive"
      ).length,

      suspended: vendors.filter(
        (vendor) =>
          vendor.status === "suspended"
      ).length,
    };
  }, [vendors]);

  /*
  |--------------------------------------------------------------------------
  | CHANGE STATUS
  |--------------------------------------------------------------------------
  */

  const requestStatusChange = (
    vendor: Vendor,
    newStatus: VendorStatus
  ) => {
    if (vendor.status === newStatus) {
      return;
    }

    const statusText =
      newStatus === "active"
        ? "Active"
        : newStatus === "inactive"
        ? "Inactive"
        : "Suspended";

    showConfirm(
      "Change Vendor Status",
      `Are you sure you want to change ${vendor.business_name} to ${statusText}?`,
      () => updateStatus(
        vendor,
        newStatus
      )
    );
  };

  const updateStatus = async (
    vendor: Vendor,
    newStatus: VendorStatus
  ) => {
    try {
      setUpdatingStatus(true);

      const token = await getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      const response = await fetch(
        `${API_URL}/vendors/${vendor.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const text =
        await response.text();

      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Laravel returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to update status. HTTP ${response.status}`
        );
      }

      setVendors((current) =>
        current.map((item) =>
          item.id === vendor.id
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      );

      setSelectedVendor((current) =>
        current &&
        current.id === vendor.id
          ? {
              ...current,
              status: newStatus,
            }
          : current
      );

      showAlert(
        "Success",
        "Vendor status updated successfully."
      );
    } catch (error: any) {
      console.error(
        "UPDATE VENDOR STATUS ERROR:",
        error
      );

      showAlert(
        "Error",
        error?.message ||
          "Unable to update vendor status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE VENDOR
  |--------------------------------------------------------------------------
  */

  const requestDelete = (
    vendor: Vendor
  ) => {
    showConfirm(
      "Delete Vendor",
      `Are you sure you want to permanently delete ${vendor.business_name}? This action cannot be undone.`,
      () => deleteVendor(vendor)
    );
  };

  const deleteVendor = async (
    vendor: Vendor
  ) => {
    try {
      setDeleting(true);

      const token = await getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      const response = await fetch(
        `${API_URL}/vendors/${vendor.id}`,
        {
          method: "DELETE",
          headers: {
            Accept:
              "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text =
        await response.text();

      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Laravel returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to delete vendor. HTTP ${response.status}`
        );
      }

      setVendors((current) =>
        current.filter(
          (item) =>
            item.id !== vendor.id
        )
      );

      setDetailsVisible(false);
      setSelectedVendor(null);

      showAlert(
        "Deleted",
        "Vendor has been deleted successfully."
      );
    } catch (error: any) {
      console.error(
        "DELETE VENDOR ERROR:",
        error
      );

      showAlert(
        "Error",
        error?.message ||
          "Unable to delete vendor."
      );
    } finally {
      setDeleting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | HELPERS
  |--------------------------------------------------------------------------
  */

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

  const statusLabel = (
    status: VendorStatus
  ) => {
    switch (status) {
      case "active":
        return "ACTIVE";

      case "inactive":
        return "INACTIVE";

      case "suspended":
        return "SUSPENDED";
    }
  };

  const openDetails = (
    vendor: Vendor
  ) => {
    setSelectedVendor(vendor);
    setDetailsVisible(true);
  };

  /*
  |--------------------------------------------------------------------------
  | VENDOR CARD
  |--------------------------------------------------------------------------
  */

  const renderVendor = ({
    item,
  }: {
    item: Vendor;
  }) => {
    return (
      <Pressable
        style={styles.vendorCard}
        onPress={() =>
          openDetails(item)
        }
      >
        <View style={styles.vendorTop}>
          <View style={styles.vendorIdentity}>
            <View style={styles.avatar}>
              <Text
                style={styles.avatarText}
              >
                {item.business_name
                  ?.charAt(0)
                  ?.toUpperCase() ||
                  "V"}
              </Text>
            </View>

            <View
              style={
                styles.vendorMain
              }
            >
              <Text
                style={styles.businessName}
                numberOfLines={1}
              >
                {item.business_name}
              </Text>

              <Text
                style={styles.vendorCode}
              >
                {item.vendor_code}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              item.status === "active" &&
                styles.activeBadge,
              item.status === "inactive" &&
                styles.inactiveBadge,
              item.status === "suspended" &&
                styles.suspendedBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.status === "active" &&
                  styles.activeText,
                item.status === "inactive" &&
                  styles.inactiveText,
                item.status === "suspended" &&
                  styles.suspendedText,
              ]}
            >
              {statusLabel(
                item.status
              )}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            Owner
          </Text>

          <Text
            style={styles.infoValue}
            numberOfLines={1}
          >
            {item.owner_name || "—"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            Market
          </Text>

          <Text
            style={styles.infoValue}
            numberOfLines={1}
          >
            {item.market || "—"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            Stall
          </Text>

          <Text
            style={styles.infoValue}
          >
            {item.stall_number || "—"}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text
            style={styles.viewDetails}
          >
            View Details →
          </Text>
        </View>
      </Pressable>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>
            Vendors
          </Text>

          <Text
            style={styles.pageSubtitle}
          >
            Manage registered market vendors
          </Text>
        </View>

        <Pressable
          style={styles.refreshButton}
          onPress={loadVendors}
          disabled={loading}
        >
          <Text
            style={styles.refreshText}
          >
            ↻ Refresh
          </Text>
        </Pressable>
      </View>

      {/* STATISTICS */}

      <View style={styles.statsContainer}>

        <Pressable
          style={styles.statCard}
          onPress={() =>
            setStatusFilter("all")
          }
        >
          <Text
            style={styles.statLabel}
          >
            TOTAL
          </Text>

          <Text
            style={styles.statNumber}
          >
            {counts.total}
          </Text>
        </Pressable>

        <Pressable
          style={styles.statCard}
          onPress={() =>
            setStatusFilter("active")
          }
        >
          <Text
            style={styles.statLabel}
          >
            ACTIVE
          </Text>

          <Text
            style={[
              styles.statNumber,
              styles.activeNumber,
            ]}
          >
            {counts.active}
          </Text>
        </Pressable>

        <Pressable
          style={styles.statCard}
          onPress={() =>
            setStatusFilter("inactive")
          }
        >
          <Text
            style={styles.statLabel}
          >
            INACTIVE
          </Text>

          <Text
            style={[
              styles.statNumber,
              styles.inactiveNumber,
            ]}
          >
            {counts.inactive}
          </Text>
        </Pressable>

        <Pressable
          style={styles.statCard}
          onPress={() =>
            setStatusFilter("suspended")
          }
        >
          <Text
            style={styles.statLabel}
          >
            SUSPENDED
          </Text>

          <Text
            style={[
              styles.statNumber,
              styles.suspendedNumber,
            ]}
          >
            {counts.suspended}
          </Text>
        </Pressable>

      </View>

      {/* SEARCH + FILTER */}

      <View style={styles.toolbar}>

        <TextInput
          style={styles.searchInput}
          placeholder="Search vendor, owner, market, stall..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.filters}>

          {(
            [
              "all",
              "active",
              "inactive",
              "suspended",
            ] as StatusFilter[]
          ).map((status) => (
            <Pressable
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
                  styles.filterText,
                  statusFilter ===
                    status &&
                    styles.filterTextActive,
                ]}
              >
                {status === "all"
                  ? "All"
                  : statusLabel(
                      status
                    )}
              </Text>
            </Pressable>
          ))}

        </View>
      </View>

      {/* CONTENT */}

      {loading ? (
        <View
          style={styles.loadingContainer}
        >
          <ActivityIndicator
            size="large"
            color="#4CAF50"
          />

          <Text
            style={styles.loadingText}
          >
            Loading vendors...
          </Text>
        </View>
      ) : vendors.length === 0 ? (
        <View
          style={styles.emptyContainer}
        >
          <Text
            style={styles.emptyIcon}
          >
            🏪
          </Text>

          <Text
            style={styles.emptyTitle}
          >
            No Vendors Found
          </Text>

          <Text
            style={styles.emptyText}
          >
            There are no vendors matching your search or filter.
          </Text>
        </View>
      ) : (
        <FlatList
          data={vendors}
          keyExtractor={(item) =>
            String(item.id)
          }
          renderItem={
            renderVendor
          }
          contentContainerStyle={
            styles.list
          }
          showsVerticalScrollIndicator={
            false
        }
        />
      )}

      {/* DETAILS MODAL */}

      <Modal
        visible={detailsVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setDetailsVisible(false)
        }
      >
        <View
          style={styles.modalOverlay}
        >
          <View
            style={styles.modal}
          >
            {selectedVendor && (
              <>
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
                      Vendor Details
                    </Text>

                    <Text
                      style={
                        styles.modalSubtitle
                      }
                    >
                      {
                        selectedVendor.vendor_code
                      }
                    </Text>
                  </View>

                  <Pressable
                    onPress={() =>
                      setDetailsVisible(
                        false
                      )
                    }
                  >
                    <Text
                      style={
                        styles.closeButton
                      }
                    >
                      ×
                    </Text>
                  </Pressable>
                </View>

                <View
                  style={
                    styles.detailsSection
                  }
                >
                  <Detail
                    label="Business Name"
                    value={
                      selectedVendor.business_name
                    }
                  />

                  <Detail
                    label="Owner"
                    value={
                      selectedVendor.owner_name
                    }
                  />

                  <Detail
                    label="Market"
                    value={
                      selectedVendor.market ||
                      "—"
                    }
                  />

                  <Detail
                    label="Stall Number"
                    value={
                      selectedVendor.stall_number ||
                      "—"
                    }
                  />

                  <Detail
                    label="Contact Number"
                    value={
                      selectedVendor.contact_number ||
                      "—"
                    }
                  />

                  <Detail
                    label="Address"
                    value={
                      selectedVendor.address ||
                      "—"
                    }
                  />

                  <Detail
                    label="Barangay"
                    value={
                      selectedVendor.barangay
                        ?.name ||
                      "—"
                    }
                  />

                  <Detail
                    label="QR Code"
                    value={
                      selectedVendor.qr_code ||
                      "—"
                    }
                  />
                </View>

                {/* STATUS */}

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Change Status
                </Text>

                <View
                  style={
                    styles.statusButtons
                  }
                >
                  <Pressable
                    style={[
                      styles.statusButton,
                      styles.activeButton,
                      selectedVendor.status ===
                        "active" &&
                        styles.currentStatus,
                    ]}
                    onPress={() =>
                      requestStatusChange(
                        selectedVendor,
                        "active"
                      )
                    }
                    disabled={
                      updatingStatus ||
                      selectedVendor.status ===
                        "active"
                    }
                  >
                    <Text
                      style={
                        styles.statusButtonText
                      }
                    >
                      Active
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.statusButton,
                      styles.inactiveButton,
                      selectedVendor.status ===
                        "inactive" &&
                        styles.currentStatus,
                    ]}
                    onPress={() =>
                      requestStatusChange(
                        selectedVendor,
                        "inactive"
                      )
                    }
                    disabled={
                      updatingStatus ||
                      selectedVendor.status ===
                        "inactive"
                    }
                  >
                    <Text
                      style={
                        styles.statusButtonText
                      }
                    >
                      Inactive
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.statusButton,
                      styles.suspendedButton,
                      selectedVendor.status ===
                        "suspended" &&
                        styles.currentStatus,
                    ]}
                    onPress={() =>
                      requestStatusChange(
                        selectedVendor,
                        "suspended"
                      )
                    }
                    disabled={
                      updatingStatus ||
                      selectedVendor.status ===
                        "suspended"
                    }
                  >
                    <Text
                      style={
                        styles.statusButtonText
                      }
                    >
                      Suspended
                    </Text>
                  </Pressable>
                </View>

                {updatingStatus && (
                  <View
                    style={
                      styles.updatingContainer
                    }
                  >
                    <ActivityIndicator
                      size="small"
                      color="#4CAF50"
                    />

                    <Text
                      style={
                        styles.updatingText
                      }
                    >
                      Updating status...
                    </Text>
                  </View>
                )}

                {/* DELETE */}

                <Pressable
                  style={
                    styles.deleteButton
                  }
                  onPress={() =>
                    requestDelete(
                      selectedVendor
                    )
                  }
                  disabled={
                    deleting ||
                    updatingStatus
                  }
                >
                  {deleting ? (
                    <ActivityIndicator
                      color="#FFFFFF"
                    />
                  ) : (
                    <Text
                      style={
                        styles.deleteButtonText
                      }
                    >
                      Delete Vendor
                    </Text>
                  )}
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| DETAIL COMPONENT
|--------------------------------------------------------------------------
*/

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text
        style={styles.detailLabel}
      >
        {label}
      </Text>

      <Text
        style={styles.detailValue}
      >
        {value}
      </Text>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7F4",
    padding: 28,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  pageTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#222",
  },

  pageSubtitle: {
    marginTop: 5,
    fontSize: 14,
    color: "#777",
  },

  refreshButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE5DA",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9,
  },

  refreshText: {
    color: "#4CAF50",
    fontWeight: "800",
  },

  statsContainer: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 22,
    flexWrap: "wrap",
  },

  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    padding: 18,
    minWidth: 150,
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E9E3",
  },

  statLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#888",
    letterSpacing: 0.6,
  },

  statNumber: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: "900",
    color: "#333",
  },

  activeNumber: {
    color: "#4CAF50",
  },

  inactiveNumber: {
    color: "#888",
  },

  suspendedNumber: {
    color: "#D9534F",
  },

  toolbar: {
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5E9E3",
  },

  searchInput: {
    height: 46,
    borderWidth: 1,
    borderColor: "#DDE3DA",
    borderRadius: 9,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#FAFBF9",
    marginBottom: 12,
  },

  filters: {
    flexDirection: "row",
    gap: 8,
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

  filterText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  list: {
    paddingBottom: 30,
    gap: 14,
  },

  vendorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E9E3",
  },

  vendorTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  vendorIdentity: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    marginRight: 12,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E5F3E1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#4CAF50",
    fontSize: 19,
    fontWeight: "900",
  },

  vendorMain: {
    flex: 1,
  },

  businessName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#252525",
  },

  vendorCode: {
    marginTop: 4,
    fontSize: 12,
    color: "#888",
    fontWeight: "700",
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 15,
  },

  activeBadge: {
    backgroundColor: "#E5F6E3",
  },

  inactiveBadge: {
    backgroundColor: "#EEEEEE",
  },

  suspendedBadge: {
    backgroundColor: "#FDE8E7",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "900",
  },

  activeText: {
    color: "#368A38",
  },

  inactiveText: {
    color: "#777",
  },

  suspendedText: {
    color: "#C43E38",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEF1EC",
    marginVertical: 14,
  },

  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },

  infoLabel: {
    width: 100,
    fontSize: 12,
    color: "#999",
    fontWeight: "700",
  },

  infoValue: {
    flex: 1,
    fontSize: 13,
    color: "#444",
    fontWeight: "600",
  },

  cardFooter: {
    marginTop: 10,
    alignItems: "flex-end",
  },

  viewDetails: {
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "800",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#777",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 45,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "800",
    color: "#333",
  },

  emptyText: {
    marginTop: 6,
    color: "#888",
    textAlign: "center",
    maxWidth: 400,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modal: {
    width: "100%",
    maxWidth: 650,
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#222",
  },

  modalSubtitle: {
    marginTop: 4,
    color: "#888",
    fontSize: 12,
    fontWeight: "700",
  },

  closeButton: {
    fontSize: 32,
    lineHeight: 30,
    color: "#888",
    fontWeight: "300",
  },

  detailsSection: {
    backgroundColor: "#F8FAF7",
    borderRadius: 12,
    padding: 15,
  },

  detailRow: {
    flexDirection: "row",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECE6",
  },

  detailLabel: {
    width: 130,
    color: "#888",
    fontSize: 12,
    fontWeight: "700",
  },

  detailValue: {
    flex: 1,
    color: "#333",
    fontSize: 13,
    fontWeight: "600",
  },

  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "900",
    color: "#333",
  },

  statusButtons: {
    flexDirection: "row",
    gap: 8,
  },

  statusButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },

  activeButton: {
    backgroundColor: "#4CAF50",
  },

  inactiveButton: {
    backgroundColor: "#888",
  },

  suspendedButton: {
    backgroundColor: "#D9534F",
  },

  currentStatus: {
    opacity: 0.45,
  },

  statusButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  updatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    gap: 8,
  },

  updatingText: {
    color: "#777",
    fontSize: 12,
  },

  deleteButton: {
    height: 46,
    backgroundColor: "#D9534F",
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },

  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
});