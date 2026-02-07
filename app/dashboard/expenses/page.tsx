"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ExpenseModal } from "@/components/expenses/expense-modal";
import { ExpenseList } from "@/components/expenses/expense-list";
import { SummaryCard } from "@/components/expenses/summary-card";
import { useExpenses } from "@/hooks/use-expenses";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Plus,
  Filter,
  Wallet,
  CheckCircle2,
  Calendar,
  ReceiptIndianRupee,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Expense } from "@/lib/firebase/expenses";
import { Input } from "@/components/ui/input";

export default function ExpensesPage() {
  const { expenses, addExpense, updateExpense, deleteExpense, totals } =
    useExpenses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [datePreset, setDatePreset] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const handleOpenModal = (expense?: Expense) => {
    setEditingExpense(expense || null);
    setIsModalOpen(true);
  };

  const clearDateFilter = () => {
    setDatePreset(null);
    setDateFrom("");
    setDateTo("");
  };

  const filteredExpenses = useMemo(() => {
    let result = expenses;

    if (datePreset || dateFrom || dateTo) {
      result = result.filter((exp) => {
        const expDate = new Date(exp.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (datePreset) {
          switch (datePreset) {
            case "today":
              return expDate.toDateString() === today.toDateString();
            case "yesterday": {
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              return expDate.toDateString() === yesterday.toDateString();
            }
            case "thisMonth":
              return (
                expDate.getMonth() === today.getMonth() &&
                expDate.getFullYear() === today.getFullYear()
              );
            case "last30days": {
              const last30 = new Date(today);
              last30.setDate(last30.getDate() - 30);
              return expDate >= last30;
            }
            default:
              return true;
          }
        } else if (dateFrom || dateTo) {
          const from = dateFrom ? new Date(dateFrom) : null;
          const to = dateTo ? new Date(dateTo) : null;

          if (from) from.setHours(0, 0, 0, 0);
          if (to) to.setHours(23, 59, 59, 999);

          return (!from || expDate >= from) && (!to || expDate <= to);
        }

        return true;
      });
    }

    return result;
  }, [expenses, datePreset, dateFrom, dateTo]);

  return (
    <div className="min-h-screen bg-white">
      <div className="relative p-6 lg:p-8 space-y-8 max-w-350 mx-auto">
        {/* Hero Section */}
        <div className="relative mb-10">
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-col items-start gap-2">
                <h1 className="flex justify-start items-center gap-2 text-lg lg:text-xl font-bold tracking-tight">
                  <div className="relative p-2 bg-primary rounded-md">
                    <Wallet className="h-4 w-4 text-white" />
                  </div>
                  Expense Tracker
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Track and manage your business expenses
                </p>
              </div>
            </div>

            {/* Add Expense Button */}
            <Button
              onClick={() => handleOpenModal()}
              size="lg"
              className="group relative overflow-hidden hover:scale-105 px-8 w-full lg:w-auto"
            >
              <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">Add Expense</span>
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Tital Expenses */}
          <div className="border border-slate-200 rounded-xl p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Total Expenses
                </p>
                <p className="text-slate-600 font-semibold">All Time</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <ReceiptIndianRupee className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {totals.totalWithGst}
            </div>
          </div>

          {/* <SummaryCard totalExpenses={totals.totalWithGst} /> */}
        </div>

        {/* Expense List Section */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex justify-between items-center gap-2 w-full">
              <h2 className="text-sm font-semibold text-slate-700">
                Transaction History
              </h2>
              <div className="flex justify-end">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "border-slate-300",
                        (datePreset || dateFrom || dateTo) &&
                          "border-primary text-primary",
                      )}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Date Filter
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    align="end"
                    className="w-96 p-6 bg-white border border-slate-200 rounded-xl"
                  >
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="font-semibold">Filter by Date</h3>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: "All", value: null },
                          { label: "Today", value: "today" },
                          { label: "Yesterday", value: "yesterday" },
                          { label: "This Month", value: "thisMonth" },
                          { label: "Last 30 days", value: "last30days" },
                        ].map((item) => (
                          <Button
                            key={item.label}
                            size="sm"
                            variant={
                              datePreset === item.value ? "default" : "outline"
                            }
                            onClick={() => {
                              setDatePreset(item.value);
                              setDateFrom("");
                              setDateTo("");
                            }}
                          >
                            {item.label}
                          </Button>
                        ))}
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-200">
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => {
                              setDateFrom(e.target.value);
                              setDatePreset(null);
                            }}
                          />
                          <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => {
                              setDateTo(e.target.value);
                              setDatePreset(null);
                            }}
                          />
                        </div>
                      </div>

                      {(datePreset || dateFrom || dateTo) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearDateFilter}
                          className="w-full text-red-600 border-red-200"
                        >
                          Clear Filter
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {filteredExpenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Wallet className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-slate-800">
                    No expenses found
                  </h3>
                  <p className="text-sm text-slate-600">
                    {datePreset || dateFrom || dateTo
                      ? "Try adjusting your date filter"
                      : "Start tracking expenses by adding your first one"}
                  </p>
                </div>
                <Button onClick={() => handleOpenModal()} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </div>
            ) : (
              <ExpenseList
                expenses={filteredExpenses}
                onEdit={handleOpenModal}
                onDelete={deleteExpense}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingExpense}
        onSave={(data) => {
          if (editingExpense) {
            updateExpense(
              editingExpense.id,
              data as Partial<Omit<Expense, "id" | "createdAt">>,
            );
          } else {
            addExpense(data as Omit<Expense, "id" | "createdAt" | "updatedAt">);
          }
          setIsModalOpen(false);
          setEditingExpense(null);
        }}
      />
    </div>
  );
}
