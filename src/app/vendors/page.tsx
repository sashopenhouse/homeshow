import VendorForm from "@/components/VendorForm";

export default function VendorApplicationPage() {
  return (
    <main className="flex-1 flex flex-col p-8 bg-muted/10 min-h-screen">
      <div className="max-w-4xl mx-auto w-full mb-12 text-center mt-12">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">Become a Vendor</h1>
        <p className="text-xl text-muted-foreground">
          Join the premier Home Show at Nexus Center. Fill out the application below to reserve your space.
        </p>
      </div>
      <VendorForm />
    </main>
  );
}
