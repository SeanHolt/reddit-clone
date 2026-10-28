import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CreateAssetForm } from "@/components/marketplace/CreateAssetForm";

export const instant = false;

export default async function CreateAssetPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="py-8 max-w-xl mx-auto space-y-6 px-4 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 select-none">
          🎨 Asset Creator Studio
        </h1>
        <p className="text-sm font-semibold text-gray-400 dark:text-gray-400 mt-1">
          Design, price, and publish your custom visual cosmetics straight into the global community storefront.
        </p>
      </div>

      {/* Render the complete type-safe creation form fields block */}
      <CreateAssetForm />
    </div>
  );
}
