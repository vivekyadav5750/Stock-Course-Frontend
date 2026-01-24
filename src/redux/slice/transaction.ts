import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axios";
import { getErrorMessage } from "@/lib/utils";

export type Transaction = {
  _id?: string;
  id?: string;
  userId: string;
  courseId: string;
  amount: number;
  currency: string;
  paymentMethod?: string;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  transactionId?: string;
  orderId?: string;
  paymentGateway?: "razorpay" | "stripe" | "paypal";
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
};

type TransactionState = {
  transactions: Transaction[];
  currentTransaction: Transaction | null;
  status: "idle" | "loading" | "success" | "failed";
  message: string;
  totalPages: number;
  currentPage: number;
};

type CreateTransactionData = {
  courseId: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
};

const initialState: TransactionState = {
  transactions: [],
  currentTransaction: null,
  status: "idle",
  message: "",
  totalPages: 1,
  currentPage: 1,
};

// Helper to normalize transaction data
const normalizeTransaction = (transaction: any): Transaction => {
  if (!transaction) return transaction;
  return {
    ...transaction,
    id: transaction._id || transaction.id,
  };
};

// Get all transactions (user's own or admin all)
export const getAllTransactions = createAsyncThunk(
  "transaction/getAll",
  async (params: { page?: number; limit?: number; userId?: string }, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, userId } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(userId && { userId }),
      });

      const response = await axiosInstance.get(`/transactions?${queryParams}`);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to fetch transactions");
      }

      return {
        transactions: response.data.data.transactions.map(normalizeTransaction),
        totalPages: response.data.data.totalPages || 1,
        currentPage: response.data.data.currentPage || 1,
      };
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to fetch transactions");
      return rejectWithValue(message);
    }
  }
);

// Get user's transactions
export const getUserTransactions = createAsyncThunk(
  "transaction/getUserTransactions",
  async (params: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10 } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await axiosInstance.get(`/transactions/my?${queryParams}`);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to fetch transactions");
      }

      return {
        transactions: response.data.data.transactions.map(normalizeTransaction),
        totalPages: response.data.data.totalPages || 1,
        currentPage: response.data.data.currentPage || 1,
      };
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to fetch transactions");
      return rejectWithValue(message);
    }
  }
);

// Get single transaction by ID
export const getTransactionById = createAsyncThunk(
  "transaction/getById",
  async (transactionId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/transactions/${transactionId}`);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to fetch transaction");
      }

      return normalizeTransaction(response.data.data);
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to fetch transaction");
      return rejectWithValue(message);
    }
  }
);

// Create payment order
export const createPaymentOrder = createAsyncThunk(
  "transaction/createOrder",
  async (data: CreateTransactionData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/transactions/create-order", data);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to create payment order");
      }

      return normalizeTransaction(response.data.data);
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to create payment order");
      return rejectWithValue(message);
    }
  }
);

// Verify payment
export const verifyPayment = createAsyncThunk(
  "transaction/verify",
  async (data: {
    orderId: string;
    paymentId: string;
    signature?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/transactions/verify-payment", data);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Payment verification failed");
      }

      return normalizeTransaction(response.data.data);
    } catch (error: any) {
      const message = getErrorMessage(error, "Payment verification failed");
      return rejectWithValue(message);
    }
  }
);

// Refund transaction (admin)
export const refundTransaction = createAsyncThunk(
  "transaction/refund",
  async (transactionId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/transactions/${transactionId}/refund`);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to refund transaction");
      }

      return normalizeTransaction(response.data.data);
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to refund transaction");
      return rejectWithValue(message);
    }
  }
);

// Get transaction statistics (admin)
export const getTransactionStats = createAsyncThunk(
  "transaction/getStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/transactions/stats");

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to fetch statistics");
      }

      return response.data.data;
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to fetch statistics");
      return rejectWithValue(message);
    }
  }
);

const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    clearTransactionError(state) {
      state.message = "";
      state.status = "idle";
    },
    clearCurrentTransaction(state) {
      state.currentTransaction = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Transactions
      .addCase(getAllTransactions.pending, (state) => {
        state.status = "loading";
        state.message = "";
      })
      .addCase(getAllTransactions.fulfilled, (state, action) => {
        state.status = "success";
        state.transactions = action.payload.transactions;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(getAllTransactions.rejected, (state, action) => {
        state.status = "failed";
        state.message = action.payload as string;
      })
      
      // Get User Transactions
      .addCase(getUserTransactions.pending, (state) => {
        state.status = "loading";
        state.message = "";
      })
      .addCase(getUserTransactions.fulfilled, (state, action) => {
        state.status = "success";
        state.transactions = action.payload.transactions;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(getUserTransactions.rejected, (state, action) => {
        state.status = "failed";
        state.message = action.payload as string;
      })
      
      // Get Transaction By ID
      .addCase(getTransactionById.pending, (state) => {
        state.status = "loading";
        state.message = "";
      })
      .addCase(getTransactionById.fulfilled, (state, action) => {
        state.status = "success";
        state.currentTransaction = action.payload;
      })
      .addCase(getTransactionById.rejected, (state, action) => {
        state.status = "failed";
        state.message = action.payload as string;
      })
      
      // Create Payment Order
      .addCase(createPaymentOrder.pending, (state) => {
        state.status = "loading";
        state.message = "";
      })
      .addCase(createPaymentOrder.fulfilled, (state, action) => {
        state.status = "success";
        state.currentTransaction = action.payload;
        state.message = "Payment order created successfully";
      })
      .addCase(createPaymentOrder.rejected, (state, action) => {
        state.status = "failed";
        state.message = action.payload as string;
      })
      
      // Verify Payment
      .addCase(verifyPayment.pending, (state) => {
        state.status = "loading";
        state.message = "";
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.status = "success";
        state.currentTransaction = action.payload;
        state.transactions.unshift(action.payload);
        state.message = "Payment verified successfully";
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.status = "failed";
        state.message = action.payload as string;
      })
      
      // Refund Transaction
      .addCase(refundTransaction.pending, (state) => {
        state.status = "loading";
        state.message = "";
      })
      .addCase(refundTransaction.fulfilled, (state, action) => {
        state.status = "success";
        const index = state.transactions.findIndex(t => t.id === action.payload.id || t._id === action.payload._id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
        if (state.currentTransaction?.id === action.payload.id) {
          state.currentTransaction = action.payload;
        }
        state.message = "Transaction refunded successfully";
      })
      .addCase(refundTransaction.rejected, (state, action) => {
        state.status = "failed";
        state.message = action.payload as string;
      })
      
      // Get Transaction Stats
      .addCase(getTransactionStats.pending, (state) => {
        state.status = "loading";
        state.message = "";
      })
      .addCase(getTransactionStats.fulfilled, (state, action) => {
        state.status = "success";
      })
      .addCase(getTransactionStats.rejected, (state, action) => {
        state.status = "failed";
        state.message = action.payload as string;
      });
  },
});

export const transactionReducer = transactionSlice.reducer;
export const { clearTransactionError, clearCurrentTransaction } = transactionSlice.actions;
