import { BusinessProfileForm } from '@/components/settings/BusinessProfileForm';
import type { BusinessProfileFormData } from '@meit/shared/validators/settings';

// This is now a Server Component
export default async function BusinessProfilePage() {
  // TODO: Fetch merchant data from Supabase
  // For now, using placeholder data
  const initialData: Partial<BusinessProfileFormData> = {
    merchant_name: 'Mi Comercio',
    business_type: 'panaderia',
    phone: '+584121234567',
    address: '',
    business_hours_open: '09:00',
    business_hours_close: '18:00',
    logo_url: '',
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <BusinessProfileForm initialData={initialData} />
    </div>
  );
}
