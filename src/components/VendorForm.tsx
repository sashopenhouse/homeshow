"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function VendorForm() {
  const [step, setStep] = useState(1);

  // In a real scenario, this would use react-hook-form + zod + Supabase insertion
  return (
    <div className="max-w-2xl w-full mx-auto p-8 rounded-none border bg-card text-card-foreground shadow-xl relative overflow-hidden">
      {/* Step indicator */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 flex-1 rounded-none transition-all duration-500 ${
              s <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      <div className="relative">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold mb-4">Company Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Company Name</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-none border bg-background"
                  placeholder="Acme Home Solutions"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Industry Category</label>
                <select className="w-full p-3 rounded-none border bg-background">
                  <option>Landscaping</option>
                  <option>Interior Design</option>
                  <option>Roofing & Windows</option>
                  <option>General Contracting</option>
                </select>
              </div>
              <Button className="w-full mt-4 rounded-none" onClick={() => setStep(2)}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold mb-4">Contact Person</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Full Name</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-none border bg-background"
                  placeholder="Jane Doe"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <input
                    type="email"
                    className="w-full p-3 rounded-none border bg-background"
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Phone</label>
                  <input
                    type="tel"
                    className="w-full p-3 rounded-none border bg-background"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <Button variant="outline" className="w-full rounded-none" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button className="w-full rounded-none" onClick={() => setStep(3)}>
                  Continue
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold mb-4">Booth Requirements</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Requested Size</label>
                <select className="w-full p-3 rounded-none border bg-background">
                  <option>10x10 Standard</option>
                  <option>10x20 Premium</option>
                  <option>20x20 Island</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Additional Requests</label>
                <textarea
                  className="w-full p-3 rounded-none border bg-background min-h-[100px]"
                  placeholder="Do you need power, corner placement, or water access?"
                />
              </div>
              <div className="flex gap-4 mt-4">
                <Button variant="outline" className="w-full rounded-none" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  className="w-full rounded-none"
                  onClick={() => {
                    alert("Application Submitted!");
                    setStep(1);
                  }}
                >
                  Submit Application
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
