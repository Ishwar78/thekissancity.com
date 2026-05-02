import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  city?: string;
  state?: string;
  address?: string;
  loadCapacity?: string;
  commodity?: string;
  dryerType?: string;
  source: string;
  submittedAt: string;
}

const SolarInquiryManager = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const fetchInquiries = async () => {
    try {
      const res = await api('/api/inquiry/list');
      if (res.ok && res.json?.data) {
        setInquiries(res.json.data);
      }
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      const res = await api(`/api/inquiry/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Inquiry deleted');
        setInquiries(inquiries.filter(i => i._id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading inquiries...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#2d6a4f]">Form Inquiries</h2>
        <div className="text-sm text-gray-500">Total: {inquiries.length}</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No inquiries found
                </TableCell>
              </TableRow>
            ) : (
              inquiries.map((inquiry) => (
                <TableRow key={inquiry._id} className="hover:bg-gray-50/50">
                  <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(inquiry.submittedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">{inquiry.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs text-gray-600">
                      <span className="flex items-center gap-1"><Mail size={12} /> {inquiry.email}</span>
                      <span className="flex items-center gap-1 mt-1"><Phone size={12} /> {inquiry.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-gray-600">
                      {inquiry.city || inquiry.state ? (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {inquiry.city}{inquiry.city && inquiry.state ? ', ' : ''}{inquiry.state}
                        </span>
                      ) : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      inquiry.subject.includes('Solar') ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {inquiry.subject}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => setSelectedInquiry(inquiry)}
                          >
                            <Eye size={14} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-serif text-[#2d2117]">Inquiry Details</DialogTitle>
                          </DialogHeader>
                          {selectedInquiry && (
                            <div className="space-y-6 pt-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold uppercase text-gray-400">From</label>
                                  <p className="font-semibold text-lg">{selectedInquiry.name}</p>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold uppercase text-gray-400">Date</label>
                                  <p className="flex items-center gap-2"><Calendar size={14} /> {new Date(selectedInquiry.submittedAt).toLocaleString()}</p>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold uppercase text-gray-400">Contact</label>
                                  <div className="text-sm">
                                    <p className="flex items-center gap-2"><Mail size={14} /> {selectedInquiry.email}</p>
                                    <p className="flex items-center gap-2 mt-1"><Phone size={14} /> {selectedInquiry.phone}</p>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold uppercase text-gray-400">Location</label>
                                  <p className="flex items-center gap-2 text-sm"><MapPin size={14} /> {selectedInquiry.city || '-'}, {selectedInquiry.state || '-'}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold uppercase text-gray-400">Load Capacity</label>
                                  <p className="text-sm font-medium">{selectedInquiry.loadCapacity || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold uppercase text-gray-400">Commodity to Dry</label>
                                  <p className="text-sm font-medium">{selectedInquiry.commodity || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold uppercase text-gray-400">Dryer Type</label>
                                  <p className="text-sm font-medium">{selectedInquiry.dryerType || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold uppercase text-gray-400">Full Address</label>
                                  <p className="text-sm font-medium">{selectedInquiry.address || '-'}</p>
                                </div>
                              </div>

                              <div className="space-y-1 border-t pt-4">
                                <label className="text-[10px] font-bold uppercase text-gray-400">Message</label>
                                <div className="bg-gray-50 p-4 rounded-xl text-gray-700 whitespace-pre-wrap leading-relaxed italic">
                                  "{selectedInquiry.message}"
                                </div>
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-gray-400 uppercase tracking-widest">
                                <span>Source: {selectedInquiry.source}</span>
                                <span>ID: {selectedInquiry._id}</span>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(inquiry._id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SolarInquiryManager;
