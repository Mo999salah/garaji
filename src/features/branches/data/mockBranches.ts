import type { Branch } from '@/features/branches/types';

export const mockBranches: Branch[] = [
  {
    id: '00000000-0000-0000-0001-000000000001',
    name: 'الرياض — الفرع الرئيسي',
    city: 'الرياض',
    address: 'طريق الملك فهد، حي العليا',
    phone: '+966-11-000-0001',
    workingHours: 'السبت – الخميس: 8ص – 8م',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0001-000000000002',
    name: 'الرياض — الشرقية',
    city: 'الرياض',
    address: 'شارع الأمير محمد بن عبدالعزيز، حي الشرقية',
    phone: '+966-11-000-0002',
    workingHours: 'السبت – الخميس: 8ص – 6م',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0001-000000000003',
    name: 'جدة — الفرع الرئيسي',
    city: 'جدة',
    address: 'شارع التحلية، حي الروضة',
    phone: '+966-12-000-0003',
    workingHours: 'السبت – الخميس: 8ص – 8م',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
