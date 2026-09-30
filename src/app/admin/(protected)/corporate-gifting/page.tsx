import { adminGetCorporateGiftingItems } from "@/admin/actions/corporate-gifting";
import CorporateGiftingManager from "@/admin/components/corporate-gifting/CorporateGiftingManager";

export default async function AdminCorporateGiftingPage() {
  const items = await adminGetCorporateGiftingItems();
  return <CorporateGiftingManager initialItems={items} />;
}
