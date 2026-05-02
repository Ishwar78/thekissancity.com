import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const solarInquirySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10,}$/, "Phone must be at least 10 digits"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  address: z.string().min(5, "Full address is required"),
  loadCapacity: z.string().min(1, "Load capacity is required"),
  commodity: z.string().min(1, "Commodity to dry is required"),
  dryerType: z.string().min(1, "Dryer type is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type SolarInquiryData = z.infer<typeof solarInquirySchema>;

export const InquiryFormSolar: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SolarInquiryData>({
    resolver: zodResolver(solarInquirySchema),
  });

  const onSubmit = async (data: SolarInquiryData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/inquiry/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          subject: "Solar Drying Inquiry",
          source: "solar-drying-page",
        }),
      });

      if (response.ok) {
        toast.success("Inquiry sent successfully! We will contact you soon.");
        reset();
      } else {
        toast.error("Failed to send inquiry. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <Input {...register("name")} placeholder="Enter your name" className={errors.name ? "border-red-500" : ""} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <Input type="email" {...register("email")} placeholder="Enter your email" className={errors.email ? "border-red-500" : ""} />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No</label>
          <Input {...register("phone")} placeholder="10-digit mobile number" className={errors.phone ? "border-red-500" : ""} />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <Input {...register("city")} placeholder="Your city" className={errors.city ? "border-red-500" : ""} />
          {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <Input {...register("state")} placeholder="Your state" className={errors.state ? "border-red-500" : ""} />
          {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>}
        </div>
      </div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Load Capacity</label>
    <Input {...register("loadCapacity")} placeholder="e.g. 50kg, 100kg" />
    {errors.loadCapacity && <p className="text-xs text-red-500">{errors.loadCapacity.message}</p>}
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Commodity to Dry</label>
    <Input {...register("commodity")} placeholder="e.g. Fruits, Vegetables" />
    {errors.commodity && <p className="text-xs text-red-500">{errors.commodity.message}</p>}
  </div>
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Type of Dryer Required</label>
  <Input {...register("dryerType")} placeholder="e.g. Solar Cabinet, Tunnel Dryer" />
  {errors.dryerType && <p className="text-xs text-red-500">{errors.dryerType.message}</p>}
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Location / Address</label>
  <Textarea {...register("address")} placeholder="Enter full address" rows={3} />
  {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
</div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <Textarea 
          {...register("message")} 
          placeholder="Any other information..." 
          rows={4}
          className={errors.message ? "border-red-500" : ""} 
        />
        {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] text-white py-6 text-lg font-bold rounded-xl shadow-lg transition-all active:scale-95">
        {isSubmitting ? "Sending..." : "Submit Inquiry"}
      </Button>
    </form>
  );
};
