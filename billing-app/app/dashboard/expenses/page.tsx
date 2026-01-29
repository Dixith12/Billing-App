"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ExpenseModal } from "@/components/expenses/expense-modal";
import { ExpenseList } from "@/components/expenses/expense-list";
import { SummaryCard } from "@/components/expenses/summary-card";
import { useExpenses } from "@/app/dashboard/expenses/hooks/useExpenses";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Plus,
  Filter,
  Wallet,
  Sparkles,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Expense } from "@/lib/firebase/expenses";
import { Input } from "@/components/ui/input";

export default function ExpensesPage() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses();
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

  const filteredTotal = filteredExpenses.reduce(
    (sum, exp) => sum + exp.amount,
    0,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Decorative background blobs – violet/purple/indigo theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative p-6 lg:p-8 space-y-10 max-w-[1400px] mx-auto">
        {/* Floating Hero Card – same premium style as GST / Customers / Inventory */}
        <div className="relative">
          {/* Glow background */}
          <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl blur-2xl"></div>

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 lg:p-8 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl blur-lg opacity-40"></div>
                  <div className="relative p-3 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl shadow-lg">
                    <Wallet className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-700 bg-clip-text text-transparent tracking-tight">
                    Expense Tracker
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    Track and manage your business expenses
                  </p>
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-2 text-sm pl-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-slate-600">
                  System configured and active
                </span>
              </div>
            </div>

            {/* Add Expense Button */}
            <Button
              onClick={() => handleOpenModal()}
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-8"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">Add Expense</span>
            </Button>
          </div>
        </div>

        {/* Date Filter & Summary */}
        <div className="relative space-y-6">
          {/* Date Filter */}
          <div className="flex justify-end">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "group relative overflow-hidden border-slate-300 hover:border-violet-400 transition-all duration-300 shadow-sm hover:shadow-md",
                    datePreset || dateFrom || dateTo
                      ? "bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 border-violet-300"
                      : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  {/* Subtle hover glow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md pointer-events-none"></div>

                  <span className="relative flex items-center gap-2 font-medium">
                    Date Filter
                    <Filter
                      className={cn(
                        "h-4 w-4 transition-all duration-300",
                        datePreset || dateFrom || dateTo
                          ? "text-violet-600 scale-110"
                          : "text-slate-500 group-hover:text-violet-600 group-hover:scale-110",
                      )}
                    />
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-96 p-6 bg-white border border-slate-200 shadow-2xl rounded-xl"
                align="end"
              >
                <div className="space-y-6">
                  {/* Header with gradient icon */}
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-700 bg-clip-text text-transparent">
                      Filter by Date
                    </h3>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "All", value: null },
                      { label: "Today", value: "today" },
                      { label: "Yesterday", value: "yesterday" },
                      { label: "This Month", value: "thisMonth" },
                      { label: "Last 30 days", value: "last30days" },
                    ].map((item) => (
                      <Button
                        key={item.value ?? "all"}
                        variant={
                          datePreset === item.value ? "default" : "outline"
                        }
                        size="sm"
                        className={cn(
                          "transition-all duration-300 shadow-sm",
                          datePreset === item.value &&
                            "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white",
                        )}
                        onClick={() => {
                          setDatePreset(item.value);
                          if (item.value) {
                            setDateFrom("");
                            setDateTo("");
                          }
                        }}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>

                  {/* Custom Range Section */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                      Custom Date Range
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-violet-600" />
                          From
                        </label>
                        <Input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => {
                            setDateFrom(e.target.value);
                            setDatePreset(null);
                          }}
                          className="border-slate-300 focus:border-violet-500 focus:ring-violet-200 h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-violet-600" />
                          To
                        </label>
                        <Input
                          type="date"
                          value={dateTo}
                          onChange={(e) => {
                            setDateTo(e.target.value);
                            setDatePreset(null);
                          }}
                          className="border-slate-300 focus:border-violet-500 focus:ring-violet-200 h-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Clear Filter Button */}
                  {(datePreset || dateFrom || dateTo) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearDateFilter}
                      className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors mt-2"
                    >
                      Clear Date Filter
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Summary Card */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <SummaryCard totalExpenses={filteredTotal} />
            </div>
          </div>
        </div>

        {/* Expense List Section */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"></div>
            <h2 className="text-lg font-semibold text-slate-700">
              Transaction History
            </h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {filteredExpenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="p-4 bg-violet-100 rounded-full">
                  <Wallet className="h-8 w-8 text-violet-600" />
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
                <Button
                  onClick={() => handleOpenModal()}
                  className="mt-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                >
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
            updateExpense(editingExpense.id, data);
          } else {
            addExpense(data);
          }
          setIsModalOpen(false);
          setEditingExpense(null);
        }}
      />
    </div>
  );
}
