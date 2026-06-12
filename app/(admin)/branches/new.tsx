import { router } from 'expo-router';
import { Alert } from 'react-native';

import { BranchForm } from '@/features/branches/components/BranchForm';
import { useBranchStore } from '@/features/branches/store/useBranchStore';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function AdminBranchNewScreen() {
 const { addBranch, isLoading } = useBranchStore();

 return (
 <ScreenContainer scroll={false}>
 <BranchForm
 isLoading={isLoading}
 onSubmit={async (values) => {
 try {
 await addBranch(values);
 router.back();
 } catch {
 Alert.alert('خطأ', 'تعذّر إضافة الفرع. يرجى المحاولة مجدداً.');
 }
 }}
 submitLabel="إضافة الفرع"
 />
 </ScreenContainer>
 );
}
