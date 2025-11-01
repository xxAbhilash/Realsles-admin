import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Typography,
  Box,
  Grid,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import { axioInstance } from "../api/axios/axios";
import { endpoints } from "../api/endpoints/endpoints";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";

// Date formatting function for mm/dd/yyyy hh:mm:ss
function formatDateTime(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  const pad = (n) => n.toString().padStart(2, "0");
  return (
    `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

const FreeTrialRequests = ({ currentSegment }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null, // 'approve', 'reject', or 'delete'
    requestId: null,
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch all free trial requests
  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axioInstance.get(endpoints.freeTrialRequests.getAll);
      const data = Array.isArray(response.data) ? response.data : [];
      // Filter out deleted requests
      const activeRequests = data.filter(request => !request.is_deleted);
      setRequests(activeRequests);
    } catch (err) {
      setError("Failed to fetch free trial requests.");
      console.error(err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentSegment === "freeTrialRequests") {
      fetchRequests();
    }
  }, [currentSegment]);

  const handleOpenConfirmDialog = (action, requestId) => {
    setConfirmDialog({
      open: true,
      action,
      requestId,
    });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      action: null,
      requestId: null,
    });
  };

  const handleApproveRequest = async () => {
    const { requestId } = confirmDialog;
    if (!requestId) return;

    setActionLoading(true);
    try {
      await axioInstance.post(
        `${endpoints.freeTrialRequests.approve}${requestId}/approve`
      );
      setSnackbar({
        open: true,
        message: "Free trial request approved successfully.",
        severity: "success",
      });
      handleCloseConfirmDialog();
      // Refresh the requests list
      fetchRequests();
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to approve request.",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    const { requestId } = confirmDialog;
    if (!requestId) return;

    setActionLoading(true);
    try {
      await axioInstance.post(
        `${endpoints.freeTrialRequests.reject}${requestId}/reject`
      );
      setSnackbar({
        open: true,
        message: "Free trial request rejected successfully.",
        severity: "success",
      });
      handleCloseConfirmDialog();
      // Refresh the requests list
      fetchRequests();
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to reject request.",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRequest = async () => {
    const { requestId } = confirmDialog;
    if (!requestId) return;

    setActionLoading(true);
    try {
      await axioInstance.delete(
        `${endpoints.freeTrialRequests.delete}${requestId}`
      );
      setSnackbar({
        open: true,
        message: "Free trial request deleted successfully.",
        severity: "success",
      });
      handleCloseConfirmDialog();
      // Refresh the requests list
      fetchRequests();
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to delete request.",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmAction = () => {
    if (confirmDialog.action === "approve") {
      handleApproveRequest();
    } else if (confirmDialog.action === "reject") {
      handleRejectRequest();
    } else if (confirmDialog.action === "delete") {
      handleDeleteRequest();
    }
  };

  const getStatusChip = (status) => {
    const statusLower = (status || "").toLowerCase();
    if (statusLower === "pending") {
      return <Chip label="Pending" color="warning" size="small" />;
    } else if (statusLower === "approved") {
      return <Chip label="Approved" color="success" size="small" />;
    } else if (statusLower === "rejected") {
      return <Chip label="Rejected" color="error" size="small" />;
    } else {
      return <Chip label={status || "Unknown"} color="default" size="small" />;
    }
  };

  if (currentSegment !== "freeTrialRequests") {
    return null;
  }

  return (
    <div className="w-full" style={{ paddingTop: 40 }}>
      <div className="w-full flex items-center justify-between mb-4">
        <h1 className="text-2xl">Free Trial Requests</h1>
        <Button
          onClick={fetchRequests}
          sx={{
            backgroundColor: "#fbd255",
            color: "black",
            fontWeight: 500,
            "&:hover": {
              backgroundColor: "#ffe066",
              color: "black",
            },
          }}
        >
          Refresh
        </Button>
      </div>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <div className="w-full overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-60">
            <CircularProgress />
          </div>
        ) : (
          <Table
            className="border-t border-solid border-[#515151] mt-1"
            sx={{ minWidth: 800, width: "100%" }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ px: 2, py: 1.5 }} className="!font-bold capitalize">
                  Request ID
                </TableCell>
                <TableCell sx={{ px: 2, py: 1.5 }} className="!font-bold capitalize">
                  User Name
                </TableCell>
                <TableCell sx={{ px: 2, py: 1.5 }} className="!font-bold capitalize">
                  Email
                </TableCell>
                <TableCell sx={{ px: 2, py: 1.5 }} className="!font-bold capitalize">
                  Company
                </TableCell>
                <TableCell sx={{ px: 2, py: 1.5 }} className="!font-bold capitalize">
                  Status
                </TableCell>
                <TableCell sx={{ px: 2, py: 1.5 }} className="!font-bold capitalize">
                  Requested At
                </TableCell>
                <TableCell sx={{ px: 2, py: 1.5 }} className="!font-bold capitalize">
                  Updated At
                </TableCell>
                <TableCell sx={{ px: 2, py: 1.5 }} className="!font-bold capitalize">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length > 0 ? (
                requests
                  .slice()
                  .sort((a, b) => {
                    // Sort by created_at, newest first
                    const dateA = new Date(a.created_at || 0);
                    const dateB = new Date(b.created_at || 0);
                    return dateB - dateA;
                  })
                  .map((request) => {
                    const requestId = request.trial_request_id;
                    const status = request.status || "pending";
                    const isPending = status.toLowerCase() === "pending";
                    const user = request.user || {};

                    return (
                      <TableRow
                        key={requestId}
                        sx={{ borderBottom: "1px solid #333" }}
                      >
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          {requestId || "-"}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          {`${user.first_name || ""} ${user.last_name || ""}`.trim() || "-"}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          {user.email || "-"}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          {user.company_name || "-"}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          {getStatusChip(status)}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          {formatDateTime(request.created_at)}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          {formatDateTime(request.updated_at)}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            {isPending && (
                              <>
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<CheckCircleIcon />}
                                  onClick={() =>
                                    handleOpenConfirmDialog("approve", requestId)
                                  }
                                  sx={{
                                    backgroundColor: "#4caf50",
                                    color: "white",
                                    fontWeight: 500,
                                    "&:hover": {
                                      backgroundColor: "#45a049",
                                      color: "white",
                                    },
                                  }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<CancelIcon />}
                                  onClick={() =>
                                    handleOpenConfirmDialog("reject", requestId)
                                  }
                                  sx={{
                                    backgroundColor: "#f44336",
                                    color: "white",
                                    fontWeight: 500,
                                    "&:hover": {
                                      backgroundColor: "#d32f2f",
                                      color: "white",
                                    },
                                  }}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            <div
                              className="rounded border border-solid border-red-400 hover:bg-red-400 text-red-400 hover:text-white cursor-pointer p-1"
                              onClick={() =>
                                handleOpenConfirmDialog("delete", requestId)
                              }
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <DeleteIcon className="!text-lg" />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <div className="flex items-center justify-center h-60 relative">
                      <p className="text-lg absolute bottom-[15%]">
                        No free trial requests found
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="confirm-dialog-title"
      >
        <DialogTitle id="confirm-dialog-title">
          {confirmDialog.action === "approve"
            ? "Approve Request"
            : confirmDialog.action === "reject"
            ? "Reject Request"
            : "Delete Request"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to{" "}
            {confirmDialog.action === "approve"
              ? "approve"
              : confirmDialog.action === "reject"
              ? "reject"
              : "delete"}{" "}
            this free trial request?
            {confirmDialog.action === "delete" && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                This action cannot be undone.
              </Typography>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseConfirmDialog}
            disabled={actionLoading}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            disabled={actionLoading}
            color={
              confirmDialog.action === "approve"
                ? "success"
                : "error"
            }
            variant="contained"
          >
            {actionLoading
              ? "Processing..."
              : confirmDialog.action === "approve"
              ? "Approve"
              : confirmDialog.action === "reject"
              ? "Reject"
              : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default FreeTrialRequests;

