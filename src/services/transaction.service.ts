import axiosInstance from "@/lib/axios";
import type {
  ApiResponse,
  Transaction,
  CreateTransactionRequest,
} from "./types";

export const transactionService = {
  /**
   * Create new transaction
   */
  async createTransaction(data: CreateTransactionRequest): Promise<ApiResponse<Transaction>> {
    const response = await axiosInstance.post<ApiResponse<Transaction>>("/transaction", data);
    return response.data;
  },

  /**
   * Get user's transactions
   */
  async getMyTransactions(): Promise<ApiResponse<Transaction[]>> {
    const response = await axiosInstance.get<ApiResponse<Transaction[]>>("/transaction/my-transactions");
    return response.data;
  },

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string): Promise<ApiResponse<Transaction>> {
    const response = await axiosInstance.get<ApiResponse<Transaction>>(`/transaction/${id}`);
    return response.data;
  },

  /**
   * Get all transactions (admin only)
   */
  async getAllTransactions(): Promise<ApiResponse<Transaction[]>> {
    const response = await axiosInstance.get<ApiResponse<Transaction[]>>("/transaction/all");
    return response.data;
  },
};
