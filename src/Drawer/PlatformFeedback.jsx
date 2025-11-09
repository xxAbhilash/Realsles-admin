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
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

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

const PlatformFeedback = ({ currentSegment }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    feedbackId: null,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [descriptionDialog, setDescriptionDialog] = useState({
    open: false,
    description: "",
    userName: "",
    rating: 0,
  });

  // Fetch all platform feedbacks
  const fetchFeedbacks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axioInstance.get(endpoints.platformFeedback.getAll);
      const data = Array.isArray(response.data) ? response.data : [];
      // Filter out deleted feedbacks
      const activeFeedbacks = data.filter(feedback => !feedback.is_deleted);
      setFeedbacks(activeFeedbacks);
    } catch (err) {
      setError("Failed to fetch platform feedback.");
      console.error(err);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentSegment === "platformFeedback") {
      fetchFeedbacks();
    }
  }, [currentSegment]);

  const handleOpenConfirmDialog = (feedbackId) => {
    setConfirmDialog({
      open: true,
      feedbackId,
    });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      feedbackId: null,
    });
  };

  const handleDeleteFeedback = async () => {
    const { feedbackId } = confirmDialog;
    if (!feedbackId) return;

    setActionLoading(true);
    try {
      await axioInstance.delete(
        `${endpoints.platformFeedback.delete}${feedbackId}`
      );
      setSnackbar({
        open: true,
        message: "Platform feedback deleted successfully.",
        severity: "success",
      });
      handleCloseConfirmDialog();
      // Refresh the feedbacks list
      fetchFeedbacks();
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to delete feedback.",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const numRating = Number(rating) || 0;
    for (let i = 1; i <= 5; i++) {
      if (i <= numRating) {
        stars.push(<StarIcon key={i} sx={{ color: "#ffd700", fontSize: 18 }} />);
      } else {
        stars.push(<StarBorderIcon key={i} sx={{ color: "#ffd700", fontSize: 18 }} />);
      }
    }
    return <div style={{ display: "flex", alignItems: "center" }}>{stars}</div>;
  };

  const handleOpenDescriptionDialog = (description, user, rating) => {
    const userName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unknown User";
    setDescriptionDialog({
      open: true,
      description: description || "",
      userName,
      rating: rating || 0,
    });
  };

  const handleCloseDescriptionDialog = () => {
    setDescriptionDialog({
      open: false,
      description: "",
      userName: "",
      rating: 0,
    });
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return "-";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (currentSegment !== "platformFeedback") {
    return null;
  }

  return (
    <div className="w-full" style={{ paddingTop: 40 }}>
      <div className="w-full flex items-center justify-between mb-4">
        <h1 className="text-2xl">Platform Feedback</h1>
        <Button
          onClick={fetchFeedbacks}
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
                  Feedback ID
                </TableCell>
                <TableCell sx={{ px: 2, py: 1.5 }} className="!font-bold capitalize">
                  User Name
                </TableCell>
                <TableCell sx={{ px: 2, py: 1.5 }} className="!font-bold capitalize">
                  Email
                </TableCell>
                <TableCell sx={{ px: 2, py: 1.5 }} className="!font-bold capitalize">
                  Rating
                </TableCell>
                <TableCell sx={{ px: 2, py: 1.5 }} className="!font-bold capitalize">
                  Comment
                </TableCell>
                <TableCell sx={{ px: 2, py: 1.5 }} className="!font-bold capitalize">
                  Created At
                </TableCell>
                <TableCell sx={{ px: 2, py: 1.5 }} className="!font-bold capitalize">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feedbacks.length > 0 ? (
                feedbacks
                  .slice()
                  .sort((a, b) => {
                    // Sort by created_at, newest first
                    const dateA = new Date(a.created_at || 0);
                    const dateB = new Date(b.created_at || 0);
                    return dateB - dateA;
                  })
                  .map((feedback) => {
                    const feedbackId = feedback.feedback_id || feedback.id;
                    const user = feedback.user || {};

                    return (
                      <TableRow
                        key={feedbackId}
                        sx={{ borderBottom: "1px solid #333" }}
                      >
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          {feedbackId || "-"}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          {`${user.first_name || ""} ${user.last_name || ""}`.trim() || "-"}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          {user.email || "-"}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          {renderStars(feedback.rating)}
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            px: 2, 
                            py: 1.5, 
                            maxWidth: 300,
                            cursor: feedback.description && feedback.description.length > 50 ? 'pointer' : 'default',
                            '&:hover': feedback.description && feedback.description.length > 50 ? {
                              backgroundColor: 'rgba(251, 210, 85, 0.1)',
                            } : {}
                          }}
                          onClick={() => {
                            if (feedback.description && feedback.description.length > 50) {
                              handleOpenDescriptionDialog(feedback.description, user, feedback.rating);
                            }
                          }}
                        >
                          <div style={{ 
                            wordWrap: "break-word", 
                            whiteSpace: "normal"
                          }}>
                            {truncateText(feedback.description)}
                          </div>
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          {formatDateTime(feedback.created_at)}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          <div
                            className="rounded border border-solid border-red-400 hover:bg-red-400 text-red-400 hover:text-white cursor-pointer p-1"
                            onClick={() =>
                              handleOpenConfirmDialog(feedbackId)
                            }
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <DeleteIcon className="!text-lg" />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <div className="flex items-center justify-center h-60 relative">
                      <p className="text-lg absolute bottom-[15%]">
                        No platform feedback found
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Description Dialog */}
      <Dialog
        open={descriptionDialog.open}
        onClose={handleCloseDescriptionDialog}
        aria-labelledby="description-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="description-dialog-title">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>Feedback Details</span>
            {renderStars(descriptionDialog.rating)}
          </div>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            From: <strong>{descriptionDialog.userName}</strong>
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {descriptionDialog.description}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDescriptionDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="confirm-dialog-title"
      >
        <DialogTitle id="confirm-dialog-title">
          Delete Feedback
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this platform feedback?
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              This action cannot be undone.
            </Typography>
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
            onClick={handleDeleteFeedback}
            disabled={actionLoading}
            color="error"
            variant="contained"
          >
            {actionLoading ? "Deleting..." : "Delete"}
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

export default PlatformFeedback;

