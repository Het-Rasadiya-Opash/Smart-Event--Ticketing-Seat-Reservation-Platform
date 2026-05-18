import { useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import apiRequest from "../utils/apiRequest";
import {
  clearError,
  setCurrentUser,
  setError,
  setLoading,
} from "../features/usersSlice";

import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  CircularProgress,
  Paper,
  Stack,
  Alert,
  Divider,
  Chip,
} from "@mui/material";

import {
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
  ConfirmationNumberOutlined,
  ArrowForward,
} from "@mui/icons-material";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.users);

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(clearError());

    try {
      const res = await apiRequest.post("/users/login", formData);
      dispatch(setCurrentUser(res.data.data.user));
      navigate("/");
    } catch (err) {
      const errorData =
        err.response?.data?.message ||
        "Authentication failed. Please check your credentials.";
      dispatch(setError(errorData));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f6f8fb",
        display: "flex",
        alignItems: "center",
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.95fr 1fr" },
            minHeight: { md: 620 },
          }}
        >
          <Box
            sx={{
              p: { xs: 3, sm: 5, md: 6 },
              bgcolor: "#0f172a",
              color: "common.white",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 5,
            }}
          >
            <Stack spacing={3}>
              <Box
                sx={{
                  width: 58,
                  height: 58,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              >
                <ConfirmationNumberOutlined sx={{ fontSize: 32 }} />
              </Box>

              <Box>
                <Typography
                  component="h1"
                  sx={{
                    fontSize: { xs: 32, sm: 42 },
                    fontWeight: 800,
                    lineHeight: 1.08,
                    maxWidth: 460,
                  }}
                >
                  Smart Event Ticketing
                </Typography>
                <Typography
                  sx={{
                    mt: 2,
                    color: "rgba(255,255,255,0.72)",
                    fontSize: 17,
                    lineHeight: 1.7,
                    maxWidth: 500,
                  }}
                >
                  Manage bookings, reserved seats, and event access from one
                  focused dashboard.
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
              {["Seat maps", "Fast entry", "Live bookings"].map((item) => (
                <Chip
                  key={item}
                  label={item}
                  sx={{
                    color: "common.white",
                    bgcolor: "rgba(255,255,255,0.09)",
                    border: "1px solid rgba(255,255,255,0.14)",
                  }}
                />
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              p: { xs: 3, sm: 5, md: 7 },
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ width: "100%" }}
            >
              <Typography
                component="h2"
                sx={{ fontSize: { xs: 26, sm: 32 }, fontWeight: 800 }}
              >
                Welcome back
              </Typography>
              <Typography sx={{ mt: 1, color: "text.secondary" }}>
                Sign in to continue to your event workspace.
              </Typography>

              <Divider sx={{ my: 4 }} />

              <Stack spacing={2.5}>
                {error && (
                  <Alert severity="error" variant="outlined">
                    {error}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  required
                  label="Email address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  required
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  endIcon={
                    loading ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <ArrowForward />
                    )
                  }
                  sx={{
                    mt: 1,
                    py: 1.35,
                    textTransform: "none",
                    fontSize: 16,
                    fontWeight: 700,
                    bgcolor: "#2563eb",
                    "&:hover": { bgcolor: "#1d4ed8" },
                  }}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </Stack>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
