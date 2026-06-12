import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';
import { View } from 'react-native';

import { AppButton } from '@/shared/components/AppButton';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

import { AppText as Text } from '@/shared/components/AppText';
interface ErrorBoundaryProps {
 children: ReactNode;
}

interface ErrorBoundaryState {
 error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
 state: ErrorBoundaryState = { error: null };

 static getDerivedStateFromError(error: Error): ErrorBoundaryState {
 return { error };
 }

 componentDidCatch(error: Error, info: ErrorInfo) {
 console.error('Unhandled UI error', error, info.componentStack);
 }

 private handleRetry = () => {
 this.setState({ error: null });
 };

 render() {
 if (this.state.error) {
 return (
 <ScreenContainer scroll={false}>
 <View className="gap-4 py-8">
 <Text className="font-sans text-2xl font-bold text-on-surface">حدث خطأ غير متوقع</Text>
 <Text className="font-sans text-base leading-6 text-on-surface-variant">
 {this.state.error.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'}
 </Text>
 <AppButton onPress={this.handleRetry}>إعادة المحاولة</AppButton>
 </View>
 </ScreenContainer>
 );
 }

 return this.props.children;
 }
}
