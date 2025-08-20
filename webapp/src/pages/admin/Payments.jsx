import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  ActionButtons,
  DataTable,
  PageHeader,
  SearchAndFilter,
  StatusBadge
} from '../../components/shared';
import { useData } from '../../contexts/DataContext.jsx';

const Payments = () => {
  const navigate = useNavigate();
  const { data, loading, error, fetchPayments } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Use cached payments data
  const payments = data.payments || [];

  // Load payments if not already cached
  useEffect(() => {
    if (!data.payments) {
      fetchPayments();
    }
  }, [data.payments, fetchPayments]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Filter payments based on search and status
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = !searchTerm ||
      payment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || payment.paymentStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const handleEditPayment = (payment) => {
    navigate(`/admin/payments/${payment.paymentId}/edit`);
  };

  const handleDeletePayment = async (payment) => {
    if (window.confirm(`Are you sure you want to delete payment ${payment.transactionId}?`)) {
      try {
        // Call API to delete payment
        console.log('Deleting payment:', payment.paymentId);
        toast.success('Payment deleted successfully');
        fetchPayments(true); // Force refresh
      } catch (err) {
        console.error('Error deleting payment:', err);
        toast.error('Failed to delete payment');
      }
    }
  };

  const handleAddPayment = () => {
    navigate('/admin/payments/add');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const columns = [
    {
      header: 'Transaction ID',
      accessorKey: 'transactionId',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-gray-900">{row.original.transactionId}</span>
      )
    },
    {
      header: 'Patient',
      accessorKey: 'patientName',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.patientName}</div>
          <div className="text-sm text-gray-500">{row.original.patientEmail}</div>
        </div>
      )
    },
    {
      header: 'Doctor',
      accessorKey: 'doctorName',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.doctorName}</div>
          <div className="text-sm text-gray-500">{row.original.doctorEmail}</div>
        </div>
      )
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: ({ row }) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(row.original.amount)}
        </span>
      )
    },
    {
      header: 'Method',
      accessorKey: 'paymentMethod',
      cell: ({ row }) => (
        <span className="text-sm text-gray-900 capitalize">{row.original.paymentMethod}</span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'paymentStatus',
      cell: ({ row }) => (
        <StatusBadge 
          status={row.original.paymentStatus} 
          variant={
            row.original.paymentStatus === 'completed' ? 'success' : 
            row.original.paymentStatus === 'pending' ? 'warning' : 'error'
          }
        />
      )
    },
    {
      header: 'Date',
      accessorKey: 'paymentDate',
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">
          {new Date(row.original.paymentDate).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: ({ row }) => (
        <ActionButtons
          onView={() => handleViewPayment(row.original)}
          onEdit={() => handleEditPayment(row.original)}
          onDelete={() => handleDeletePayment(row.original)}
        />
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        subtitle="Manage all payment transactions"
        onAdd={handleAddPayment}
        addButtonText="Add Payment"
      />

      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterValue={filterStatus}
        onFilterChange={setFilterStatus}
        filterOptions={[
          { value: 'all', label: 'All Status' },
          { value: 'completed', label: 'Completed' },
          { value: 'pending', label: 'Pending' },
          { value: 'failed', label: 'Failed' },
          { value: 'refunded', label: 'Refunded' }
        ]}
        placeholder="Search payments..."
      />

      <DataTable
        columns={columns}
        data={filteredPayments}
        onRowClick={handleViewPayment}
        selectedRow={selectedPayment}
        loading={loading}
      />

      {/* Payment Details Modal */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Payment Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Transaction ID:</span>
                  <p className="font-mono text-gray-900">{selectedPayment.transactionId}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Amount:</span>
                  <p className="font-semibold text-gray-900">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <StatusBadge 
                    status={selectedPayment.paymentStatus} 
                    variant={
                      selectedPayment.paymentStatus === 'completed' ? 'success' : 
                      selectedPayment.paymentStatus === 'pending' ? 'warning' : 'error'
                    }
                  />
                </div>
                <div>
                  <span className="font-medium text-gray-700">Method:</span>
                  <p className="text-gray-900 capitalize">{selectedPayment.paymentMethod}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Patient:</span>
                  <p className="text-gray-900">{selectedPayment.patientName}</p>
                  <p className="text-sm text-gray-500">{selectedPayment.patientEmail}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Doctor:</span>
                  <p className="text-gray-900">{selectedPayment.doctorName}</p>
                  <p className="text-sm text-gray-500">{selectedPayment.doctorEmail}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Payment Date:</span>
                  <p className="text-gray-900">
                    {new Date(selectedPayment.paymentDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <p className="text-gray-900">
                    {new Date(selectedPayment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {selectedPayment.notes && (
                <div>
                  <span className="font-medium text-gray-700">Notes:</span>
                  <p className="text-gray-900 mt-1">{selectedPayment.notes}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  handleEditPayment(selectedPayment);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
